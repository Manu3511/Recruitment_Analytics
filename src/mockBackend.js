// MOCK BACKEND — drop-in replacement for the Supabase/Render calls in
// App.js, backed entirely by the bundled demoData.json + localStorage.
// No network calls, no real accounts, no live IVR. Implements the subset
// of PostgREST query syntax (select/order/limit/eq/neq/in/is.null/gte/lte/
// ilike) that the real app actually uses, plus JS equivalents of the three
// custom Postgres RPCs (link_candidate_to_opening, auto_link_or_create_opening,
// update_own_last_seen) and the handful of FastAPI routes the UI calls
// (send-to-ivr, test-call, create-user, reset-password).

import demoData from "./demoData.json";

const STORAGE_KEY = "hireflow_demo_db_v1";
const AUTH_KEY = "hireflow_demo_session_v1";

const DEMO_LOGINS = {
  "admin@demo.hireflow": { password: "demo1234", userId: "user-admin" },
  "manager@demo.hireflow": { password: "demo1234", userId: "user-manager" },
  "hr1@demo.hireflow": { password: "demo1234", userId: "user-hr1" },
  "hr2@demo.hireflow": { password: "demo1234", userId: "user-hr2" },
  "ceo@demo.hireflow": { password: "demo1234", userId: "user-ceo" },
};

function freshDB() {
  return {
    companies: [...demoData.companies],
    processes: [...demoData.processes],
    position_types: [...demoData.positionTypes],
    lead_sources: [...demoData.leadSources],
    rejection_reasons: [...demoData.rejectionReasons],
    funnel_stages: [...demoData.funnelStages],
    user_roles: [...demoData.users],
    candidates: [...demoData.candidates],
    candidate_activity: [...demoData.candidateActivity],
    position_openings: [...demoData.positionOpenings],
    call_logs: [...demoData.callLogs],
    dnd_list: [...demoData.dndList],
    candidate_updates: [...demoData.candidateUpdates],
    settings: [...demoData.settings],
    leads: [],
    caller_ids: [{ id: "caller-1", number: "+918071579999", label: "Default Caller ID", is_active: true, added_at: new Date().toISOString() }],
    audio_files: [
      { id: "aud-1", key: "intro", label: "Intro Message", url: "" },
      { id: "aud-2", key: "interested", label: "Interested Response", url: "" },
      { id: "aud-3", key: "not_interested", label: "Not Interested Response", url: "" },
    ],
    campaigns: [],
  };
}

function loadDB() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return freshDB();
}

let DB = loadDB();
let idSeq = 1;

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); } catch {}
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  DB = freshDB();
  persist();
}

function nextId(table) {
  idSeq += 1;
  return `${table}-${Date.now()}-${idSeq}`;
}

function delay() { return new Promise((r) => setTimeout(r, 120 + Math.random() * 180)); }

// ---- Query string parsing: the subset of PostgREST this app uses ----
function parseParams(paramStr) {
  const params = new URLSearchParams((paramStr || "").replace(/^\?/, ""));
  const filters = [];
  let select = null, order = null, limit = null;
  for (const [key, value] of params.entries()) {
    if (key === "select") select = value.split(",");
    else if (key === "order") order = value;
    else if (key === "limit") limit = parseInt(value, 10);
    else if (key === "on_conflict") { /* handled by caller via opts */ }
    else filters.push([key, value]);
  }
  return { filters, select, order, limit };
}

function matchFilter(row, key, rawValue) {
  const value = decodeURIComponent(rawValue);
  const val = row[key];
  if (value.startsWith("eq.")) return String(val) === value.slice(3);
  if (value.startsWith("neq.")) return String(val) !== value.slice(4);
  if (value === "is.null") return val === null || val === undefined;
  if (value === "not.is.null") return val !== null && val !== undefined;
  if (value.startsWith("gte.")) return val >= value.slice(4);
  if (value.startsWith("lte.")) return val <= value.slice(4);
  if (value.startsWith("gt.")) return val > value.slice(3);
  if (value.startsWith("lt.")) return val < value.slice(3);
  if (value.startsWith("in.(") && value.endsWith(")")) {
    const list = value.slice(4, -1).split(",");
    return list.includes(String(val));
  }
  if (value.startsWith("ilike.")) {
    const pattern = value.slice(6).replace(/\*/g, "").toLowerCase();
    return String(val || "").toLowerCase().includes(pattern);
  }
  return true;
}

function applyFilters(rows, filters) {
  return rows.filter((row) => filters.every(([key, value]) => matchFilter(row, key, value)));
}

function applyOrder(rows, order) {
  if (!order) return rows;
  const parts = order.split(",");
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const part of parts) {
      const desc = part.endsWith(".desc");
      const col = part.replace(/\.(desc|asc)$/, "");
      const av = a[col], bv = b[col];
      if (av === bv) continue;
      if (av === null || av === undefined) return desc ? 1 : -1;
      if (bv === null || bv === undefined) return desc ? -1 : 1;
      return (av > bv ? 1 : -1) * (desc ? -1 : 1);
    }
    return 0;
  });
  return sorted;
}

function project(rows, select) {
  if (!select || select.includes("*")) return rows.map((r) => ({ ...r }));
  return rows.map((row) => {
    const out = {};
    select.forEach((col) => { out[col] = row[col]; });
    return out;
  });
}

// ---- CRUD, matching dbSelect/dbInsert/dbUpdate/dbDelete/dbInsertIgnoreDup signatures ----
export async function mockSelect(table, params = "") {
  await delay();
  const { filters, select, order, limit } = parseParams(params);
  let rows = DB[table] || [];
  rows = applyFilters(rows, filters);
  rows = applyOrder(rows, order);
  if (limit) rows = rows.slice(0, limit);
  return project(rows, select);
}

export async function mockInsert(table, body) {
  await delay();
  const arr = Array.isArray(body) ? body : [body];
  if (!DB[table]) DB[table] = [];
  const inserted = arr.map((item) => {
    const row = { id: nextId(table), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...item };
    DB[table].push(row);
    return row;
  });
  persist();
  return inserted;
}

export async function mockInsertIgnoreDup(table, body, conflictCol) {
  await delay();
  const arr = Array.isArray(body) ? body : [body];
  if (!DB[table]) DB[table] = [];
  const existing = new Set(DB[table].map((r) => r[conflictCol]));
  const inserted = [];
  arr.forEach((item) => {
    if (existing.has(item[conflictCol])) return;
    const row = { id: nextId(table), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...item };
    DB[table].push(row);
    existing.add(item[conflictCol]);
    inserted.push(row);
  });
  persist();
  return inserted;
}

export async function mockUpdate(table, match, body) {
  await delay();
  const { filters } = parseParams("?" + match);
  const rows = DB[table] || [];
  const updated = [];
  rows.forEach((row) => {
    if (filters.every(([key, value]) => matchFilter(row, key, value))) {
      Object.assign(row, body);
      updated.push(row);
    }
  });
  persist();
  return updated;
}

export async function mockDelete(table, match) {
  await delay();
  const { filters } = parseParams("?" + match);
  DB[table] = (DB[table] || []).filter((row) => !filters.every(([key, value]) => matchFilter(row, key, value)));
  persist();
  return [];
}

// ---- RPCs ----
function insertActivity(candidateId, type, isContact, fromStage, toStage, remark, changedBy) {
  const row = { id: nextId("candidate_activity"), candidate_id: candidateId, type, is_contact_attempt: isContact, from_stage_id: fromStage || null, to_stage_id: toStage || null, remark: remark || null, changed_by: changedBy || null, changed_at: new Date().toISOString() };
  DB.candidate_activity.push(row);
  return row;
}

async function rpcLinkCandidateToOpening({ p_candidate_id, p_opening_id, p_actor }) {
  const opening = DB.position_openings.find((o) => o.id === p_opening_id);
  if (!opening) throw new Error("Opening not found");
  const candidate = DB.candidates.find((c) => c.id === p_candidate_id);
  candidate.filled_opening_id = p_opening_id;
  candidate.filled_at = new Date().toISOString();
  candidate.filled_by = p_actor;
  insertActivity(p_candidate_id, "NOTE", false, null, null, "Linked to opening", p_actor);
  const filledCount = DB.candidates.filter((c) => c.filled_opening_id === p_opening_id).length;
  let closed = false;
  if (opening.status === "OPEN" && filledCount >= opening.target_count) {
    opening.status = "CLOSED";
    opening.closed_at = new Date().toISOString();
    opening.closed_by = p_actor;
    closed = true;
  }
  persist();
  return [{ closed, filled_count: filledCount, target_count: opening.target_count }];
}

async function rpcAutoLinkOrCreateOpening({ p_candidate_id, p_company_id, p_process_id, p_position_type_id, p_actor, p_opened_at, p_target_count }) {
  let opening = DB.position_openings.find((o) => o.status === "OPEN" && o.company_id === p_company_id && o.process_id === p_process_id && o.position_type_id === p_position_type_id);
  let wasCreated = false;
  if (!opening) {
    opening = { id: nextId("position_openings"), company_id: p_company_id, process_id: p_process_id, position_type_id: p_position_type_id, target_count: Math.max(p_target_count || 1, 1), status: "OPEN", note: null, created_by: p_actor, created_at: p_opened_at || new Date().toISOString(), closed_at: null, closed_by: null };
    DB.position_openings.push(opening);
    wasCreated = true;
  }
  const [{ closed, filled_count, target_count }] = await rpcLinkCandidateToOpening({ p_candidate_id, p_opening_id: opening.id, p_actor });
  return [{ opening_id: opening.id, was_created: wasCreated, closed, filled_count, target_count }];
}

async function rpcUpdateOwnLastSeen({}, actorId) {
  const u = DB.user_roles.find((x) => x.id === actorId);
  if (u) u.last_seen = new Date().toISOString();
  persist();
  return null;
}

export async function mockRpc(fn, body = {}) {
  await delay();
  const session = getSession();
  const actorId = session?.userId;
  if (fn === "link_candidate_to_opening") return rpcLinkCandidateToOpening(body);
  if (fn === "auto_link_or_create_opening") return rpcAutoLinkOrCreateOpening(body);
  if (fn === "update_own_last_seen") return rpcUpdateOwnLastSeen(body, actorId);
  throw new Error(`Unknown demo RPC: ${fn}`);
}

// ---- Auth (fixed demo accounts, no real Supabase session) ----
export function getSession() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
}

export async function mockSignIn(email, password) {
  await delay();
  const lower = email.trim().toLowerCase();
  const login = DEMO_LOGINS[lower];
  if (!login || login.password !== password) throw new Error("Invalid demo credentials — try admin@demo.hireflow / demo1234");
  const user = DB.user_roles.find((u) => u.id === login.userId);
  const session = { email: lower, userId: login.userId, role: user.role, name: user.name, loginAt: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function mockSignOut() {
  localStorage.removeItem(AUTH_KEY);
}

// ---- FastAPI-route equivalents (renderFetch call sites) ----
export async function mockRenderFetch(path, options = {}) {
  await delay();
  const session = getSession();
  const actorId = session?.userId;

  if (path === "/hireflow/send-to-ivr") {
    const { candidate_id } = JSON.parse(options.body || "{}");
    const candidate = DB.candidates.find((c) => c.id === candidate_id);
    if (!candidate) throw new Error("Candidate not found");
    if (candidate.ivr_next_attempt_at) throw new Error("IVR call already scheduled for this candidate");
    if (DB.dnd_list.some((d) => d.phone === candidate.phone)) throw new Error("This number is on the DND list — can't send to IVR");
    const minutes = 30;
    candidate.ivr_next_attempt_at = new Date(Date.now() + minutes * 60000).toISOString();
    candidate.ivr_retry_count = 0;
    insertActivity(candidate_id, "NOTE", false, null, null, `IVR call scheduled in ${minutes} min`, actorId);
    // Demo speed-up: resolve the "call" after 8 real seconds instead of 30
    // real minutes, so a visitor clicking the button actually sees it land.
    setTimeout(() => simulateIvrOutcome(candidate_id), 8000);
    persist();
    return { message: `IVR call scheduled in ${minutes} minutes (demo resolves in ~8s)` };
  }
  if (path === "/test-call") {
    return { message: "Demo mode — no real call is placed.", status_code: 200 };
  }
  if (path === "/auth/create-user" || path === "/auth/reset-password" || path === "/auth/delete-user" || path === "/auth/save-password-history") {
    return { message: "Demo mode — account management is disabled in this public demo." };
  }
  if (path.startsWith("/campaign/")) {
    return { message: "Demo mode — bulk campaign dialing is disabled in this public demo." };
  }
  return { message: "ok" };
}

function simulateIvrOutcome(candidateId) {
  const candidate = DB.candidates.find((c) => c.id === candidateId);
  if (!candidate) return;
  const outcomes = ["INTERESTED", "NOT_INTERESTED", "NO_RESPONSE", "BUSY"];
  const weights = [0.25, 0.2, 0.4, 0.15];
  let r = Math.random(), sub = outcomes[outcomes.length - 1];
  for (let i = 0; i < outcomes.length; i++) { if (r < weights[i]) { sub = outcomes[i]; break; } r -= weights[i]; }
  DB.call_logs.push({ id: nextId("call_logs"), phone: candidate.phone, call_uuid: nextId("uuid"), campaign: "HireFlow", main_disposition: sub === "BUSY" ? "NOT_CONNECTED" : "CONNECTED", sub_disposition: sub, logged_at: new Date().toISOString(), was_answered: sub !== "BUSY" });
  const stageMap = { INTERESTED: "stage-contacted", NOT_INTERESTED: "stage-not-interested" };
  insertActivity(candidateId, "IVR_SYNC", true, candidate.current_stage_id, stageMap[sub] || null, `IVR call result: ${sub}`, null);
  if (stageMap[sub]) {
    candidate.current_stage_id = stageMap[sub];
    if (sub === "NOT_INTERESTED") DB.dnd_list.push({ id: nextId("dnd_list"), phone: candidate.phone, reason: "NOT_INTERESTED", added_at: new Date().toISOString() });
  }
  candidate.ivr_next_attempt_at = null;
  candidate.updated_at = new Date().toISOString();
  persist();
}

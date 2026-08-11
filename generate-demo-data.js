// Generates a self-contained, fully fictional dataset for the public demo.
// Run once with `node generate-demo-data.js` — output is committed to the
// repo as src/demoData.json so the demo needs no backend at all.
const fs = require("fs");

function uid(prefix, n) { return `${prefix}-${n}`; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function iso(d) { return d.toISOString(); }

const FIRST_NAMES = ["Aarav","Vihaan","Aditya","Ishaan","Kabir","Rohan","Arjun","Dev","Karthik","Manav",
  "Ananya","Diya","Ishita","Kavya","Meera","Nisha","Priya","Riya","Sanya","Tara",
  "Vikram","Rahul","Sameer","Nikhil","Varun","Pooja","Neha","Shreya","Divya","Anjali"];
const LAST_NAMES = ["Sharma","Verma","Patel","Reddy","Nair","Iyer","Menon","Rao","Gupta","Kumar",
  "Singh","Das","Bose","Chatterjee","Pillai","Shetty","Naidu","Joshi","Desai","Mehta"];

function fakeName() { return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`; }
function fakePhone(i) { return `9${String(100000000 + i * 37 + 12345).slice(0, 9)}`; }

const companies = [
  { id: "co-1", name: "Nova Retail Group", is_active: true, created_at: iso(daysAgo(180)) },
  { id: "co-2", name: "Brightline Finance", is_active: true, created_at: iso(daysAgo(170)) },
  { id: "co-3", name: "Zenith Logistics", is_active: true, created_at: iso(daysAgo(160)) },
];

const processes = [
  { id: "proc-1", name: "Inbound Support", is_active: true },
  { id: "proc-2", name: "Outbound Sales", is_active: true },
  { id: "proc-3", name: "Field Collections", is_active: true },
  { id: "proc-4", name: "Command Center Ops", is_active: true },
];

const positionTypes = [
  { id: "pos-1", name: "Calling Executive", is_active: true },
  { id: "pos-2", name: "Field Associate", is_active: true },
  { id: "pos-3", name: "Team Lead", is_active: true },
  { id: "pos-4", name: "Inside Sales Associate", is_active: true },
];

const leadSources = [
  { id: "src-1", name: "IVR", is_active: true },
  { id: "src-2", name: "Referral", is_active: true },
  { id: "src-3", name: "Job Portal", is_active: true },
  { id: "src-4", name: "Walk-in", is_active: true },
];

const rejectionReasons = [
  { id: "rr-1", name: "Salary expectations too high", is_active: true },
  { id: "rr-2", name: "Not willing to relocate", is_active: true },
  { id: "rr-3", name: "Failed interview screening", is_active: true },
  { id: "rr-4", name: "Accepted another offer", is_active: true },
];

const funnelStages = [
  { id: "stage-new", name: "New", sort_order: 1, is_exit_stage: false, is_active: true },
  { id: "stage-contacted", name: "Contacted", sort_order: 2, is_exit_stage: false, is_active: true },
  { id: "stage-interview-sched", name: "Interview Scheduled", sort_order: 3, is_exit_stage: false, is_active: true },
  { id: "stage-interview-done", name: "Interview Done", sort_order: 4, is_exit_stage: false, is_active: true },
  { id: "stage-selected", name: "Selected/Offer", sort_order: 5, is_exit_stage: false, is_active: true },
  { id: "stage-hired", name: "Hired", sort_order: 6, is_exit_stage: true, is_active: true },
  { id: "stage-rejected", name: "Rejected", sort_order: 7, is_exit_stage: true, is_active: true },
  { id: "stage-not-interested", name: "Not Interested", sort_order: 8, is_exit_stage: true, is_active: true },
  { id: "stage-no-response", name: "No Response", sort_order: 9, is_exit_stage: true, is_active: true },
];

const users = [
  { id: "user-admin", user_id: "user-admin", email: "admin@demo.hireflow", name: "Demo Admin", role: "ADMIN", is_active: true, manager_id: null, theme: "dark", last_seen: iso(new Date()), created_at: iso(daysAgo(180)) },
  { id: "user-manager", user_id: "user-manager", email: "manager@demo.hireflow", name: "Demo Manager", role: "MANAGER", is_active: true, manager_id: null, theme: "dark", last_seen: iso(daysAgo(0)), created_at: iso(daysAgo(170)) },
  { id: "user-hr1", user_id: "user-hr1", email: "hr1@demo.hireflow", name: "Asha Kulkarni", role: "HR", is_active: true, manager_id: "user-manager", theme: "dark", last_seen: iso(daysAgo(0)), created_at: iso(daysAgo(160)) },
  { id: "user-hr2", user_id: "user-hr2", email: "hr2@demo.hireflow", name: "Ravi Kannan", role: "HR", is_active: true, manager_id: "user-manager", theme: "dark", last_seen: iso(daysAgo(1)), created_at: iso(daysAgo(150)) },
  { id: "user-ceo", user_id: "user-ceo", email: "ceo@demo.hireflow", name: "Demo CEO", role: "CEO", is_active: true, manager_id: null, theme: "dark", last_seen: iso(daysAgo(2)), created_at: iso(daysAgo(180)) },
];

const HR_IDS = ["user-hr1", "user-hr2"];

// ---- Candidates: 220 of them, spread across the last 60 days ----
const candidates = [];
const candidateActivity = [];
let actId = 0;
function addActivity(candId, type, isContact, fromStage, toStage, remark, changedBy, when) {
  actId++;
  candidateActivity.push({
    id: uid("act", actId), candidate_id: candId, type, is_contact_attempt: isContact,
    from_stage_id: fromStage || null, to_stage_id: toStage || null, remark: remark || null,
    changed_by: changedBy || null, changed_at: iso(when),
  });
}

// Weighted stage distribution: mostly resolved (concluded), some active pipeline
const STAGE_WEIGHTS = [
  ["stage-new", 10], ["stage-contacted", 18], ["stage-interview-sched", 10],
  ["stage-interview-done", 6], ["stage-selected", 4],
  ["stage-hired", 22], ["stage-rejected", 16], ["stage-not-interested", 10], ["stage-no-response", 24],
];
function weightedStage() {
  const total = STAGE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of STAGE_WEIGHTS) { if (r < w) return id; r -= w; }
  return "stage-new";
}

const positionOpenings = [];
let openingSeq = 0;
function makeOpening(companyId, processId, positionId, target, status, openedDaysAgo, closedDaysAgo, closedBy) {
  openingSeq++;
  const o = {
    id: uid("open", openingSeq), company_id: companyId, process_id: processId, position_type_id: positionId,
    target_count: target, status, note: null,
    created_by: "user-manager", created_at: iso(daysAgo(openedDaysAgo)),
    closed_at: status === "CLOSED" ? iso(daysAgo(closedDaysAgo)) : null,
    closed_by: status === "CLOSED" ? closedBy : null,
  };
  positionOpenings.push(o);
  return o;
}
// A handful of realistic requisitions
makeOpening("co-1", "proc-1", "pos-1", 6, "OPEN", 40, null, null);
makeOpening("co-2", "proc-2", "pos-4", 4, "OPEN", 25, null, null);
makeOpening("co-3", "proc-3", "pos-2", 3, "OPEN", 15, null, null);
const closedOpening1 = makeOpening("co-1", "proc-4", "pos-3", 2, "CLOSED", 55, 30, "user-admin");
const closedOpening2 = makeOpening("co-2", "proc-1", "pos-1", 5, "CLOSED", 50, 20, "user-manager");
const closedOpening3 = makeOpening("co-3", "proc-2", "pos-4", 3, "CLOSED", 45, 12, "user-admin");

let hiredCount = 0;
for (let i = 0; i < 220; i++) {
  const id = uid("cand", i + 1);
  const createdDaysAgo = randInt(0, 58);
  const createdAt = daysAgo(createdDaysAgo);
  const processId = pick(processes).id;
  const positionId = pick(positionTypes).id;
  const companyId = pick(companies).id;
  const assignedTo = Math.random() < 0.92 ? pick(HR_IDS) : null;
  const stageId = createdDaysAgo < 2 ? "stage-new" : weightedStage();
  const stage = funnelStages.find(s => s.id === stageId);
  const sourceId = pick(leadSources).id;

  const cand = {
    id, name: fakeName(), phone: fakePhone(i),
    current_salary: String(randInt(12, 25) * 1000), expected_salary: String(randInt(18, 35) * 1000),
    location: pick(["Bengaluru", "Hyderabad", "Chennai", "Pune", "Mumbai", "Delhi NCR"]),
    process_id: processId, position_type_id: positionId,
    language_ratings: { english: randInt(2, 5), hindi: randInt(2, 5) },
    intent: null, source_id: sourceId, current_stage_id: stageId,
    assigned_to: assignedTo, rejection_reason: null,
    linked_lead_campaign: Math.random() < 0.3 ? "HireFlow" : null,
    uploaded_by: "user-admin", created_at: iso(createdAt), updated_at: iso(daysAgo(randInt(0, createdDaysAgo))),
    ivr_next_attempt_at: null, ivr_retry_count: 0, rejection_reason_id: null,
    languages_spoken: "English, Hindi", interview_scheduled_at: null,
    assigned_at: assignedTo ? iso(createdAt) : null,
    pending_reassign_to: null, pending_reassign_note: null,
    filled_opening_id: null, remark: Math.random() < 0.2 ? pick(["Strong communication", "Follow up next week", "Referred by team", "Available immediately"]) : null,
    filled_at: null, filled_by: null, highlighted: Math.random() < 0.05, company_id: companyId,
  };

  addActivity(id, "ASSIGNMENT", false, null, null, assignedTo ? `Assigned to ${users.find(u=>u.id===assignedTo).name} on add` : null, "user-admin", createdAt);

  if (stageId !== "stage-new") {
    const contactedAt = daysAgo(Math.max(0, createdDaysAgo - randInt(1, 3)));
    addActivity(id, "CALL_ATTEMPT", true, "stage-new", "stage-contacted", "IVR call placed", null, contactedAt);
    if (Math.random() < 0.4) addActivity(id, "CALL_ATTEMPT", true, null, null, pick(["No answer, tried again", "Asked to call back later", "Discussed role details"]), assignedTo, daysAgo(Math.max(0, createdDaysAgo - randInt(3, 6))));
  }

  if (stage.is_exit_stage) {
    const concludedAt = daysAgo(Math.max(0, createdDaysAgo - randInt(4, 20)));
    if (stageId === "stage-hired") {
      cand.filled_at = iso(concludedAt);
      cand.filled_by = assignedTo;
      addActivity(id, "STAGE_CHANGE", false, "stage-selected", "stage-hired", "Marked Hired", assignedTo, concludedAt);
      hiredCount++;
      // Link about 40% of hires to one of the closed openings matching their combo, rest stay unlinked (Unlinked Hires demo)
      const matchingClosed = [closedOpening1, closedOpening2, closedOpening3].find(o => o.process_id === processId && o.position_type_id === positionId && o.company_id === companyId);
      if (matchingClosed && Math.random() < 0.7) cand.filled_opening_id = matchingClosed.id;
    } else if (stageId === "stage-rejected") {
      cand.rejection_reason = pick(rejectionReasons).name;
      cand.rejection_reason_id = pick(rejectionReasons).id;
      addActivity(id, "STAGE_CHANGE", false, "stage-interview-done", "stage-rejected", cand.rejection_reason, assignedTo, concludedAt);
    } else if (stageId === "stage-not-interested") {
      addActivity(id, "STAGE_CHANGE", false, "stage-contacted", "stage-not-interested", "Not interested (via IVR)", null, concludedAt);
    } else if (stageId === "stage-no-response") {
      addActivity(id, "CALL_ATTEMPT", true, null, null, "IVR call placed", null, concludedAt);
    }
  } else if (stageId === "stage-interview-sched" || stageId === "stage-interview-done" || stageId === "stage-selected") {
    cand.interview_scheduled_at = iso(daysAgo(Math.max(0, createdDaysAgo - randInt(2, 10))));
    addActivity(id, "STAGE_CHANGE", false, "stage-contacted", stageId, "Interview scheduled", assignedTo, daysAgo(Math.max(0, createdDaysAgo - randInt(2, 10))));
  }

  candidates.push(cand);
}

// ---- Call logs (IVR dial history — separate from candidate_activity, matches the real schema) ----
const callLogs = [];
let clId = 0;
const DISPOSITIONS = ["INTERESTED", "NOT_INTERESTED", "NO_RESPONSE", "INVALID_INPUT", "BUSY", "FAILED", "CALL_DISCONNECTED"];
for (let d = 0; d < 30; d++) {
  const day = daysAgo(d);
  const callsToday = randInt(5, 40);
  for (let i = 0; i < callsToday; i++) {
    clId++;
    const sub = pick(DISPOSITIONS);
    callLogs.push({
      id: uid("cl", clId), phone: fakePhone(randInt(0, 219)), call_uuid: uid("uuid", clId),
      campaign: "HireFlow", main_disposition: sub === "BUSY" || sub === "FAILED" ? "NOT_CONNECTED" : "CONNECTED",
      sub_disposition: sub, logged_at: iso(day), was_answered: sub !== "BUSY" && sub !== "FAILED",
    });
  }
}

const dndList = candidates.filter(c => c.current_stage_id === "stage-not-interested").slice(0, 20).map((c, i) => ({
  id: uid("dnd", i + 1), phone: c.phone, reason: "NOT_INTERESTED", added_at: c.updated_at,
}));

const candidateUpdates = []; // IVR Interested tracker demo rows
["stage-contacted", "stage-hired"].forEach((s, i) => {
  const c = candidates.find(x => x.current_stage_id === s);
  if (c) candidateUpdates.push({ id: uid("cu", i + 1), phone: c.phone, candidate_name: c.name, campaign: "HireFlow", status: "PENDING", comment: "", updated_by: "hr1@demo.hireflow", updated_at: c.updated_at });
});

const settings = [
  { key: "hireflow_retry_minutes", value: "30" },
  { key: "hireflow_max_retries", value: "1" },
];

const out = {
  companies, processes, positionTypes, leadSources, rejectionReasons, funnelStages, users,
  candidates, candidateActivity, positionOpenings, callLogs, dndList, candidateUpdates, settings,
};

fs.writeFileSync("./src/demoData.json", JSON.stringify(out));
console.log(`Generated ${candidates.length} candidates, ${candidateActivity.length} activity rows, ${positionOpenings.length} openings, ${callLogs.length} call logs, ${hiredCount} hires.`);

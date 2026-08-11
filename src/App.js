import { useState, useEffect, useRef, useCallback, Fragment } from "react";

// DEMO BUILD — no real backend. See src/mockBackend.js.

// Helper: today's date in YYYY-MM-DD format
function today() {
  return new Date().toISOString().split("T")[0];
}

// Helper: persist and retrieve filters
function saveFilter(key, value) {
  try { localStorage.setItem("filter_"+key, JSON.stringify(value)); } catch {}
}
function loadFilter(key, defaultVal) {
  try {
    const v = localStorage.getItem("filter_"+key);
    return v !== null ? JSON.parse(v) : defaultVal;
  } catch { return defaultVal; }
}
// Demo build uses a plain text mark instead of the real product's logo
// (this is a portfolio demo of the engineering, not a rebrand of the
// original — no client logo/trademark ships in this build).
function BrandMark({ size = 36 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: size * 0.55, letterSpacing: -0.5, color: "#5B5FC4" }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size * 0.28, background: "#5B5FC4", color: "#fff", fontSize: size * 0.5 }}>H</span>
      Hire Flow
    </div>
  );
}

// ================================================
// THEME TOKENS
// ================================================
const DARK = {
  bg:"#0A0C11", surface:"#12151D", card:"#171B26", border:"#242938",
  accent:"#5B5FC4", accentDim:"#1E2036", green:"#3BAE86", greenDim:"#0D2320",
  red:"#E2726F", redDim:"#2A1518", amber:"#D9A83D", amberDim:"#2A2010",
  purple:"#9884D6", purpleDim:"#211A3A", text:"#EDEFF5", muted:"#7C88A6",
  inputBg:"#12151D", shadow:"rgba(0,0,0,0.35)", shadowLg:"rgba(0,0,0,0.55)", mode:"dark",
};
const LIGHT = {
  bg:"#F6F4EF", surface:"#FFFDF9", card:"#FFFDF9", border:"#E4E1D8",
  accent:"#4F52D9", accentDim:"#ECEDFB", green:"#0E8F63", greenDim:"#E6F7F0",
  red:"#D23C3F", redDim:"#FBEDED", amber:"#B8790A", amberDim:"#FBF1DE",
  purple:"#7238C9", purpleDim:"#F3EEFC", text:"#1C1B18", muted:"#6E6C64",
  inputBg:"#FBFAF6", shadow:"rgba(28,27,24,0.06)", shadowLg:"rgba(28,27,24,0.16)", mode:"light",
};

let T = DARK;

function getThemeCSS(t) {
const ease="cubic-bezier(0.4,0,0.2,1)";
return `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
  body{background:${t.bg};color:${t.text};font-family:'Inter',system-ui,sans-serif;transition:background 0.2s,color 0.2s;font-feature-settings:'tnum' 1,'cv11' 1;letter-spacing:-0.1px;}
  ::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${t.border};border-radius:8px;border:2px solid transparent;background-clip:content-box;}::-webkit-scrollbar-thumb:hover{background:${t.muted};background-clip:content-box;}
  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${t.mode==="light"?`radial-gradient(ellipse 80% 60% at 50% -10%, ${t.accentDim}, ${t.bg})`:`radial-gradient(ellipse 80% 60% at 50% -10%, ${t.accentDim}, ${t.bg})`};}
  .login-box{background:${t.card};border:1px solid ${t.border};border-radius:20px;padding:44px;width:400px;box-shadow:0 1px 2px ${t.shadow},0 24px 48px -12px ${t.shadowLg};}
  .login-logo{font-size:24px;font-weight:800;color:${t.accent};margin-bottom:4px;letter-spacing:-0.5px;}
  .login-sub{color:${t.muted};font-size:13px;margin-bottom:32px;}
  .field{margin-bottom:16px;}
  .field label{display:block;font-size:11px;font-weight:600;color:${t.muted};margin-bottom:7px;text-transform:uppercase;letter-spacing:0.6px;}
  .field input,.field select,.field textarea{width:100%;background:${t.inputBg};border:1.5px solid ${t.border};border-radius:9px;padding:10px 14px;color:${t.text};font-size:14px;outline:none;transition:border-color 0.15s ${ease},box-shadow 0.15s ${ease};font-family:'Inter',sans-serif;}
  .field input:hover,.field select:hover,.field textarea:hover{border-color:${t.mode==="light"?"#D5D9E5":"#323952"};}
  .field input:focus,.field select:focus,.field textarea:focus{border-color:${t.accent};box-shadow:0 0 0 3.5px ${t.accentDim};}
  .btn{padding:10px 18px;background:${t.accent};color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;transition:transform 0.15s ${ease},box-shadow 0.15s ${ease},opacity 0.15s ${ease};font-family:'Inter',sans-serif;display:inline-flex;align-items:center;gap:6px;box-shadow:0 1px 2px rgba(0,0,0,0.06),0 0 0 0 ${t.accent};letter-spacing:-0.1px;}
  .btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px -2px ${t.mode==="light"?"rgba(84,87,229,0.35)":"rgba(99,102,241,0.4)"};}
  .btn:active{transform:translateY(0);box-shadow:0 1px 2px rgba(0,0,0,0.06);}
  .btn:disabled{opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none;}
  .btn-sm{padding:7px 14px;font-size:13px;border-radius:7px;}
  .btn-ghost{background:${t.mode==="light"?"#fff":"transparent"};border:1.5px solid ${t.border};color:${t.text};box-shadow:none;}
  .btn-ghost:hover{background:${t.surface};border-color:${t.mode==="light"?"#D5D9E5":"#323952"};box-shadow:0 2px 6px ${t.shadow};}
  .btn-danger{background:${t.red};color:#fff;}
  .btn-danger:hover{box-shadow:0 4px 14px -2px ${t.mode==="light"?"rgba(226,55,59,0.35)":"rgba(248,113,113,0.35)"};}
  .btn-green{background:${t.green};color:#fff;}
  .btn-amber{background:${t.amber};color:#fff;}
  .btn-purple{background:${t.purple};color:#fff;}
  .btn-full{width:100%;justify-content:center;}
  .date-edit{display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:3px 7px;margin:-3px -7px;border-radius:6px;transition:background 0.15s ${ease};}
  .date-edit:hover{background:${t.mode==="light"?t.bg:"#181D2A"};}
  .date-edit .pencil{opacity:0;transition:opacity 0.15s ${ease},color 0.15s ${ease};color:${t.muted};display:inline-flex;flex-shrink:0;}
  .date-edit:hover .pencil{opacity:1;color:${t.accent};}
  .date-edit-form{display:inline-flex;align-items:center;gap:5px;}
  .date-edit-form input[type=date]{width:auto;padding:4px 8px;font-size:12px;border-radius:6px;border:1.5px solid ${t.border};background:${t.inputBg};color:${t.text};outline:none;transition:border-color 0.15s ${ease},box-shadow 0.15s ${ease};}
  .date-edit-form input[type=date]:hover{border-color:${t.mode==="light"?"#D5D9E5":"#323952"};}
  .date-edit-form input[type=date]:focus{border-color:${t.accent};box-shadow:0 0 0 3px ${t.accentDim};}
  .icon-btn{width:22px;height:22px;border-radius:6px;border:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background 0.15s ${ease},color 0.15s ${ease},transform 0.1s ${ease};}
  .icon-btn:active{transform:scale(0.9);}
  .icon-btn-confirm{background:${t.greenDim};color:${t.green};}
  .icon-btn-confirm:hover{background:${t.green};color:#fff;}
  .icon-btn-cancel{background:${t.mode==="light"?t.bg:"#181D2A"};color:${t.muted};}
  .icon-btn-cancel:hover{background:${t.redDim};color:${t.red};}
  .err{color:${t.red};font-size:13px;margin-top:10px;text-align:center;}
  .warn{color:${t.amber};font-size:12px;margin-top:6px;display:flex;align-items:center;gap:6px;}
  .app{display:flex;height:100vh;overflow:hidden;}
  .sidebar{width:200px;background:${t.surface};border-right:1px solid ${t.border};display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;}
  .sidebar.collapsed{width:0;border-right-color:transparent;}
  .sidebar-toggle{position:fixed;top:14px;left:14px;z-index:30;width:30px;height:30px;border-radius:8px;background:${t.card};border:1px solid ${t.border};color:${t.muted};display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;box-shadow:0 1px 2px ${t.shadow};transition:background 0.15s ${ease},color 0.15s ${ease},left 0.2s ${ease};}
  .sidebar-toggle:hover{background:${t.bg};color:${t.text};}
  .sidebar-header{padding:22px 20px 18px;border-bottom:1px solid ${t.border};}
  .sidebar-brand{font-size:20px;font-weight:800;color:${t.accent};letter-spacing:-0.5px;}
  .sidebar-tagline{font-size:11px;color:${t.muted};margin-top:2px;font-weight:500;}
  .nav{flex:1;padding:14px 0;overflow-y:auto;}
  .nav-section{font-size:10px;font-weight:700;color:${t.muted};text-transform:uppercase;letter-spacing:1.1px;padding:10px 20px 6px;opacity:0.7;}
  .nav-item{position:relative;display:flex;align-items:center;gap:10px;padding:9px 20px 9px 18px;font-size:13px;font-weight:500;color:${t.muted};cursor:pointer;transition:color 0.12s ${ease},background 0.12s ${ease};margin:1px 10px;border-radius:8px;}
  .nav-item:hover{color:${t.text};background:${t.mode==="light"?t.bg:"#181D2A"};}
  .nav-item.active{color:${t.accent};background:${t.accentDim};font-weight:600;box-shadow:inset 2.5px 0 0 ${t.accent};}
  .nav-icon{font-size:15px;width:18px;text-align:center;flex-shrink:0;}
  .sidebar-footer{padding:16px;border-top:1px solid ${t.border};}
  .user-card{background:${t.mode==="light"?t.bg:"#181D2A"};border-radius:11px;padding:12px 13px;margin-bottom:10px;}
  .user-name{font-size:13px;font-weight:600;color:${t.text};margin-bottom:2px;}
  .user-email{font-size:11px;color:${t.muted};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .main{flex:1;overflow-y:auto;background:${t.bg};}
  .page-header{padding:22px 28px 19px;border-bottom:1px solid ${t.border};background:${t.mode==="light"?"rgba(255,255,255,0.85)":"rgba(18,21,29,0.85)"};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:sticky;top:0;z-index:10;}
  .page-title{font-size:19px;font-weight:700;color:${t.text};letter-spacing:-0.3px;}
  .page-sub{font-size:13px;color:${t.muted};margin-top:2px;}
  .page-content{padding:24px 28px;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
  .kpi-card{background:${t.card};border:1px solid ${t.border};border-radius:14px;padding:20px;box-shadow:0 1px 2px ${t.shadow};transition:box-shadow 0.2s ${ease},transform 0.2s ${ease};}
  .kpi-card:hover{box-shadow:0 8px 24px -8px ${t.shadowLg};transform:translateY(-2px);}
  .kpi-label{font-size:11px;font-weight:600;color:${t.muted};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:9px;}
  .kpi-value{font-size:30px;font-weight:800;line-height:1;margin-bottom:5px;letter-spacing:-0.5px;}
  .kpi-sub{font-size:12px;color:${t.muted};}
  .card{background:${t.card};border:1px solid ${t.border};border-radius:14px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 2px ${t.shadow};}
  .card-header{padding:15px 20px;border-bottom:1px solid ${t.border};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:${t.card};}
  .card-title{font-size:14px;font-weight:600;color:${t.text};letter-spacing:-0.1px;}
  .card-body{padding:20px;}
  .table-wrap{overflow-x:auto;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{text-align:left;padding:11px 16px;color:${t.muted};font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid ${t.border};background:${t.mode==="light"?"#FBFBFE":"#12151D"};}
  td{padding:13px 16px;border-bottom:1px solid ${t.border};color:${t.text};vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tbody tr{transition:background 0.1s ${ease};}
  tbody tr:hover td{background:${t.mode==="light"?"#FAFAFF":"#181D2A"};}
  .table-compact th{padding:7px 12px;}
  .table-compact td{padding:7px 12px;}
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;}
  .badge-green{background:${t.greenDim};color:${t.green};}
  .badge-red{background:${t.redDim};color:${t.red};}
  .badge-amber{background:${t.amberDim};color:${t.amber};}
  .badge-blue{background:${t.accentDim};color:${t.accent};}
  .badge-gray{background:${t.mode==="light"?"#EEF0F5":"#1D222F"};color:${t.muted};}
  .badge-purple{background:${t.purpleDim};color:${t.purple};}
  .drop-zone{border:2px dashed ${t.border};border-radius:14px;padding:40px 32px;text-align:center;cursor:pointer;transition:all 0.2s ${ease};background:${t.mode==="light"?"#FBFBFE":"#12151D"};}
  .drop-zone:hover,.drop-zone.drag-over{border-color:${t.accent};background:${t.accentDim};}
  .drop-zone-icon{font-size:32px;margin-bottom:10px;}
  .drop-zone-text{font-size:15px;font-weight:600;color:${t.text};margin-bottom:4px;}
  .drop-zone-sub{font-size:13px;color:${t.muted};}
  .audio-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid ${t.border};}
  .audio-row:last-child{border-bottom:none;}
  .filter-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
  .filter-select,.filter-input{background:${t.inputBg};border:1.5px solid ${t.border};border-radius:8px;padding:7px 12px;color:${t.text};font-size:13px;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.15s ${ease};}
  .filter-select:hover,.filter-input:hover{border-color:${t.mode==="light"?"#D5D9E5":"#323952"};}
  .filter-select:focus,.filter-input:focus{border-color:${t.accent};}
  .empty-state{text-align:center;padding:52px;color:${t.muted};}
  .empty-icon{font-size:40px;margin-bottom:12px;opacity:0.6;}
  .empty-title{font-size:15px;font-weight:600;color:${t.text};margin-bottom:6px;}
  .empty-sub{font-size:13px;}
  .toast{position:fixed;bottom:24px;right:24px;background:${t.card};border:1px solid ${t.border};border-radius:13px;padding:14px 18px;font-size:13px;z-index:999;display:flex;align-items:center;gap:10px;box-shadow:0 12px 32px -8px ${t.shadowLg};animation:slideUp 0.25s ${ease};max-width:360px;}
  @keyframes slideUp{from{transform:translateY(12px) scale(0.98);opacity:0;}to{transform:translateY(0) scale(1);opacity:1;}}
  .progress-bar{height:6px;background:${t.border};border-radius:3px;overflow:hidden;}
  .progress-fill{height:100%;background:${t.accent};border-radius:3px;transition:width 0.4s ${ease};}
  .tag{display:inline-block;background:${t.accentDim};color:${t.accent};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;}
  .modal-overlay{position:fixed;inset:0;background:${t.mode==="light"?"rgba(15,17,23,0.35)":"rgba(0,0,0,0.6)"};display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:fadeIn 0.15s ${ease};}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  .modal{background:${t.card};border:1px solid ${t.border};border-radius:18px;padding:28px;width:500px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 1px 2px ${t.shadow},0 32px 64px -16px ${t.shadowLg};animation:modalIn 0.2s ${ease};}
  @keyframes modalIn{from{transform:translateY(8px) scale(0.98);opacity:0;}to{transform:translateY(0) scale(1);opacity:1;}}
  .modal-title{font-size:18px;font-weight:700;margin-bottom:4px;color:${t.text};letter-spacing:-0.3px;}
  .modal-sub{font-size:13px;color:${t.muted};margin-bottom:20px;}
  .modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px;}
  .live-dot{width:8px;height:8px;border-radius:50%;background:${t.green};display:inline-block;animation:pulse 1.5s infinite;flex-shrink:0;box-shadow:0 0 0 3px ${t.greenDim};}
  .live-dot.off{background:${t.muted};animation:none;box-shadow:none;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
  .skeleton{background:linear-gradient(90deg,${t.border} 25%,${t.mode==="light"?"#EFEDE6":"#1D2230"} 37%,${t.border} 63%);background-size:400% 100%;animation:shimmer 1.4s ease infinite;border-radius:6px;height:14px;}
  @keyframes shimmer{0%{background-position:100% 50%;}100%{background-position:0% 50%;}}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
  .input-row{display:flex;gap:8px;align-items:flex-end;}
  .input-row .field{flex:1;margin-bottom:0;}
  .section-label{font-size:11px;font-weight:600;color:${t.muted};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px;margin-top:16px;}
  .info-box{border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:12px;}
  .info-box.amber{background:${t.amberDim};border:1px solid ${t.amber}55;color:${t.amber};}
  .info-box.green{background:${t.greenDim};border:1px solid ${t.green}55;color:${t.green};}
  .info-box.red{background:${t.redDim};border:1px solid ${t.red}55;color:${t.red};}
  .info-box.blue{background:${t.accentDim};border:1px solid ${t.accent}55;color:${t.accent};}
  .theme-toggle{background:${t.mode==="light"?"#fff":"transparent"};border:1.5px solid ${t.border};border-radius:9px;padding:7px 12px;cursor:pointer;font-size:13px;color:${t.muted};display:flex;align-items:center;gap:6px;transition:all 0.15s ${ease};}
  .theme-toggle:hover{border-color:${t.accent};color:${t.accent};}
  .stat-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid ${t.border};}
  .stat-row:last-child{border-bottom:none;}
  .reject-row{background:${t.redDim};border-radius:8px;padding:8px 12px;margin-bottom:6px;font-size:12px;display:flex;align-items:center;justify-content:space-between;}
  .dialer-bar{background:${t.card};border:1px solid ${t.border};border-radius:14px;padding:14px 20px;display:flex;align-items:center;gap:16px;margin-bottom:20px;box-shadow:0 1px 2px ${t.shadow};}
  .green{color:${t.green};} .red{color:${t.red};} .amber{color:${t.amber};} .blue{color:${t.accent};} .purple{color:${t.purple};}
`;
}

// ================================================
// DEMO MODE — every function below has the exact same signature as the
// real app's Supabase/FastAPI calls, but is backed by mockBackend.js
// (bundled dummy data + localStorage). No network calls, no live backend.
// See CASE_STUDY.md / README for what the real production version does.
// ================================================
import { mockSelect, mockInsert, mockInsertIgnoreDup, mockUpdate, mockDelete, mockRpc, mockSignIn, mockSignOut, mockRenderFetch, getSession } from "./mockBackend";

async function signIn(email, password) { return mockSignIn(email, password); }
async function signOut() { return mockSignOut(); }
function getEmail() { return getSession()?.email || ""; }
function getRole() { return getSession()?.role || "HR"; }
function getRoleName() { return getSession()?.name || getEmail(); }
function isAdmin() { return getRole() === "ADMIN"; }
function isManager() { return ["ADMIN", "MANAGER"].includes(getRole()); }

async function dbSelect(table, params = "") { return mockSelect(table, params); }
async function dbInsert(table, body) { return mockInsert(table, body); }
async function dbInsertIgnoreDup(table, body, conflictCol) { return mockInsertIgnoreDup(table, body, conflictCol); }
async function dbUpdate(table, match, body) { return mockUpdate(table, match, body); }
async function dbDelete(table, match) { return mockDelete(table, match); }
async function dbRpc(fn, body = {}) { return mockRpc(fn, body); }
async function renderFetch(path, options = {}) { return mockRenderFetch(path, options); }

function downloadCSV(filename, headers, rows) {
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows.map(r => r.map(v => `"${(v??"")}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = filename; a.click();
}

function splitCSVLine(line){
  // Quote-aware split \u2014 a raw line.split(",") breaks on quoted fields
  // containing commas (e.g. a name like "Doe, John"), silently misaligning
  // every column after it.
  const result=[];let cur="";let inQuotes=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){
      if(inQuotes && line[i+1]==='"'){cur+='"';i++;}
      else{inQuotes=!inQuotes;}
    }else if(c===","&&!inQuotes){
      result.push(cur);cur="";
    }else{
      cur+=c;
    }
  }
  result.push(cur);
  return result;
}

function parseCSV(text){
  const lines=text.trim().split("\n");
  const headers=splitCSVLine(lines[0]).map(h=>h.trim().toLowerCase());
  return lines.slice(1).filter(l=>l.trim()).map(line=>{
    const vals=splitCSVLine(line);const row={};
    headers.forEach((h,i)=>row[h]=(vals[i]||"").trim());
    return row;
  });
}

// ================================================
// SHARED COMPONENTS
// ================================================
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const icons = { success:"✅", error:"❌", info:"ℹ️", warn:"⚠️" };
  return <div className="toast">{icons[type]||"ℹ️"} {msg}</div>;
}

// Placeholder rows shown while a table is loading — reads as far more
// deliberate than a plain "Loading..." line, and matches the shape of the
// real table so there's no layout jump once data arrives.
// Stages where a candidate is already moving positively through hiring —
// sending them to IVR again risks interfering with an active process, so
// that action gets a confirmation instead of firing silently.
const POSITIVE_HIRING_STAGES=["Interview Scheduled","Interview Done","Selected/Offer","Hired"];

function SkeletonRows({ cols, rows=5 }) {
  return (
    <>
      {Array.from({length:rows}).map((_,i)=>(
        <tr key={i}>
          {Array.from({length:cols}).map((_,j)=>(
            <td key={j}><div className="skeleton" style={{width:j===0?"70%":"85%"}}/></td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Searchable dropdown for filter bars — plain <select> doesn't support
// search, which gets painful once a list (processes, recruiters, positions)
// grows past a handful of options.
function FilterSelect({ value, onChange, options, allLabel, style }) {
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const ref=useRef(null);
  useEffect(()=>{
    function onDocClick(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener("mousedown",onDocClick);
    return()=>document.removeEventListener("mousedown",onDocClick);
  },[]);
  const selected=options.find(o=>String(o.value)===String(value));
  const label=value?(selected?.label||""):allLabel;
  const q=query.trim().toLowerCase();
  const filtered=q?options.filter(o=>o.label.toLowerCase().includes(q)):options;
  return (
    <div ref={ref} style={{position:"relative",display:"inline-block",...style}}>
      <button type="button" className="filter-select" style={{textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,width:"100%"}} onClick={()=>setOpen(v=>!v)}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
        <span style={{fontSize:10,opacity:0.6}}>▾</span>
      </button>
      {open&&(
        <div className="card" style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:30,minWidth:200,maxHeight:280,overflowY:"auto",padding:6,margin:0,boxShadow:`0 4px 16px ${T.shadowLg}`}}>
          <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." style={{marginBottom:6}} onClick={e=>e.stopPropagation()}/>
          <div onClick={()=>{onChange("");setOpen(false);setQuery("");}} style={{padding:"6px 8px",cursor:"pointer",borderRadius:6,fontWeight:!value?600:400,color:!value?T.accent:T.text}}>{allLabel}</div>
          {filtered.map(o=>(
            <div key={o.value} onClick={()=>{onChange(o.value);setOpen(false);setQuery("");}} style={{padding:"6px 8px",cursor:"pointer",borderRadius:6,fontWeight:String(value)===String(o.value)?600:400,color:String(value)===String(o.value)?T.accent:T.text}}>{o.label}</div>
          ))}
          {filtered.length===0&&<div style={{padding:"6px 8px",fontSize:12,color:T.muted}}>No matches</div>}
        </div>
      )}
    </div>
  );
}

function DisposBadge({ sub }) {
  const map = {
    INTERESTED:["badge-green","Interested"], NOT_INTERESTED:["badge-red","Not Interested"],
    NO_RESPONSE:["badge-amber","No Response"], INVALID_INPUT:["badge-amber","Invalid Input"],
    BUSY:["badge-gray","Busy"], FAILED:["badge-gray","Failed"],
    CALL_DISCONNECTED:["badge-blue","Disconnected"], PENDING:["badge-gray","Pending"],
    CALLED:["badge-blue","Called"], CALLED_FINAL:["badge-blue","Completed"],
    RETRY:["badge-amber","Retry"], SKIPPED:["badge-gray","Skipped"],
    PICKED_UP:["badge-green","Picked Up"], REJECTED:["badge-red","Rejected"],
    HIRED:["badge-purple","Hired"], RUNNING:["badge-green","Running"],
    PAUSED:["badge-amber","Paused"], COMPLETED:["badge-blue","Completed"],
  };
  const [cls,label] = map[sub]||["badge-gray", sub||"—"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Modal({ title, sub, onClose, children, actions }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        {title && <div className="modal-title">{title}</div>}
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

// ================================================
// LOGIN PAGE
// ================================================
function LoginPage({ onLogin }) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [showForgot,setShowForgot]=useState(false);
  const [resetEmail,setResetEmail]=useState("");
  const [resetSent,setResetSent]=useState(false);
  const [resetLoading,setResetLoading]=useState(false);

  async function handleLogin(){
    setLoading(true);setError("");
    try{const s=await signIn(email,password);onLogin(s);}
    catch(e){setError(e.message||"Invalid email or password");}
    finally{setLoading(false);}
  }

  async function handleForgot(){
    if(!resetEmail.trim()){setError("Enter your email");return;}
    setResetLoading(true);setError("");
    // Demo mode — no real email is ever sent. All 5 demo accounts share the
    // password "demo1234" (see the login card for the list).
    await new Promise(r=>setTimeout(r,400));
    setResetSent(true);
    setResetLoading(false);
  }

  if(showForgot) return(
    <div className="login-wrap">
      <div className="login-box">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{marginBottom:8}}><BrandMark/></div>
        </div>
        {resetSent?(
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:12}}>✓</div>
            <div style={{fontWeight:600,fontSize:16,color:T.green,marginBottom:8}}>Reset "sent" (demo mode — nothing is actually emailed)</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:20}}>All demo accounts share the password shown on the login screen.</div>
            <button className="btn btn-ghost btn-full" onClick={()=>{setShowForgot(false);setResetSent(false);setResetEmail("");}}>Back to login</button>
          </div>
        ):(
          <>
            <div style={{fontWeight:600,fontSize:16,marginBottom:4}}>Reset your password</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:20}}>Demo mode — this doesn't send a real email, just shows what the flow looks like.</div>
            <div className="field"><label>Email</label><input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="admin@demo.hireflow" onKeyDown={e=>e.key==="Enter"&&handleForgot()}/></div>
            {error&&<div className="err" style={{marginBottom:8}}>{error}</div>}
            <button className="btn btn-full" onClick={handleForgot} disabled={resetLoading}>{resetLoading?"Sending...":"Send Reset Link"}</button>
            <button className="btn btn-ghost btn-full" style={{marginTop:8}} onClick={()=>{setShowForgot(false);setError("");}}>Back to login</button>
          </>
        )}
      </div>
    </div>
  );

  return(
    <div className="login-wrap">
      <div className="login-box">
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{marginBottom:8}}><BrandMark/></div>
          <div className="login-sub">Recruitment CRM + Analytics — Portfolio Demo</div>
          <div className="login-sub">Sign in to continue</div>
        </div>
        <div style={{background:"var(--accent-dim, #1E2036)",border:"1px solid #5B5FC444",borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:12.5,lineHeight:1.6}}>
          <strong>Demo accounts</strong> (password: <code>demo1234</code>):<br/>
          admin@demo.hireflow · manager@demo.hireflow · hr1@demo.hireflow · hr2@demo.hireflow · ceo@demo.hireflow
        </div>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@demo.hireflow" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>
        <button className="btn btn-full" onClick={handleLogin} disabled={loading} style={{marginTop:8}}>{loading?"Signing in...":"Sign in"}</button>
        {error&&<div className="err">{error}</div>}
        <div style={{textAlign:"center",marginTop:16}}>
          <button style={{background:"none",border:"none",color:T.accent,fontSize:13,cursor:"pointer"}} onClick={()=>{setShowForgot(true);setError("");}}>Forgot password?</button>
        </div>
      </div>
    </div>
  );
}

// ================================================
// DASHBOARD
// ================================================
function Dashboard({ showToast, role }) {
  const [stats,setStats]=useState(null);
  const [dialerStatus,setDialerStatus]=useState(null);
  const [testPhone,setTestPhone]=useState("");
  const [testLoading,setTestLoading]=useState(false);
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [campaignFilter,setCampaignFilter]=useState("");
  const [campaignList,setCampaignList]=useState([]);
  const [callLogsRaw,setCallLogsRaw]=useState([]);
  const [ivrView,setIvrView]=useState("day");
  const [hfSummary,setHfSummary]=useState(null);
  const [hfUsers,setHfUsers]=useState([]);
  const [hfDateFrom,setHfDateFrom]=useState("");
  const [hfDateTo,setHfDateTo]=useState("");
  const [hfAssignedTo,setHfAssignedTo]=useState("");
  const [hfAssignedInit,setHfAssignedInit]=useState(false);
  const [hfView,setHfView]=useState("day");
  const [hfAttemptEvents,setHfAttemptEvents]=useState([]);
  const [hfHireEvents,setHfHireEvents]=useState([]);
  const [hfRecruiterStats,setHfRecruiterStats]=useState([]);
  const [hfStageBreakdown,setHfStageBreakdown]=useState([]);

  const hfMyUserId=hfUsers.find(u=>u.email===getEmail())?.id;
  const hfReporteeIds=hfUsers.filter(u=>u.manager_id===hfMyUserId).map(u=>u.id);
  const hfAssigneeOptions=role==="ADMIN"?hfUsers:role==="MANAGER"?hfUsers.filter(u=>hfReporteeIds.includes(u.id)||u.id===hfMyUserId):[];

  useEffect(()=>{
    loadAll();
    dbSelect("campaigns","?select=name&order=created_at.desc").then(setCampaignList).catch(()=>{});
    dbSelect("user_roles","?select=id,name,email,role,manager_id,last_seen").then(setHfUsers).catch(()=>{});
    // Dialer status every 5s
    const dialerInterval=setInterval(loadDialerStatus,5000);
    // Full dashboard auto-refresh every 30s — IVR and Hire Flow both, so two
    // open tabs (e.g. Admin and CEO) don't silently drift out of sync until
    // someone manually hits refresh.
    const refreshInterval=setInterval(()=>{loadStats();loadHireFlowSummary();},30000);
    // Presence refresh every 30s, so "Currently Active" doesn't need a manual reload
    const presenceInterval=setInterval(()=>{
      dbSelect("user_roles","?select=id,name,email,role,manager_id,last_seen").then(setHfUsers).catch(()=>{});
    },30000);
    return()=>{clearInterval(dialerInterval);clearInterval(refreshInterval);clearInterval(presenceInterval);};
  },[]);
  useEffect(()=>{loadStats();},[dateFrom,dateTo,campaignFilter]);
  useEffect(()=>{loadHireFlowSummary();},[hfDateFrom,hfDateTo,hfAssignedTo,hfMyUserId]);
  useEffect(()=>{
    // Only plain HR defaults to "just my own cases" — Manager and Admin are
    // there to oversee everyone, so they land on the company-wide aggregate
    // (CEO always does too, and has no filter UI to undo a self-default).
    if(!hfAssignedInit&&hfMyUserId&&role==="HR"){setHfAssignedTo(hfMyUserId);setHfAssignedInit(true);}
  },[hfMyUserId,hfAssignedInit,role]);

  async function loadAll(){await Promise.all([loadStats(),loadDialerStatus(),loadHireFlowSummary()]);}

  async function loadHireFlowSummary(){
    try{
      const [cands,stages,activity]=await Promise.all([
        dbSelect("candidates","?select=id,current_stage_id,assigned_to,assigned_at"),
        dbSelect("funnel_stages","?select=id,name,sort_order,is_exit_stage&order=sort_order"),
        dbSelect("candidate_activity","?select=candidate_id,type,to_stage_id,changed_at&type=in.(CALL_ATTEMPT,STAGE_CHANGE)"),
      ]);
      const stageName=Object.fromEntries(stages.map(s=>[s.id,s.name]));
      const hiredId=stages.find(s=>s.name==="Hired")?.id;
      const interviewId=stages.find(s=>s.name==="Interview Scheduled")?.id;

      const ownerScoped=cands.filter(c=>{
        if(role==="HR")return c.assigned_to===hfMyUserId;
        if(role==="MANAGER"&&!(hfReporteeIds.includes(c.assigned_to)||c.assigned_to===hfMyUserId))return false;
        if(hfAssignedTo&&c.assigned_to!==hfAssignedTo)return false;
        return true;
      });
      const ownerScopedIds=new Set(ownerScoped.map(c=>c.id));

      const scoped=ownerScoped.filter(c=>{
        if(!hfDateFrom&&!hfDateTo)return true;
        if(!c.assigned_at)return false;
        const d=new Date(c.assigned_at).toISOString().split("T")[0];
        if(hfDateFrom&&d<hfDateFrom)return false;
        if(hfDateTo&&d>hfDateTo)return false;
        return true;
      });
      const total=scoped.length;
      const hiredCurrent=scoped.filter(c=>stageName[c.current_stage_id]==="Hired").length;
      const rejected=scoped.filter(c=>stageName[c.current_stage_id]==="Rejected").length;
      const notInterested=scoped.filter(c=>stageName[c.current_stage_id]==="Not Interested").length;
      const inPipeline=total-hiredCurrent-rejected-notInterested;

      setHfStageBreakdown(stages.map(s=>({
        key:s.name,count:scoped.filter(c=>c.current_stage_id===s.id).length,color:s.is_exit_stage?T.purple:T.accent,
      })));

      const inRange=iso=>{
        if(!hfDateFrom&&!hfDateTo)return true;
        const d=new Date(iso).toISOString().split("T")[0];
        if(hfDateFrom&&d<hfDateFrom)return false;
        if(hfDateTo&&d>hfDateTo)return false;
        return true;
      };
      const scopedActivity=activity.filter(a=>ownerScopedIds.has(a.candidate_id)&&inRange(a.changed_at));
      const attemptEvents=scopedActivity.filter(a=>a.type==="CALL_ATTEMPT");
      const interviewEvents=interviewId?scopedActivity.filter(a=>a.type==="STAGE_CHANGE"&&a.to_stage_id===interviewId):[];
      // Bucketed by assigned_at (not the hire's own changed_at) so the trend
      // chart's bars always sum to exactly the Hired KPI below — both use the
      // same assigned-in-range cohort. A candidate hired long after being
      // assigned would otherwise show up in the KPI total but fall outside
      // the visible date buckets, making the chart look like it doesn't add up.
      const hireEventsInRange=scoped.filter(c=>stageName[c.current_stage_id]==="Hired").map(c=>({candidate_id:c.id,changed_at:c.assigned_at}));
      setHfAttemptEvents(attemptEvents);
      setHfHireEvents(hireEventsInRange);

      const hired=hiredCurrent;
      // Attempted counts unique candidates reached, not every logged attempt
      // — a candidate called 3 times in the range was inflating this to 3
      // instead of 1 person actually attempted.
      const uniqueAttempted=new Set(attemptEvents.map(a=>a.candidate_id)).size;
      setHfSummary({total,hired,rejected,notInterested,inPipeline,conversion:total?Math.round((hired/total)*100):0,attempted:uniqueAttempted,interviews:interviewEvents.length});

      if(["ADMIN","MANAGER","CEO"].includes(role)){
        const hireCountByCandidate={};
        hireEventsInRange.forEach(h=>{hireCountByCandidate[h.candidate_id]=(hireCountByCandidate[h.candidate_id]||0)+1;});
        const stats=hfUsers.filter(u=>["HR","MANAGER"].includes(u.role)).map(u=>{
          const totalAssigned=cands.filter(c=>c.assigned_to===u.id).length;
          const hiredCount=cands.filter(c=>c.assigned_to===u.id&&hireCountByCandidate[c.id]).length;
          return {id:u.id,name:u.name||u.email,totalAssigned,hired:hiredCount};
        }).filter(r=>r.totalAssigned>0||r.hired>0).sort((a,b)=>b.hired-a.hired||b.totalAssigned-a.totalAssigned);
        setHfRecruiterStats(stats);
      }else{
        setHfRecruiterStats([]);
      }
    }catch(e){}
  }

  async function loadStats(){
    try{
      let p="?select=sub_disposition,logged_at&limit=5000";
      if(dateFrom) p+=`&logged_at=gte.${dateFrom}T00:00:00`;
      if(dateTo) p+=`&logged_at=lte.${dateTo}T23:59:59`;
      if(campaignFilter) p+=`&campaign=eq.${encodeURIComponent(campaignFilter)}`;
      let lp="?select=status";
      if(campaignFilter) lp+=`&campaign=eq.${encodeURIComponent(campaignFilter)}`;
      const [logs,leads]=await Promise.all([dbSelect("call_logs",p),dbSelect("leads",lp)]);
      const byDisp={};
      logs.forEach(l=>{const d=l.sub_disposition;if(d)byDisp[d]=(byDisp[d]||0)+1;});
      setStats({
        total:logs.length,
        interested:byDisp.INTERESTED||0,
        notConnected:(byDisp.BUSY||0)+(byDisp.FAILED||0),
        pending:leads.filter(l=>["PENDING","CALLED"].includes(l.status)).length,
        byDisp,
      });
      setCallLogsRaw(logs);
    }catch(e){}
  }
  async function loadDialerStatus(){try{setDialerStatus(await renderFetch("/campaign/status"));}catch{}}

  async function sendTestCall(){
    if(!testPhone.trim()){showToast("Enter a phone number","error");return;}
    if(!window.confirm(`This bypasses the DND list — ${testPhone} will be called even if they've opted out. Continue?`))return;
    setTestLoading(true);
    try{
      await renderFetch("/test-call",{method:"POST",body:JSON.stringify({phone:testPhone.trim(),campaign:"TEST",bypass_dnd:true})});
      showToast(`Test call sent to ${testPhone}`,"success");setTestPhone("");
    }catch(e){showToast(e.message||"Test call failed","error");}
    finally{setTestLoading(false);}
  }

  const connRate=stats?.total?Math.round(((stats.total-stats.notConnected)/stats.total)*100):0;
  const isActive=dialerStatus?.dialer?.is_active;

  function hfDayKey(iso){return new Date(iso).toISOString().split("T")[0];}
  function hfWeekKey(iso){
    const d=new Date(iso);
    const dow=(d.getUTCDay()+6)%7;
    const monday=new Date(d);monday.setUTCDate(d.getUTCDate()-dow);
    return monday.toISOString().split("T")[0];
  }
  const hfKeyFn=hfView==="day"?hfDayKey:hfWeekKey;
  const hfBuckets=(()=>{
    let from=hfDateFrom,to=hfDateTo;
    if(!from||!to){
      const t=new Date();to=t.toISOString().split("T")[0];
      const f=new Date();f.setDate(t.getDate()-(hfView==="day"?6:55));from=f.toISOString().split("T")[0];
    }
    const keys=[];
    if(hfView==="day"){
      let cur=new Date(from+"T00:00:00Z");const end=new Date(to+"T00:00:00Z");
      while(cur<=end&&keys.length<90){keys.push(cur.toISOString().split("T")[0]);cur.setUTCDate(cur.getUTCDate()+1);}
    }else{
      let cur=new Date(hfWeekKey(from+"T00:00:00Z")+"T00:00:00Z");const end=new Date(hfWeekKey(to+"T00:00:00Z")+"T00:00:00Z");
      while(cur<=end&&keys.length<60){keys.push(cur.toISOString().split("T")[0]);cur.setUTCDate(cur.getUTCDate()+7);}
    }
    const attemptMap={},hireMap={};
    // Per-bucket unique candidates, not raw attempt events — the same
    // candidate logged multiple times in one day/week was inflating the
    // count of people actually reached out to.
    const attemptSeen={};
    hfAttemptEvents.forEach(a=>{
      const k=hfKeyFn(a.changed_at);
      attemptSeen[k]=attemptSeen[k]||new Set();
      if(!attemptSeen[k].has(a.candidate_id)){attemptSeen[k].add(a.candidate_id);attemptMap[k]=(attemptMap[k]||0)+1;}
    });
    hfHireEvents.forEach(h=>{const k=hfKeyFn(h.changed_at);hireMap[k]=(hireMap[k]||0)+1;});
    const capped=hfView==="day"?keys.slice(-7):keys;
    return capped.map(k=>({key:k,attempted:attemptMap[k]||0,hires:hireMap[k]||0}));
  })();
  function hfFormatLabel(k){
    return hfView==="day"
      ?new Date(k+"T00:00:00Z").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})
      :"Wk "+new Date(k+"T00:00:00Z").toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  }

  const ivrKeyFn=ivrView==="day"?hfDayKey:hfWeekKey;
  const ivrBuckets=(()=>{
    let from=dateFrom,to=dateTo;
    if(!from||!to){
      const t=new Date();to=t.toISOString().split("T")[0];
      const f=new Date();f.setDate(t.getDate()-(ivrView==="day"?6:55));from=f.toISOString().split("T")[0];
    }
    const keys=[];
    if(ivrView==="day"){
      let cur=new Date(from+"T00:00:00Z");const end=new Date(to+"T00:00:00Z");
      while(cur<=end&&keys.length<90){keys.push(cur.toISOString().split("T")[0]);cur.setUTCDate(cur.getUTCDate()+1);}
    }else{
      let cur=new Date(hfWeekKey(from+"T00:00:00Z")+"T00:00:00Z");const end=new Date(hfWeekKey(to+"T00:00:00Z")+"T00:00:00Z");
      while(cur<=end&&keys.length<60){keys.push(cur.toISOString().split("T")[0]);cur.setUTCDate(cur.getUTCDate()+7);}
    }
    const callMap={},interestedMap={};
    callLogsRaw.forEach(l=>{const k=ivrKeyFn(l.logged_at);callMap[k]=(callMap[k]||0)+1;if(l.sub_disposition==="INTERESTED")interestedMap[k]=(interestedMap[k]||0)+1;});
    const capped=ivrView==="day"?keys.slice(-7):keys;
    return capped.map(k=>({key:k,calls:callMap[k]||0,interested:interestedMap[k]||0}));
  })();
  function ivrFormatLabel(k){
    return ivrView==="day"
      ?new Date(k+"T00:00:00Z").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})
      :"Wk "+new Date(k+"T00:00:00Z").toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  }

  return(
    <div>
      <div className="page-header">
        <div><div className="page-title">Dashboard</div><div className="page-sub">Live overview</div></div>
        <button className="btn btn-sm btn-ghost" onClick={loadAll}>↻</button>
      </div>
      <div className="page-content">
        {["ADMIN","MANAGER"].includes(role)&&(()=>{
          const now=Date.now();
          const ONLINE_MS=3*60*1000; // heartbeat pings every 60s, so 3 min covers a couple missed beats
          const online=hfUsers.filter(u=>u.last_seen&&(now-new Date(u.last_seen).getTime())<ONLINE_MS);
          return(
            <div className="card" style={{marginBottom:20}}>
              <div className="card-header"><div className="card-title">Currently Active</div><span style={{fontSize:12,color:T.muted}}>{online.length} online now</span></div>
              <div className="card-body" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {online.length?online.map(u=>(
                  <span key={u.id} className="badge badge-green" style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block"}}/>
                    {u.name||u.email}
                  </span>
                )):<span style={{fontSize:13,color:T.muted}}>No one active right now</span>}
              </div>
            </div>
          );
        })()}
        {/* HireFlow Overview */}
        {hfSummary&&(
          <div style={{marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12,paddingBottom:10,borderBottom:`2px solid ${T.accent}`}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:T.text}}>Hire Flow Dashboard</div>
                <div style={{fontSize:12,color:T.muted}}>Hiring pipeline snapshot</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <input type="date" className="filter-input" value={hfDateFrom} onChange={e=>setHfDateFrom(e.target.value)} title="From date"/>
                <input type="date" className="filter-input" value={hfDateTo} onChange={e=>setHfDateTo(e.target.value)} title="To date"/>
                {hfAssigneeOptions.length>0&&(
                  <FilterSelect value={hfAssignedTo} onChange={setHfAssignedTo} allLabel={role==="ADMIN"?"Everyone":"My Team"} options={hfAssigneeOptions.map(u=>({value:u.id,label:u.id===hfMyUserId?"Me":(u.name||u.email)}))}/>
                )}
                {(hfDateFrom||hfDateTo)&&<button className="btn btn-sm btn-ghost" onClick={()=>{setHfDateFrom("");setHfDateTo("");}}>All Time</button>}
                <button className="btn btn-sm btn-ghost" onClick={()=>{setHfDateFrom(today());setHfDateTo(today());}}>Today</button>
                <span style={{width:1,height:20,background:T.border,margin:"0 2px"}}/>
                <button className={`btn btn-sm ${hfView==="day"?"":"btn-ghost"}`} onClick={()=>setHfView("day")}>Day-wise</button>
                <button className={`btn btn-sm ${hfView==="week"?"":"btn-ghost"}`} onClick={()=>setHfView("week")}>Week-wise</button>
              </div>
            </div>
            <div className="card" style={{marginBottom:16}}>
              <div className="card-body" style={{padding:"12px 20px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Total Candidates</div>
                    <div style={{fontSize:20,fontWeight:700,color:T.accent}}>{hfSummary.total}</div>
                  </div>
                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>In Pipeline</div>
                    <div style={{fontSize:20,fontWeight:700}}>{hfSummary.inPipeline}</div>
                  </div>
                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Hired</div>
                    <div style={{fontSize:20,fontWeight:700,color:T.green}}>{hfSummary.hired}</div>
                  </div>
                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Rejected</div>
                    <div style={{fontSize:20,fontWeight:700,color:T.red}}>{hfSummary.rejected}</div>
                  </div>
                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Not Interested</div>
                    <div style={{fontSize:20,fontWeight:700,color:T.amber}}>{hfSummary.notInterested}</div>
                  </div>
                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Conversion</div>
                    <div style={{fontSize:20,fontWeight:700,color:T.accent}}>{hfSummary.conversion}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:16}}>
              <div className="card">
                <div className="card-header"><div className="card-title">Attempted Trend</div></div>
                <div className="card-body"><MiniBarChart data={hfBuckets} valueKey="attempted" color={T.accent} formatLabel={hfFormatLabel}/></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Hiring Trend</div></div>
                <div className="card-body"><MiniBarChart data={hfBuckets} valueKey="hires" color={T.green} formatLabel={hfFormatLabel}/></div>
              </div>
            </div>

            <div className="card" style={{marginBottom:16}}>
              <div className="card-header"><div className="card-title">Day-wise Attempts &amp; Hires</div></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Attempts</th><th>Hired</th></tr></thead>
                  <tbody>{hfBuckets.map(b=><tr key={b.key}><td>{hfFormatLabel(b.key)}</td><td>{b.attempted}</td><td>{b.hires}</td></tr>)}</tbody>
                </table>
              </div>
            </div>

            {["ADMIN","MANAGER","CEO"].includes(role)&&hfRecruiterStats.length>0&&(
              <div className="card">
                <div className="card-header"><div className="card-title">HR Performance</div><span style={{fontSize:12,color:T.muted}}>Hired is for the selected range; Assigned is current total</span></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Recruiter</th><th>Assigned</th><th>Hired</th><th>Conversion</th></tr></thead>
                    <tbody>{hfRecruiterStats.map(r=>(
                      <tr key={r.id}>
                        <td style={{fontWeight:500}}>{r.name}</td>
                        <td>{r.totalAssigned}</td>
                        <td style={{color:r.hired?T.green:undefined,fontWeight:r.hired?600:undefined}}>{r.hired}</td>
                        <td>{r.totalAssigned?Math.round((r.hired/r.totalAssigned)*1000)/10:0}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* IVR Dashboard */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12,paddingBottom:10,borderBottom:`2px solid ${T.purple}`}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>IVR Dashboard</div>
            <div style={{fontSize:12,color:T.muted}}>{dateFrom||dateTo?"Filtered period":"All time"} calling activity</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input type="date" className="filter-input" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} title="From date"/>
            <input type="date" className="filter-input" value={dateTo} onChange={e=>setDateTo(e.target.value)} title="To date"/>
            <FilterSelect value={campaignFilter} onChange={setCampaignFilter} allLabel="All Campaigns" options={campaignList.map(c=>({value:c.name,label:c.name}))}/>
            {(dateFrom||dateTo||campaignFilter)&&<button className="btn btn-sm btn-ghost" onClick={()=>{setDateFrom("");setDateTo("");setCampaignFilter("");}}>✕ Clear</button>}
            <span style={{width:1,height:20,background:T.border,margin:"0 2px"}}/>
            <button className={`btn btn-sm ${ivrView==="day"?"":"btn-ghost"}`} onClick={()=>setIvrView("day")}>Day-wise</button>
            <button className={`btn btn-sm ${ivrView==="week"?"":"btn-ghost"}`} onClick={()=>setIvrView("week")}>Week-wise</button>
          </div>
        </div>

        {/* Dialer Status Bar */}
        <div className="dialer-bar">
          <span className={`live-dot ${isActive?"":"off"}`}></span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:isActive?T.green:T.muted}}>{isActive?"Dialer Active":"Dialer Idle"}</div>
            {isActive&&<div style={{fontSize:12,color:T.muted,marginTop:2,display:"flex",alignItems:"center",gap:8}}>
              <span className="tag">{dialerStatus?.dialer?.current_campaign||"—"}</span>
              <span>→</span>
              <span style={{fontFamily:"monospace",color:T.accent,fontWeight:600}}>{dialerStatus?.dialer?.current_phone||"—"}</span>
            </div>}
            {!isActive&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>No campaign running. Go to Campaigns → Start.</div>}
          </div>
          <div className="input-row" style={{gap:8}}>
            <div className="field" style={{marginBottom:0,minWidth:160}}><input value={testPhone} onChange={e=>setTestPhone(e.target.value)} placeholder="Test call number" onKeyDown={e=>e.key==="Enter"&&sendTestCall()} style={{fontSize:13}}/></div>
            <button className="btn btn-sm btn-amber" onClick={sendTestCall} disabled={testLoading} title="Send test call">{testLoading?"...":"Test"}</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
          <div className="kpi-card"><div className="kpi-label">Total Calls</div><div className="kpi-value blue">{stats?.total??0}</div><div className="kpi-sub">{dateFrom||dateTo?"Filtered period":"All time"}</div></div>
          <div className="kpi-card"><div className="kpi-label">Interested Cases</div><div className="kpi-value green">{stats?.interested??0}</div><div className="kpi-sub">Out of {stats?.total??0} calls</div></div>
          <div className="kpi-card"><div className="kpi-label">Conversion</div><div className="kpi-value amber">{stats?.total?Math.round(((stats.interested||0)/stats.total)*1000)/10:0}%</div><div className="kpi-sub">Interested / total calls</div></div>
          <div className="kpi-card"><div className="kpi-label">Pending Leads</div><div className="kpi-value amber">{stats?.pending??0}</div><div className="kpi-sub">Awaiting next dial</div></div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:16}}>
          <div className="card">
            <div className="card-header"><div className="card-title">Calling Trend</div></div>
            <div className="card-body"><MiniBarChart data={ivrBuckets} valueKey="calls" color={T.accent} formatLabel={ivrFormatLabel}/></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Interested Trend</div></div>
            <div className="card-body"><MiniBarChart data={ivrBuckets} valueKey="interested" color={T.green} formatLabel={ivrFormatLabel}/></div>
          </div>
        </div>

        <div className="card" style={{marginBottom:16}}>
          <div className="card-header"><div className="card-title">Day-wise Dialed &amp; Interested</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Dialed</th><th>Interested</th></tr></thead>
              <tbody>{ivrBuckets.map(b=><tr key={b.key}><td>{ivrFormatLabel(b.key)}</td><td>{b.calls}</td><td>{b.interested}</td></tr>)}</tbody>
            </table>
          </div>
        </div>

        {/* Disposition Breakdown */}
        {stats&&(()=>{
          const rows=[
            ["Interested",stats.byDisp?.INTERESTED||0,T.green],
            ["Not Interested",stats.byDisp?.NOT_INTERESTED||0,T.red],
            ["No Response",stats.byDisp?.NO_RESPONSE||0,T.amber],
            ["Invalid Input",stats.byDisp?.INVALID_INPUT||0,T.amber],
            ["Disconnected",stats.byDisp?.CALL_DISCONNECTED||0,T.muted],
            ["Busy",stats.byDisp?.BUSY||0,T.muted],
            ["Failed",stats.byDisp?.FAILED||0,T.muted],
            ["Other",Math.max(0,stats.total-["INTERESTED","NOT_INTERESTED","NO_RESPONSE","INVALID_INPUT","CALL_DISCONNECTED","BUSY","FAILED"].reduce((s,k)=>s+(stats.byDisp?.[k]||0),0)),T.muted],
          ].filter(([label,count])=>label!=="Other"||count>0);
          return(
            <div className="card" style={{marginBottom:20}}>
              <div className="card-header">
                <div className="card-title">Disposition Breakdown</div>
                <span style={{fontSize:12,color:T.muted}}>{stats.total} total calls</span>
              </div>
              <div className="card-body" style={{padding:"12px 20px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {rows.map(([label,count,color])=>(
                    <div key={label} style={{background:T.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{label}</div>
                      <div style={{fontSize:20,fontWeight:700,color}}>{count}</div>
                      <div style={{fontSize:11,color:T.muted}}>{stats.total?Math.round((count/stats.total)*100):0}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

// ================================================
// CAMPAIGNS
// ================================================
function Campaigns({ showToast }) {
  const [campaigns,setCampaigns]=useState([]);
  const [callerIds,setCallerIds]=useState([]);
  const [showCreate,setShowCreate]=useState(false);
  const [deleteTarget,setDeleteTarget]=useState(null);
  const [actionLoading,setActionLoading]=useState(null);
  const [form,setForm]=useState({name:"",description:"",caller_id:"",max_retries:1,retry_after_minutes:30});

  useEffect(()=>{load();loadCallerIds();const i=setInterval(load,5000);return()=>clearInterval(i);},[]);

  async function load(){try{setCampaigns(await dbSelect("campaigns","?select=*&order=created_at.desc"));}catch{}}
  async function loadCallerIds(){try{setCallerIds(await dbSelect("caller_ids","?select=*&is_active=eq.true"));}catch{}}

  async function createCampaign(){
    if(!form.name.trim()){showToast("Campaign name required","error");return;}
    try{
      await dbInsert("campaigns",{...form,status:"PENDING",total_leads:0,called_count:0,pending_count:0});
      showToast("Campaign created!","success");
      setShowCreate(false);setForm({name:"",description:"",caller_id:"",max_retries:1,retry_after_minutes:30});
      load();
    }catch(e){showToast("Failed — name may already exist","error");}
  }

  async function startCampaign(name){
    setActionLoading(name+"_start");
    try{await renderFetch("/campaign/start",{method:"POST",body:JSON.stringify({campaign:name})});showToast(`▶ "${name}" started`,"success");load();}
    catch(e){showToast(e.message||"Failed to start","error");}
    finally{setActionLoading(null);}
  }

  async function pauseCampaign(name){
    setActionLoading(name+"_pause");
    try{await renderFetch("/campaign/pause",{method:"POST",body:JSON.stringify({campaign:name})});showToast(`⏸ "${name}" pausing...`,"info");load();}
    catch(e){showToast(e.message||"Failed","error");}
    finally{setActionLoading(null);}
  }

  async function confirmDelete(){
    if(!deleteTarget)return;
    setActionLoading(deleteTarget+"_delete");
    try{await renderFetch("/campaign/delete",{method:"DELETE",body:JSON.stringify({campaign:deleteTarget})});showToast(`Deleted "${deleteTarget}"`,"success");setDeleteTarget(null);load();}
    catch(e){showToast(e.message||"Failed","error");}
    finally{setActionLoading(null);}
  }

  const SYSTEM_CAMPAIGNS=["Recruiter Follow-ups"];
  const systemCampaigns=campaigns.filter(c=>SYSTEM_CAMPAIGNS.includes(c.name));
  const manualCampaigns=campaigns.filter(c=>!SYSTEM_CAMPAIGNS.includes(c.name));
  const hasRunning=manualCampaigns.some(c=>c.status==="RUNNING");

  return(
    <div>
      <div className="page-header">
        <div><div className="page-title">Campaigns</div><div className="page-sub">Only one can run at a time — use pause/resume to switch</div></div>
        <button className="btn btn-sm" onClick={()=>setShowCreate(true)}>+ New Campaign</button>
      </div>
      <div className="page-content">
        {systemCampaigns.length>0&&(
          <div className="card" style={{marginBottom:16,borderStyle:"dashed"}}>
            <div className="card-header">
              <div className="card-title">Automated — HireFlow</div>
              <span style={{fontSize:12,color:T.muted}}>Runs on its own, nothing to start or pause here</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Campaign</th><th>Status</th><th>Progress</th><th>Settings</th></tr></thead>
                <tbody>{systemCampaigns.map(c=>{
                  const total=c.total_leads||0;const called=c.called_count||0;
                  const pct=total?Math.round((called/total)*100):0;
                  return(
                    <tr key={c.id}>
                      <td>
                        <div style={{fontWeight:600,color:T.text}}>{c.name}</div>
                        {c.description&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>{c.description}</div>}
                      </td>
                      <td><DisposBadge sub={c.status}/></td>
                      <td style={{minWidth:160}}>
                        <div style={{fontSize:12,color:T.muted,marginBottom:6}}>{called} / {total} called ({pct}%)</div>
                        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
                        <div style={{fontSize:11,color:T.muted,marginTop:4}}>Pending: {c.pending_count||0}</div>
                      </td>
                      <td style={{fontSize:12}}>
                        <div>Retries: <strong>{c.max_retries}x</strong></div>
                        <div style={{color:T.muted}}>Gap: {c.retry_after_minutes} min</div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}
        {hasRunning&&<div className="info-box green" style={{marginBottom:16,display:"flex",alignItems:"center",gap:8}}><span className="live-dot"></span>A campaign is running. Pause it before starting another.</div>}
        <div className="card">
          <div className="table-wrap">
            {manualCampaigns.length===0?(
              <div className="empty-state"><div className="empty-icon">◔</div><div className="empty-title">No campaigns yet</div><div className="empty-sub">Create a campaign, upload leads, then start dialing</div></div>
            ):(
              <table>
                <thead><tr><th>Campaign</th><th>Status</th><th>Progress</th><th>Settings</th><th>Actions</th></tr></thead>
                <tbody>{manualCampaigns.map(c=>{
                  const total=c.total_leads||0;const called=c.called_count||0;
                  const pct=total?Math.round((called/total)*100):0;
                  const isRunning=c.status==="RUNNING";
                  const canStart=["PENDING","PAUSED"].includes(c.status)&&!hasRunning;
                  return(
                    <tr key={c.id}>
                      <td>
                        <div style={{fontWeight:600,color:T.text}}>{c.name}</div>
                        {c.description&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>{c.description}</div>}
                        {c.caller_id&&<div style={{fontSize:11,color:T.muted,fontFamily:"monospace",marginTop:2}}>{c.caller_id}</div>}
                      </td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          {isRunning&&<span className="live-dot"></span>}
                          <DisposBadge sub={c.status}/>
                        </div>
                      </td>
                      <td style={{minWidth:160}}>
                        <div style={{fontSize:12,color:T.muted,marginBottom:6}}>{called} / {total} called ({pct}%)</div>
                        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
                        <div style={{fontSize:11,color:T.muted,marginTop:4}}>Pending: {c.pending_count||0}</div>
                      </td>
                      <td style={{fontSize:12}}>
                        <div>Retries: <strong>{c.max_retries}x</strong></div>
                        <div style={{color:T.muted}}>Gap: {c.retry_after_minutes} min</div>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {canStart&&<button className="btn btn-sm btn-green" onClick={()=>startCampaign(c.name)} disabled={!!actionLoading}>{actionLoading===c.name+"_start"?"...":"Start"}</button>}
                          {isRunning&&<button className="btn btn-sm btn-amber" onClick={()=>pauseCampaign(c.name)} disabled={!!actionLoading}>{actionLoading===c.name+"_pause"?"...":"Pause"}</button>}
                          {!isRunning&&<button className="btn btn-sm btn-ghost" style={{color:T.red,borderColor:T.red}} onClick={()=>setDeleteTarget(c.name)} disabled={!!actionLoading}>Delete</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showCreate&&(
        <Modal title="New Campaign" sub="Settings apply to all leads in this campaign" onClose={()=>setShowCreate(false)}
          actions={<><button className="btn btn-sm btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button><button className="btn btn-sm" onClick={createCampaign}>Create Campaign</button></>}>
          <div className="field"><label>Campaign Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Malayalam Hiring June"/></div>
          <div className="field"><label>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief description (optional)"/></div>
          <div className="field"><label>Caller ID</label>
            <select value={form.caller_id} onChange={e=>setForm({...form,caller_id:e.target.value})}>
              <option value="">Use default active number</option>
              {callerIds.map(c=><option key={c.id} value={c.number}>{c.label} ({c.number})</option>)}
            </select>
          </div>
          <div className="two-col">
            <div className="field"><label>Max Retries per Lead</label><input type="number" min="1" max="10" value={form.max_retries} onChange={e=>setForm({...form,max_retries:parseInt(e.target.value)||1})}/></div>
            <div className="field">
              <label>Retry Gap (minutes)</label>
              <input type="number" min="1" value={form.retry_after_minutes} onChange={e=>setForm({...form,retry_after_minutes:parseInt(e.target.value)||30})}/>
              {form.retry_after_minutes<30&&<div className="warn">Recommended: at least 30 min</div>}
            </div>
          </div>
          <div className="info-box blue" style={{marginTop:8}}>
            With these settings: each lead is dialed up to {form.max_retries} time(s). If a lead doesn't pick up, it will only be redialed after at least {form.retry_after_minutes} minutes have passed since its last call. Other leads in the queue are dialed back-to-back without waiting.
          </div>
        </Modal>
      )}

      {deleteTarget&&(
        <Modal title="Delete Campaign" onClose={()=>setDeleteTarget(null)}
          actions={<><button className="btn btn-sm btn-ghost" onClick={()=>setDeleteTarget(null)}>Cancel</button><button className="btn btn-sm btn-danger" onClick={confirmDelete}>{actionLoading?"Deleting...":"Yes, Delete"}</button></>}>
          <div className="info-box red">This will permanently delete "<strong>{deleteTarget}</strong>" and all its PENDING leads. Called leads and logs are kept.</div>
        </Modal>
      )}
    </div>
  );
}

// ================================================
// LEADS
// ================================================
function Leads({ showToast }) {
  const [leads,setLeads]=useState([]);
  const [campaigns,setCampaigns]=useState([]);
  const [lastCallMap,setLastCallMap]=useState({});
  const [loading,setLoading]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [validRows,setValidRows]=useState([]);
  const [rejectedRows,setRejectedRows]=useState([]);
  const [dndConflicts,setDndConflicts]=useState([]);
  const [duplicates,setDuplicates]=useState([]);
  const [campaign,setCampaign]=useState("");
  const [selectedCampaignData,setSelectedCampaignData]=useState(null);
  const [filterCampaign,setFilterCampaign]=useState("ALL");
  const [filterStatus,setFilterStatus]=useState("ALL");
  const [search,setSearch]=useState("");
  const fileRef=useRef();
  const selectedFile=useRef(null);

  useEffect(()=>{loadCampaigns();loadLeads();},[]);

  async function loadCampaigns(){try{setCampaigns(await dbSelect("campaigns","?select=name,max_retries,retry_after_minutes,status&order=created_at.desc"));}catch{}}

  async function loadLeads(camp=filterCampaign){
    setLoading(true);
    try{
      let params="?select=*&order=uploaded_at.desc&limit=500";
      if(camp&&camp!=="ALL") params+=`&campaign=eq.${encodeURIComponent(camp)}`;
      const data=await dbSelect("leads",params);
      setLeads(data);

      // Fetch last call result for each phone number
      const phones=[...new Set(data.map(l=>l.phone).filter(Boolean))];
      if(phones.length){
        const logsParams=`?select=phone,sub_disposition,logged_at&phone=in.(${phones.slice(0,200).join(",")})&order=logged_at.desc`;
        const logs=await dbSelect("call_logs",logsParams);
        // Keep only the latest log per phone
        const map={};
        logs.forEach(l=>{if(!map[l.phone])map[l.phone]=l;});
        setLastCallMap(map);
      }
    }catch(e){showToast("Failed to load leads","error");}
    finally{setLoading(false);}
  }

  function validateRows(rows){
    const valid=[];const rejected=[];
    rows.forEach((row,idx)=>{
      const phone=(row.phone||row.number||"").replace(/\D/g,"");
      const name=row.name||row.candidate||"";
      if(!phone){rejected.push({...row,_reason:"Missing phone number",_line:idx+2});return;}
      if(phone.length!==10){rejected.push({...row,phone,_reason:`Invalid: ${phone.length} digits (need 10)`,_line:idx+2});return;}
      if(!/^\d{10}$/.test(phone)){rejected.push({...row,phone,_reason:"Non-numeric characters",_line:idx+2});return;}
      valid.push({...row,phone,name:name||"Unknown"});
    });
    return{valid,rejected};
  }

  async function handleFile(file){
    if(!file||!file.name.endsWith(".csv")){showToast("Please upload a CSV file","error");return;}
    selectedFile.current=file;
    const text=await file.text();
    const rows=parseCSV(text);
    const{valid,rejected}=validateRows(rows);
    let dndList=[];
    try{const d=await dbSelect("dnd_list","?select=phone");dndList=d.map(r=>r.phone);}catch{}
    setValidRows(valid.filter(r=>!dndList.includes(r.phone)));
    setRejectedRows(rejected);
    setDndConflicts(valid.filter(r=>dndList.includes(r.phone)));
  }

  function downloadTemplate(){
    downloadCSV("hireflow_leads_template.csv",["name","phone"],[["John Doe","9876543210"],["Jane Smith","9123456789"]]);
    showToast("Template downloaded","success");
  }

  async function uploadLeads(){
    if(!campaign){showToast("Select a campaign first","error");return;}
    if(!validRows.length){showToast("No valid leads to upload","error");return;}
    const camp=campaigns.find(c=>c.name===campaign);
    if(camp?.status==="RUNNING"){showToast("Pause the campaign first before adding leads","error");return;}
    if(camp?.status==="COMPLETED"){showToast("This campaign is completed — create a new campaign instead","error");return;}
    setUploading(true);

    try{
      // Check for existing leads in this campaign (duplicate detection)
      const existingRes=await dbSelect("leads",`?select=phone&campaign=eq.${encodeURIComponent(campaign)}`);
      const existingPhones=new Set(existingRes.map(r=>r.phone));
      const duplicates=validRows.filter(r=>existingPhones.has(r.phone));
      const fresh=validRows.filter(r=>!existingPhones.has(r.phone));

      if(duplicates.length>0){
        setDuplicates(duplicates);
        if(!fresh.length){
          showToast(`All ${duplicates.length} numbers already exist in this campaign`,"error");
          setUploading(false);
          return;
        }
        showToast(`${duplicates.length} duplicates skipped, uploading ${fresh.length} new leads`,"warn");
      }

      if(!fresh.length){setUploading(false);return;}

      const now=new Date().toISOString();
      const payload=fresh.map(r=>({
        name:r.name, phone:r.phone, campaign,
        status:"PENDING", attempt_count:0, eligible_at:now,
        max_retries:selectedCampaignData?.max_retries||1,
        retry_after_minutes:selectedCampaignData?.retry_after_minutes||30,
      }));

      await dbInsert("leads",payload);

      // Recalculate campaign counts from DB
      const allLeads=await dbSelect("leads",`?select=status&campaign=eq.${encodeURIComponent(campaign)}`);
      const total=allLeads.length;
      const called=allLeads.filter(l=>l.status==="CALLED_FINAL").length;
      const pending=allLeads.filter(l=>["PENDING","CALLED"].includes(l.status)).length;
      await dbUpdate("campaigns",`name=eq.${encodeURIComponent(campaign)}`,{total_leads:total,called_count:called,pending_count:pending});

      showToast(`${payload.length} leads uploaded to "${campaign}"`,"success");
      setValidRows([]);setRejectedRows([]);setDndConflicts([]);setDuplicates([]);
      setCampaign("");setSelectedCampaignData(null);
      fileRef.current.value="";selectedFile.current=null;
      loadLeads();
    }catch(e){
      console.error(e);
      showToast("Upload failed: "+e.message,"error");
    }
    finally{setUploading(false);}
  }

  const filtered=leads.filter(l=>{
    const qMatch=!search||(l.name||"").toLowerCase().includes(search.toLowerCase())||(l.phone||"").includes(search);
    const cMatch=filterCampaign==="ALL"||l.campaign===filterCampaign;
    const sMatch=filterStatus==="ALL"||l.status===filterStatus;
    return qMatch&&cMatch&&sMatch;
  });

  return(
    <div>
      <div className="page-header">
        <div><div className="page-title">Leads</div><div className="page-sub">Upload and manage candidate leads per campaign</div></div>
        <button className="btn btn-sm btn-ghost" onClick={downloadTemplate}>Download Template</button>
      </div>
      <div className="page-content">
        <div className="card">
          <div className="card-header"><div className="card-title">Upload Leads CSV</div></div>
          <div className="card-body">
            <div className="two-col" style={{marginBottom:16}}>
              <div className="field">
                <label>Assign to Campaign *</label>
                <select value={campaign} onChange={e=>{setCampaign(e.target.value);setSelectedCampaignData(campaigns.find(c=>c.name===e.target.value)||null);}}>
                  <option value="">— Select campaign —</option>
                  {campaigns.map(c=><option key={c.name} value={c.name} disabled={c.status==="RUNNING"||c.status==="COMPLETED"}>{c.name}{c.status==="RUNNING"?" (running — pause first)":c.status==="COMPLETED"?" (completed)":""}</option>)}
                </select>
                {campaigns.length===0&&<div className="warn">Create a campaign first</div>}
              </div>
              {selectedCampaignData&&(
                <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:12,fontSize:13}}>
                  <div style={{fontWeight:600,marginBottom:6}}>{selectedCampaignData.name}</div>
                  <div style={{color:T.muted}}>Max retries: <strong style={{color:T.text}}>{selectedCampaignData.max_retries}x</strong></div>
                  <div style={{color:T.muted,marginTop:4}}>Retry gap: <strong style={{color:T.text}}>{selectedCampaignData.retry_after_minutes} min</strong></div>
                </div>
              )}
            </div>
            <div className={`drop-zone ${dragOver?"drag-over":""}`}
              onClick={()=>fileRef.current.click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}>
              <div className="drop-zone-icon"></div>
              <div className="drop-zone-text">Drop CSV here or click to browse</div>
              <div className="drop-zone-sub">Required columns: name, phone — <span style={{color:T.accent,cursor:"pointer"}} onClick={e=>{e.stopPropagation();downloadTemplate();}}>download template</span></div>
            </div>
            <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>

            {(validRows.length>0||rejectedRows.length>0||dndConflicts.length>0)&&(
              <div style={{marginTop:20}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
                  <div style={{background:T.greenDim,border:`1px solid ${T.green}`,borderRadius:8,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:T.green}}>{validRows.length}</div>
                    <div style={{fontSize:12,color:T.green}}>Valid — Ready to upload</div>
                  </div>
                  <div style={{background:T.redDim,border:`1px solid ${T.red}`,borderRadius:8,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:T.red}}>{rejectedRows.length}</div>
                    <div style={{fontSize:12,color:T.red}}>Rejected — Invalid numbers</div>
                  </div>
                  <div style={{background:T.amberDim,border:`1px solid ${T.amber}`,borderRadius:8,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:T.amber}}>{dndConflicts.length}</div>
                    <div style={{fontSize:12,color:T.amber}}>DND — Will be skipped</div>
                  </div>
                  <div style={{background:T.purpleDim,border:`1px solid ${T.purple}`,borderRadius:8,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:T.purple}}>{duplicates.length}</div>
                    <div style={{fontSize:12,color:T.purple}}>Already in campaign</div>
                  </div>
                </div>
                {rejectedRows.length>0&&(
                  <div style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:600,color:T.red}}>Rejected Numbers</span>
                      <button className="btn btn-sm btn-danger" onClick={()=>downloadCSV(`rejected_${Date.now()}.csv`,["name","phone","reason"],rejectedRows.map(r=>[r.name||"",r.phone||"",r._reason]))}>Download to Fix</button>
                    </div>
                    {rejectedRows.slice(0,3).map((r,i)=>(
                      <div key={i} className="reject-row">
                        <span style={{fontFamily:"monospace"}}>{r.phone||"—"}</span>
                        <span style={{color:T.red,fontSize:11}}>{r._reason}</span>
                      </div>
                    ))}
                    {rejectedRows.length>3&&<div style={{fontSize:12,color:T.muted,marginTop:4}}>+{rejectedRows.length-3} more. Download to see all.</div>}
                  </div>
                )}
                {validRows.length>0&&(
                  <div style={{display:"flex",gap:10}}>
                    <button className="btn btn-sm btn-green" disabled={uploading||!campaign} onClick={uploadLeads}>{uploading?"Uploading...":`Upload ${validRows.length} leads`}</button>
                    <button className="btn btn-sm btn-ghost" onClick={()=>{setValidRows([]);setRejectedRows([]);setDndConflicts([]);fileRef.current.value="";selectedFile.current=null;}}>Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">All Leads ({filtered.length})</div>
            <div className="filter-row">
              <input className="filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone" style={{maxWidth:200}}/>
              <FilterSelect value={filterCampaign==="ALL"?"":filterCampaign} onChange={v=>{const nv=v||"ALL";setFilterCampaign(nv);loadLeads(nv);}} allLabel="All Campaigns" options={campaigns.map(c=>({value:c.name,label:c.name}))}/>
              <FilterSelect value={filterStatus==="ALL"?"":filterStatus} onChange={v=>setFilterStatus(v||"ALL")} allLabel="All Status" options={[
                {value:"PENDING",label:"Pending"},
                {value:"CALLED",label:"Called (retry pending)"},
                {value:"CALLED_FINAL",label:"Completed"},
                {value:"SKIPPED",label:"Skipped (DND or Interested elsewhere)"},
              ]}/>
              <button className="btn btn-sm btn-ghost" onClick={()=>loadLeads(filterCampaign)}>↻</button>
            </div>
          </div>
          <div className="table-wrap">
            {!loading&&filtered.length===0?(
              <div className="empty-state"><div className="empty-icon">☰</div><div className="empty-title">No leads found</div><div className="empty-sub">Upload a CSV to get started</div></div>
            ):(
              <table>
                <thead><tr><th>Name</th><th>Phone</th><th>Campaign</th><th>Status</th><th>Last IVR Result</th><th>Attempts</th><th>Next Eligible</th></tr></thead>
                <tbody>{loading?<SkeletonRows cols={7}/>:filtered.map(lead=>(
                  <tr key={lead.id}>
                    <td style={{fontWeight:500}}>{lead.name}</td>
                    <td style={{fontFamily:"monospace"}}>{lead.phone}</td>
                    <td><span className="tag">{lead.campaign}</span></td>
                    <td><DisposBadge sub={lead.status}/></td>
                    <td>{lastCallMap[lead.phone]?<DisposBadge sub={lastCallMap[lead.phone].sub_disposition}/>:<span style={{color:T.muted,fontSize:12}}>—</span>}</td>
                    <td style={{fontSize:12}}>{lead.attempt_count||0} / {lead.max_retries||1}</td>
                    <td style={{color:T.muted,fontSize:12}}>
                      {lead.eligible_at&&lead.status==="CALLED"?new Date(lead.eligible_at).toLocaleString("en-IN"):"—"}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// INTERESTED CANDIDATES
// ================================================
function InterestedCandidates({ showToast }) {
  const [candidates,setCandidates]=useState([]);
  const [updates,setUpdates]=useState({});
  const [loading,setLoading]=useState(false);
  const [selected,setSelected]=useState(null);
  const [updateForm,setUpdateForm]=useState({status:"PENDING",comment:""});
  const [saving,setSaving]=useState(false);
  const [search,setSearch]=useState("");
  const [filterCampaign,setFilterCampaign]=useState(()=>loadFilter("cand_campaign","ALL"));
  const [filterStatus,setFilterStatus]=useState(()=>loadFilter("cand_status","PENDING"));
  const [filterFrom,setFilterFrom]=useState("");
  const [filterTo,setFilterTo]=useState("");
  const [campaigns,setCampaigns]=useState([]);
  const [funnelStages,setFunnelStages]=useState([]);
  const [processes,setProcesses]=useState([]);
  const [positionTypes,setPositionTypes]=useState([]);
  const [companies,setCompanies]=useState([]);
  const [matchedCandidate,setMatchedCandidate]=useState(undefined); // undefined=checking, null=no match, object=match
  const [moveToStageId,setMoveToStageId]=useState(""); // "" = don't move into HireFlow
  const [convertProcessId,setConvertProcessId]=useState("");
  const [convertPositionId,setConvertPositionId]=useState("");
  const [convertCompanyId,setConvertCompanyId]=useState("");

  useEffect(()=>{
    load();
    dbSelect("funnel_stages","?select=id,name&order=sort_order").then(setFunnelStages).catch(()=>{});
    dbSelect("processes","?select=id,name").then(setProcesses).catch(()=>{});
    dbSelect("position_types","?select=id,name").then(setPositionTypes).catch(()=>{});
    dbSelect("companies","?select=id,name").then(setCompanies).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!selected){setMatchedCandidate(undefined);return;}
    setMatchedCandidate(undefined);
    setMoveToStageId("");
    setConvertProcessId("");setConvertPositionId("");setConvertCompanyId("");
    dbSelect("candidates",`?select=id,name,current_stage_id&phone=eq.${selected.phone}&limit=1`)
      .then(rows=>setMatchedCandidate(rows[0]||null))
      .catch(()=>setMatchedCandidate(null));
  },[selected]);

  async function load(){
    setLoading(true);
    try{
      const [logs,updatesData]=await Promise.all([
        dbSelect("call_logs","?select=phone,campaign,logged_at&sub_disposition=eq.INTERESTED&order=logged_at.desc"),
        dbSelect("candidate_updates","?select=*&order=updated_at.desc"),
      ]);

      // Dedupe by phone — keep most recent occurrence, track all campaigns
      const byPhone={};
      logs.forEach(l=>{
        if(!byPhone[l.phone]){
          byPhone[l.phone]={phone:l.phone,campaign:l.campaign,logged_at:l.logged_at,allCampaigns:[l.campaign]};
        }else{
          if(!byPhone[l.phone].allCampaigns.includes(l.campaign)){
            byPhone[l.phone].allCampaigns.push(l.campaign);
          }
        }
      });
      const dedupedLogs=Object.values(byPhone);

      const phones=[...new Set(dedupedLogs.map(l=>l.phone))];
      let leadsMap={};
      let candidateNameMap={};
      let candidateStageMap={};
      let dialCountMap={};
      if(phones.length){
        const phoneList=phones.slice(0,50).join(",");
        const [leads,hfCandidates,allLogsForPhones]=await Promise.all([
          dbSelect("leads",`?select=phone,name&phone=in.(${phoneList})`),
          // HireFlow's own "Send to IVR" calls are deliberately not written
          // to `leads` (see hireflow.py) — that's the one and only source
          // this page used to check, so any HireFlow-originated call always
          // showed "Unknown" even though the real name exists right in the
          // candidates table under the same phone number.
          dbSelect("candidates",`?select=phone,name,current_stage_id&phone=in.(${phoneList})`),
          // Every dial attempt regardless of outcome, so HR can see total
          // times someone's actually been reached out to via IVR — not
          // just the one call that happened to land INTERESTED.
          dbSelect("call_logs",`?select=phone&phone=in.(${phoneList})`),
        ]);
        leads.forEach(l=>leadsMap[l.phone]=l.name);
        // The "Status" column is a local note on this page's own log
        // (candidate_updates) and doesn't change just because a candidate
        // got moved into a HireFlow stage from here — a candidate moved to
        // e.g. Interview Scheduled still shows local Status "PENDING"
        // forever unless someone separately edits that field too, which
        // reads as "still pending" even though they've actually moved on.
        // This tracks their real, live HireFlow stage instead.
        hfCandidates.forEach(c=>{candidateNameMap[c.phone]=c.name;candidateStageMap[c.phone]=c.current_stage_id;});
        allLogsForPhones.forEach(l=>{dialCountMap[l.phone]=(dialCountMap[l.phone]||0)+1;});
      }
      const enriched=dedupedLogs.map(l=>({...l,name:candidateNameMap[l.phone]||leadsMap[l.phone]||"Unknown",ivrDialCount:dialCountMap[l.phone]||0,hireflowStageId:candidateStageMap[l.phone]||null}));
      setCandidates(enriched);
      setCampaigns([...new Set(logs.map(c=>c.campaign).filter(Boolean))]);
      const updMap={};
      updatesData.forEach(u=>{if(!updMap[u.phone])updMap[u.phone]=[];updMap[u.phone].push(u);});
      setUpdates(updMap);
    }catch(e){showToast("Failed to load","error");}
    finally{setLoading(false);}
  }

  async function saveUpdate(){
    if(!selected)return;
    const targetStage=moveToStageId?funnelStages.find(s=>s.id===moveToStageId):null;
    if(targetStage&&matchedCandidate===null&&(!convertProcessId||!convertPositionId)){
      showToast("Pick a Process and Position to create this candidate in HireFlow","error");return;
    }
    setSaving(true);
    try{
      await dbInsert("candidate_updates",{phone:selected.phone,candidate_name:selected.name,campaign:selected.campaign,status:updateForm.status,comment:updateForm.comment,updated_by:getEmail()});

      if(targetStage){
        if(matchedCandidate){
          await dbUpdate("candidates",`id=eq.${matchedCandidate.id}`,{current_stage_id:targetStage.id,updated_at:new Date().toISOString()});
          await dbInsert("candidate_activity",{
            candidate_id:matchedCandidate.id,type:"STAGE_CHANGE",is_contact_attempt:false,
            from_stage_id:matchedCandidate.current_stage_id,to_stage_id:targetStage.id,
            remark:`Moved to ${targetStage.name} from IVR Interested Candidates${updateForm.comment?` — ${updateForm.comment}`:""}`,
          });
        }else{
          const created=await dbInsert("candidates",{
            name:selected.name==="Unknown"?selected.phone:selected.name,phone:selected.phone,
            process_id:convertProcessId,position_type_id:convertPositionId,company_id:convertCompanyId||null,
            current_stage_id:targetStage.id,
          });
          await dbInsert("candidate_activity",{
            candidate_id:created[0].id,type:"STAGE_CHANGE",is_contact_attempt:false,
            to_stage_id:targetStage.id,
            remark:`Created from IVR Interested Candidates, straight to ${targetStage.name}${updateForm.comment?` — ${updateForm.comment}`:""}`,
          });
        }
      }

      showToast(targetStage?`Update saved — ${matchedCandidate?"moved":"created"} in HireFlow (${targetStage.name})`:"Update saved","success");
      setSelected(null);setUpdateForm({status:"PENDING",comment:""});load();
    }catch(e){showToast(e.message||"Failed","error");}
    finally{setSaving(false);}
  }

  const [forceDialing,setForceDialing]=useState(null);
  async function forceDial(phone){
    if(!window.confirm(`Force dial ${phone}? This bypasses both the "already interested" protection and the DND list.`)) return;
    setForceDialing(phone);
    try{
      await renderFetch("/test-call",{method:"POST",body:JSON.stringify({phone,campaign:"FORCE_REDIAL",bypass_dnd:true})});
      showToast(`Calling ${phone} now`,"success");
    }catch(e){showToast(e.message||"Failed to dial","error");}
    finally{setForceDialing(null);}
  }

  const filtered=candidates.filter(c=>{
    const qMatch=!search||c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search);
    const cMatch=filterCampaign==="ALL"||(c.allCampaigns||[c.campaign]).includes(filterCampaign);
    const s=updates[c.phone]?.[0]?.status||"PENDING";
    const sMatch=filterStatus==="ALL"||s===filterStatus;
    const date=new Date(c.logged_at);
    const fMatch=!filterFrom||date>=new Date(filterFrom);
    const tMatch=!filterTo||date<=new Date(filterTo+"T23:59:59");
    return qMatch&&cMatch&&sMatch&&fMatch&&tMatch;
  });

  const total=candidates.length;
  const sc={PICKED_UP:0,REJECTED:0,HIRED:0,PENDING:0};
  candidates.forEach(c=>{const s=updates[c.phone]?.[0]?.status||"PENDING";sc[s]=(sc[s]||0)+1;});

  return(
    <div>
      <div className="page-header">
        <div><div className="page-title">Interested Candidates</div><div className="page-sub">Track follow-ups and interview pipeline</div></div>
        <button className="btn btn-sm btn-ghost" onClick={()=>downloadCSV(`candidates_${Date.now()}.csv`,["Name","Phone","Campaign","Status","Comment","Updated By","Time"],filtered.map(c=>{const u=updates[c.phone]?.[0];return[c.name,c.phone,c.campaign,u?.status||"PENDING",u?.comment||"",u?.updated_by||"",u?.updated_at?new Date(u.updated_at).toLocaleString("en-IN"):""];}))}>Download Report</button>
      </div>
      <div className="page-content">
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
          {[["Total","blue",total],["Picked Up","green",sc.PICKED_UP],["Rejected","red",sc.REJECTED],["Hired","purple",sc.HIRED],["Pending","amber",sc.PENDING]].map(([l,c,v])=>(
            <div key={l} className="kpi-card"><div className="kpi-label">{l}</div><div className={`kpi-value ${c}`}>{v}</div></div>
          ))}
        </div>
        <div className="filter-row" style={{marginBottom:16}}>
          <input className="filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone" style={{maxWidth:220}}/>
          <FilterSelect value={filterCampaign==="ALL"?"":filterCampaign} onChange={v=>{const nv=v||"ALL";setFilterCampaign(nv);saveFilter("cand_campaign",nv);}} allLabel="All Campaigns" options={campaigns.map(c=>({value:c,label:c}))}/>
          <FilterSelect value={filterStatus==="ALL"?"":filterStatus} onChange={v=>{const nv=v||"ALL";setFilterStatus(nv);saveFilter("cand_status",nv);}} allLabel="All Status" options={[
            {value:"PENDING",label:"Pending"},
            {value:"PICKED_UP",label:"Picked Up"},
            {value:"REJECTED",label:"Rejected"},
            {value:"HIRED",label:"Hired"},
          ]}/>
          <input type="date" className="filter-input" value={filterFrom} onChange={e=>setFilterFrom(e.target.value)} title="From date"/>
          <span style={{color:T.muted,fontSize:12}}>to</span>
          <input type="date" className="filter-input" value={filterTo} onChange={e=>setFilterTo(e.target.value)} title="To date"/>
          {(filterFrom||filterTo)&&<button className="btn btn-sm btn-ghost" onClick={()=>{setFilterFrom("");setFilterTo("");}}>Clear</button>}
          <button className="btn btn-sm btn-ghost" onClick={load}>↻</button>
        </div>
        <div className="card">
          <div className="table-wrap">
            {!loading&&filtered.length===0?(
              <div className="empty-state"><div className="empty-icon">☆</div><div className="empty-title">No interested candidates yet</div><div className="empty-sub">Candidates who press 1 appear here</div></div>
            ):(
              <table className="table-compact">
                <thead><tr><th>Name</th><th>Phone</th><th>Campaign</th><th title="Total IVR dial attempts to this number, any outcome">IVR Attempts</th><th title="This page's own local note — doesn't change when the candidate is moved to a HireFlow stage below">Status (local)</th><th title="The candidate's actual live stage in HireFlow, if they've been matched/moved there">HireFlow Stage</th><th>Last Update</th><th>By</th><th></th></tr></thead>
                <tbody>{loading?<SkeletonRows cols={9}/>:filtered.map((c,i)=>{const u=updates[c.phone]?.[0];const hfStage=funnelStages.find(s=>s.id===c.hireflowStageId);return(
                  <tr key={i}>
                    <td style={{fontWeight:500}}>{c.name}</td>
                    <td style={{fontFamily:"monospace"}}>{c.phone}</td>
                    <td>{(c.allCampaigns||[c.campaign]).map(camp=><span key={camp} className="tag" style={{marginRight:4,marginBottom:2,display:"inline-block"}}>{camp}</span>)}</td>
                    <td>{c.ivrDialCount}x</td>
                    <td><DisposBadge sub={u?.status||"PENDING"}/></td>
                    <td>{hfStage?<span className="badge badge-blue">{hfStage.name}</span>:<span style={{color:T.muted,fontSize:12}}>Not in HireFlow</span>}</td>
                    <td style={{fontSize:12,color:T.muted,maxWidth:180}}>{u?.comment||"—"}</td>
                    <td style={{fontSize:11,color:T.muted}}>{u?.updated_by?.split("@")[0]||"—"}</td>
                    <td style={{display:"flex",gap:6}}>
                      <button className="btn btn-sm btn-purple" onClick={()=>{setSelected(c);setUpdateForm({status:u?.status||"PENDING",comment:""});}}>Update</button>
                      <button className="btn btn-sm btn-ghost" onClick={()=>forceDial(c.phone)} disabled={forceDialing===c.phone} title="Bypass interested protection and call again">{forceDialing===c.phone?"Dialing...":"Force Dial"}</button>
                    </td>
                  </tr>
                );})}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {selected&&(
        <Modal title={`Update: ${selected.name}`} sub={`${selected.phone} · ${selected.campaign}`} onClose={()=>setSelected(null)}
          actions={<><button className="btn btn-sm btn-ghost" onClick={()=>setSelected(null)}>Cancel</button><button className="btn btn-sm btn-purple" onClick={saveUpdate} disabled={saving||(!!moveToStageId&&matchedCandidate===undefined)}>{saving?"Saving...":"Save Update"}</button></>}>
          {updates[selected.phone]?.length>0&&(
            <div style={{marginBottom:16}}>
              <div className="section-label">History</div>
              {updates[selected.phone].map((u,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><DisposBadge sub={u.status}/><span style={{fontSize:12,color:T.muted}}>by {u.updated_by}</span></div>
                  {u.comment&&<div style={{fontSize:13,color:T.text,marginTop:4,fontStyle:"italic"}}>"{u.comment}"</div>}
                  <div style={{fontSize:11,color:T.muted,marginTop:4}}>{new Date(u.updated_at).toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          )}
          <div className="section-label">New Update</div>
          <div className="field"><label>Status (local note on this page only)</label>
            <select value={updateForm.status} onChange={e=>setUpdateForm({...updateForm,status:e.target.value})}>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="HIRED">Hired</option>
            </select>
          </div>
          <div className="field"><label>Move to HireFlow Stage (optional)</label>
            <select value={moveToStageId} onChange={e=>setMoveToStageId(e.target.value)}>
              <option value="">— Don't move —</option>
              {funnelStages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {!!moveToStageId&&(
            matchedCandidate===undefined?(
              <div className="info-box" style={{marginBottom:14}}>Checking HireFlow for this phone number...</div>
            ):matchedCandidate?(
              <div className="info-box" style={{marginBottom:14}}>Already a HireFlow candidate (<strong>{matchedCandidate.name}</strong>) — saving will move them to <strong>{funnelStages.find(s=>s.id===moveToStageId)?.name}</strong>.</div>
            ):(
              <div style={{marginBottom:14}}>
                <div className="info-box amber" style={{marginBottom:10}}>No HireFlow candidate for this phone yet — pick a Process and Position to create one, straight into <strong>{funnelStages.find(s=>s.id===moveToStageId)?.name}</strong>.</div>
                <div className="two-col">
                  <div className="field" style={{marginBottom:0}}><label>Process *</label>
                    <select value={convertProcessId} onChange={e=>setConvertProcessId(e.target.value)}>
                      <option value="">—</option>{processes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{marginBottom:0}}><label>Position Type *</label>
                    <select value={convertPositionId} onChange={e=>setConvertPositionId(e.target.value)}>
                      <option value="">—</option>{positionTypes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{marginBottom:0}}><label>Company (optional)</label>
                    <select value={convertCompanyId} onChange={e=>setConvertCompanyId(e.target.value)}>
                      <option value="">—</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )
          )}
          <div className="field"><label>Comment</label><textarea rows="3" style={{resize:"vertical"}} placeholder="Notes about this candidate..." value={updateForm.comment} onChange={e=>setUpdateForm({...updateForm,comment:e.target.value})}/></div>
          <div style={{fontSize:12,color:T.muted}}>Saving as: <strong>{getEmail()}</strong></div>
        </Modal>
      )}
    </div>
  );
}

// ================================================
// DND LIST
// ================================================
function DndList({ showToast }) {
  const [dnd,setDnd]=useState([]);const [phone,setPhone]=useState("");const [adding,setAdding]=useState(false);
  const [nameMap,setNameMap]=useState({});
  const [search,setSearch]=useState("");
  useEffect(()=>{load();},[]);
  async function load(){
    try{
      const data=await dbSelect("dnd_list","?select=*&order=added_at.desc");
      setDnd(data);
      // Fetch names from leads table
      const phones=data.map(d=>d.phone).filter(Boolean);
      if(phones.length){
        const leads=await dbSelect("leads",`?select=phone,name&phone=in.(${phones.slice(0,200).join(",")})`);
        const map={};
        leads.forEach(l=>{if(!map[l.phone])map[l.phone]=l.name;});
        setNameMap(map);
      }
    }catch{showToast("Failed","error");}
  }
  async function addDnd(){
    const clean=phone.replace(/\D/g,"");
    if(!clean||clean.length!==10){showToast("Enter a valid 10-digit number","error");return;}
    setAdding(true);
    try{await dbInsert("dnd_list",{phone:clean,reason:"MANUAL"});showToast(`${clean} blocked`,"success");setPhone("");load();}
    catch{showToast("Already in DND or failed","error");}
    finally{setAdding(false);}
  }
  async function remove(p){try{await dbDelete("dnd_list",`phone=eq.${p}`);showToast("Removed","success");load();}catch{showToast("Failed","error");}}
  const filteredDnd=dnd.filter(d=>!search||(nameMap[d.phone]||"").toLowerCase().includes(search.toLowerCase())||d.phone.includes(search));
  return(
    <div>
      <div className="page-header"><div><div className="page-title">DND List</div><div className="page-sub">Blocked numbers — Not Interested responses auto-added</div></div></div>
      <div className="page-content">
        <div className="card">
          <div className="card-header"><div className="card-title">Block a Number</div></div>
          <div className="card-body">
            <div className="input-row">
              <div className="field"><label>Phone Number</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210" onKeyDown={e=>e.key==="Enter"&&addDnd()}/></div>
              <button className="btn btn-sm btn-danger" onClick={addDnd} disabled={adding}>{adding?"Adding...":"Block"}</button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Blocked Numbers ({filteredDnd.length})</div>
            <div style={{display:"flex",gap:8}}>
              <input className="filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone" style={{maxWidth:200}}/>
              <button className="btn btn-sm btn-ghost" onClick={load}>↻</button>
            </div>
          </div>
          <div className="table-wrap">
            {filteredDnd.length===0?<div className="empty-state"><div className="empty-icon">⊘</div><div className="empty-title">No numbers blocked</div></div>:(
              <table>
                <thead><tr><th>Name</th><th>Phone</th><th>Reason</th><th>Added</th><th></th></tr></thead>
                <tbody>{filteredDnd.map(d=>(
                  <tr key={d.id}>
                    <td style={{fontWeight:500}}>{nameMap[d.phone]||"—"}</td>
                    <td style={{fontFamily:"monospace"}}>{d.phone}</td>
                    <td><DisposBadge sub={d.reason==="NOT_INTERESTED"?"NOT_INTERESTED":"MANUAL"}/></td>
                    <td style={{color:T.muted,fontSize:12}}>{new Date(d.added_at).toLocaleDateString("en-IN")}</td>
                    <td><button className="btn btn-sm btn-ghost" onClick={()=>remove(d.phone)}>Remove</button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// CALLER IDS
// ================================================
function CallerIds({ showToast }) {
  const [list,setList]=useState([]);const [number,setNumber]=useState("");const [label,setLabel]=useState("");const [adding,setAdding]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){try{setList(await dbSelect("caller_ids","?select=*&order=added_at.desc"));}catch{}}
  async function add(){
    const clean=number.replace(/\s/g,"");if(!clean){showToast("Enter a number","error");return;}
    setAdding(true);
    try{await dbInsert("caller_ids",{number:clean,label:label||clean,is_active:true});showToast("Added","success");setNumber("");setLabel("");load();}
    catch{showToast("Already exists or failed","error");}
    finally{setAdding(false);}
  }
  async function toggle(id,cur){try{await dbUpdate("caller_ids",`id=eq.${id}`,{is_active:!cur});load();}catch{showToast("Failed","error");}}
  async function remove(id){try{await dbDelete("caller_ids",`id=eq.${id}`);showToast("Removed","success");load();}catch{showToast("Failed","error");}}
  return(
    <div>
      <div className="page-header"><div><div className="page-title">Caller IDs</div><div className="page-sub">Manage outbound phone numbers</div></div></div>
      <div className="page-content">
        <div className="card">
          <div className="card-header"><div className="card-title">Add Number</div></div>
          <div className="card-body">
            <div className="two-col" style={{marginBottom:12}}>
              <div className="field"><label>Number (with country code)</label><input value={number} onChange={e=>setNumber(e.target.value)} placeholder="+918071579999"/></div>
              <div className="field"><label>Label</label><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Primary Number"/></div>
            </div>
            <button className="btn btn-sm" onClick={add} disabled={adding}>{adding?"Adding...":"Add Number"}</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Your Numbers</div><button className="btn btn-sm btn-ghost" onClick={load}>↻</button></div>
          <div className="table-wrap">
            {list.length===0?<div className="empty-state"><div className="empty-icon">☎</div><div className="empty-title">No numbers yet</div></div>:(
              <table>
                <thead><tr><th>Number</th><th>Label</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{list.map(c=>(
                  <tr key={c.id}>
                    <td style={{fontFamily:"monospace"}}>{c.number}</td>
                    <td>{c.label}</td>
                    <td><span className={`badge ${c.is_active?"badge-green":"badge-gray"}`}>{c.is_active?"Active":"Inactive"}</span></td>
                    <td style={{display:"flex",gap:6}}>
                      <button className="btn btn-sm btn-ghost" onClick={()=>toggle(c.id,c.is_active)}>{c.is_active?"Deactivate":"Activate"}</button>
                      <button className="btn btn-sm btn-danger" onClick={()=>remove(c.id)}>Remove</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// AUDIO MANAGER
// ================================================
function AudioManager({ showToast }) {
  const [files,setFiles]=useState([]);const [editing,setEditing]=useState(null);const [newUrl,setNewUrl]=useState("");const [saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){try{setFiles(await dbSelect("audio_files","?select=*&order=key"));}catch{showToast("Failed","error");}}
  async function save(){
    setSaving(true);
    try{await dbUpdate("audio_files",`key=eq.${editing.key}`,{url:newUrl.trim(),updated_at:new Date().toISOString()});showToast(`${editing.label} updated`,"success");setEditing(null);setNewUrl("");load();}
    catch{showToast("Failed","error");}
    finally{setSaving(false);}
  }
  return(
    <div>
      <div className="page-header"><div><div className="page-title">Audio Manager</div><div className="page-sub">Update IVR audio — changes go live instantly, no restart needed</div></div></div>
      <div className="page-content">
        <div className="card">
          <div className="card-header"><div className="card-title">IVR Audio Files</div></div>
          <div className="card-body">
            {files.map(f=>(
              <div key={f.key} className="audio-row">
                <div><div style={{fontWeight:500,fontSize:14}}>{f.label}</div><div style={{fontSize:11,color:T.muted,fontFamily:"monospace"}}>{f.key}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {f.url&&!f.url.includes("YOUR_")&&<audio controls style={{height:30}} src={f.url}/>}
                  <button className="btn btn-sm btn-ghost" onClick={()=>{setEditing(f);setNewUrl(f.url);}}>Replace</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editing&&(
        <Modal title={`Replace: ${editing.label}`} sub="Paste Cloudinary URL. Goes live immediately after save." onClose={()=>setEditing(null)}
          actions={<><button className="btn btn-sm btn-ghost" onClick={()=>setEditing(null)}>Cancel</button><button className="btn btn-sm" disabled={saving||!newUrl.trim()} onClick={save}>{saving?"Saving...":"Save & Go Live"}</button></>}>
          <div className="field"><label>New Audio URL</label><input value={newUrl} onChange={e=>setNewUrl(e.target.value)} placeholder="https://res.cloudinary.com/..."/></div>
          {newUrl&&<audio controls src={newUrl} style={{width:"100%",marginTop:10}}/>}
        </Modal>
      )}
    </div>
  );
}

// ================================================
// CALL LOGS
// ================================================
function CallLogs({ showToast }) {
  const [logs,setLogs]=useState([]);const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [fd,setFd]=useState("");
  const [td,setTd]=useState("");
  const [fc,setFc]=useState(()=>loadFilter("logs_campaign","ALL"));
  const [fds,setFds]=useState(()=>loadFilter("logs_disp","ALL"));
  const [limit,setLimit]=useState(()=>loadFilter("logs_limit","ALL"));
  const [campaigns,setCampaigns]=useState([]);

  useEffect(()=>{load();},[]);

  async function load(){
    setLoading(true);
    try{
      const data=await dbSelect("call_logs","?select=*&order=logged_at.desc&limit=2000");
      setLogs(data);setCampaigns([...new Set(data.map(l=>l.campaign).filter(Boolean))]);
      if(data.length>=2000)showToast("Showing the most recent 2000 records — narrow the date range for a complete export","warn");
    }catch{showToast("Failed","error");}
    finally{setLoading(false);}
  }

  function quickRange(days){
    const to=new Date();
    const from=new Date();from.setDate(to.getDate()-(days-1));
    setFd(from.toISOString().split("T")[0]);
    setTd(to.toISOString().split("T")[0]);
  }

  const filtered=logs.filter(l=>{
    const qM=!search||l.phone.includes(search);
    const cM=fc==="ALL"||l.campaign===fc;
    const dM=fds==="ALL"||l.sub_disposition===fds;
    const date=new Date(l.logged_at);
    const sM=!fd||date>=new Date(fd);
    const eM=!td||date<=new Date(td+"T23:59:59");
    return qM&&cM&&dM&&sM&&eM;
  });
  const display=limit==="ALL"?filtered:filtered.slice(0,parseInt(limit));

  function doExport(){
    downloadCSV(`hireflow_logs_${fc}_${Date.now()}.csv`,["Phone","Campaign","Main","Disposition","Date"],display.map(l=>[l.phone,l.campaign,l.main_disposition,l.sub_disposition,new Date(l.logged_at).toLocaleString("en-IN")]));
    showToast(`Exported ${display.length} rows`,"success");
  }

  const summary=filtered.reduce((a,l)=>{a[l.sub_disposition]=(a[l.sub_disposition]||0)+1;return a;},{});
  const dispositions=["INTERESTED","NOT_INTERESTED","NO_RESPONSE","INVALID_INPUT","BUSY","FAILED","CALL_DISCONNECTED"];

  return(
    <div>
      <div className="page-header">
        <div><div className="page-title">Call Logs & Reports</div><div className="page-sub">{filtered.length} records match filters</div></div>
        <div style={{display:"flex",gap:8}}>
          <select className="filter-select" value={limit} onChange={e=>setLimit(e.target.value)}>
            <option value="50">50 rows</option><option value="100">100 rows</option>
            <option value="500">500 rows</option><option value="ALL">All rows</option>
          </select>
          <button className="btn btn-sm btn-ghost" onClick={doExport}>Download CSV</button>
        </div>
      </div>
      <div className="page-content">
        {fc!=="ALL"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {[["INTERESTED",T.green],["NOT_INTERESTED",T.red],["BUSY",T.amber],["FAILED",T.muted]].map(([k,c])=>(
              <div key={k} className="kpi-card">
                <div className="kpi-label">{k.replace(/_/g," ")}</div>
                <div className="kpi-value" style={{color:c,fontSize:22}}>{summary[k]||0}</div>
                <div className="kpi-sub">{filtered.length?`${Math.round(((summary[k]||0)/filtered.length)*100)}%`:""}</div>
              </div>
            ))}
          </div>
        )}
        <div className="filter-row" style={{marginBottom:16}}>
          <input className="filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search phone" style={{maxWidth:180}}/>
          <FilterSelect value={fc==="ALL"?"":fc} onChange={v=>setFc(v||"ALL")} allLabel="All Campaigns" options={campaigns.map(c=>({value:c,label:c}))}/>
          <FilterSelect value={fds==="ALL"?"":fds} onChange={v=>setFds(v||"ALL")} allLabel="All Dispositions" options={dispositions.map(d=>({value:d,label:d.replace(/_/g," ")}))}/>
          <input type="date" className="filter-input" value={fd} onChange={e=>setFd(e.target.value)} title="From date"/>
          <input type="date" className="filter-input" value={td} onChange={e=>setTd(e.target.value)} title="To date"/>
          <button className="btn btn-sm btn-ghost" onClick={()=>quickRange(7)}>7 Days</button>
          <button className="btn btn-sm btn-ghost" onClick={()=>quickRange(30)}>30 Days</button>
          {(fd||td)&&<button className="btn btn-sm btn-ghost" onClick={()=>{setFd("");setTd("");}}>✕ Clear</button>}
          <button className="btn btn-sm btn-ghost" onClick={load}>↻</button>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Showing {display.length} of {filtered.length}</div></div>
          <div className="table-wrap">
            {loading?<div className="empty-state">Loading...</div>:display.length===0?(
              <div className="empty-state"><div className="empty-icon">▤</div><div className="empty-title">No logs match</div></div>
            ):(
              <table>
                <thead><tr><th>Phone</th><th>Campaign</th><th>Status</th><th>Disposition</th><th>Time</th></tr></thead>
                <tbody>{display.map(log=>(
                  <tr key={log.id}>
                    <td style={{fontFamily:"monospace"}}>{log.phone}</td>
                    <td><span className="tag">{log.campaign}</span></td>
                    <td><span className={`badge ${log.main_disposition==="CONNECTED"?"badge-green":"badge-red"}`}>{log.main_disposition}</span></td>
                    <td><DisposBadge sub={log.sub_disposition}/></td>
                    <td style={{color:T.muted,fontSize:12}}>{new Date(log.logged_at).toLocaleString("en-IN")}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// USER MANAGEMENT
// ================================================
function UserManagement({ showToast }) {
  const [users,setUsers]=useState([]);const [loading,setLoading]=useState(false);
  const [form,setForm]=useState({email:"",name:"",role:"HR",password:"",manager_id:""});
  const [adding,setAdding]=useState(false);const [resetting,setResetting]=useState(null);
  const [search,setSearch]=useState("");

  useEffect(()=>{load();},[]);
  async function load(){setLoading(true);try{setUsers(await dbSelect("user_roles","?select=*&order=created_at.desc"));}catch{showToast("Failed","error");}finally{setLoading(false);}}

  async function createUser(){
    if(!form.email||!form.password){showToast("Email and password required","error");return;}
    if(form.password.length<8){showToast("Password must be at least 8 characters","error");return;}
    setAdding(true);
    try{
      const {manager_id,...createBody}=form;
      const res=await renderFetch("/auth/create-user",{method:"POST",body:JSON.stringify(createBody)});
      // Store user_id (and reporting line, if set) in user_roles so delete works properly
      const patch={};
      if(res.user_id) patch.user_id=res.user_id;
      if(manager_id) patch.manager_id=manager_id;
      if(Object.keys(patch).length){
        await dbUpdate("user_roles",`email=eq.${encodeURIComponent(form.email)}`,patch);
      }
      showToast(`${form.email} created. Password setup email sent.`,"success");
      setForm({email:"",name:"",role:"HR",password:"",manager_id:""});load();
    }catch(e){showToast(e.message||"Failed to create user","error");}
    finally{setAdding(false);}
  }

  async function resetPassword(email){
    setResetting(email);
    try{
      await renderFetch("/auth/reset-password",{method:"POST",body:JSON.stringify({email})});
      showToast(`Reset email sent to ${email}`,"success");
    }catch(e){showToast(e.message||"Failed","error");}
    finally{setResetting(null);}
  }

  async function updateRole(id,role){try{await dbUpdate("user_roles",`id=eq.${id}`,{role});showToast("Role updated","success");load();}catch{showToast("Failed","error");}}
  async function toggleActive(id,cur){try{await dbUpdate("user_roles",`id=eq.${id}`,{is_active:!cur});load();}catch{showToast("Failed","error");}}
  async function updateManager(id,managerId){try{await dbUpdate("user_roles",`id=eq.${id}`,{manager_id:managerId||null});showToast("Reporting line updated","success");load();}catch{showToast("Failed","error");}}

  async function deleteUser(email, userId){
    if(!window.confirm(`Permanently delete ${email}? This cannot be undone.`)) return;
    try{
      await renderFetch("/auth/delete-user",{method:"DELETE",body:JSON.stringify({email, user_id: userId||""})});
      showToast(`${email} deleted`,"success");
      load();
    }catch(e){showToast(e.message||"Failed to delete user","error");}
  }

  const roleColors={ADMIN:T.red,MANAGER:T.accent,HR:T.green,CEO:T.purple};

  return(
    <div>
      <div className="page-header"><div><div className="page-title">User Management</div><div className="page-sub">Create accounts, assign roles, reset passwords</div></div></div>
      <div className="page-content">
        <div className="card">
          <div className="card-header"><div className="card-title">Create New User</div></div>
          <div className="card-body">
            <div className="two-col" style={{marginBottom:12}}>
              <div className="field"><label>Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></div>
              <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="hr@company.com"/></div>
            </div>
            <div className="two-col" style={{marginBottom:12}}>
              <div className="field"><label>Temporary Password *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 8 characters"/></div>
              <div className="field"><label>Role</label>
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option value="HR">HR</option>
                  <option value="MANAGER">HR Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CEO">CEO (reports only)</option>
                </select>
              </div>
            </div>
            <div className="two-col" style={{marginBottom:12}}>
              <div className="field"><label>Reports To</label>
                <select value={form.manager_id} onChange={e=>setForm({...form,manager_id:e.target.value})}>
                  <option value="">— None —</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}
                </select>
              </div>
            </div>
            <div className="info-box amber" style={{marginBottom:12}}>A password reset email will be sent automatically so the user can set their own password.</div>
            <button className="btn btn-sm" onClick={createUser} disabled={adding}>{adding?"Creating...":"Create User & Send Email"}</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">All Users ({users.filter(u=>!search||(u.name||"").toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())).length})</div>
            <div style={{display:"flex",gap:8}}>
              <input className="filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email" style={{maxWidth:200}}/>
              <button className="btn btn-sm btn-ghost" onClick={load}>↻</button>
            </div>
          </div>
          <div className="table-wrap">
            {!loading&&users.length===0?<div className="empty-state"><div className="empty-icon">◉</div><div className="empty-title">No users</div></div>:(
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Change Role</th><th>Reports To</th><th>Actions</th></tr></thead>
                <tbody>{loading?<SkeletonRows cols={7}/>:users.filter(u=>!search||(u.name||"").toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())).map(u=>(
                  <tr key={u.id}>
                    <td style={{fontWeight:500}}>{u.name||"—"}</td>
                    <td style={{fontFamily:"monospace",fontSize:12}}>{u.email}</td>
                    <td><span className="badge" style={{background:`${roleColors[u.role]||T.muted}22`,color:roleColors[u.role]||T.muted}}>{u.role}</span></td>
                    <td><span className={`badge ${u.is_active?"badge-green":"badge-gray"}`}>{u.is_active?"Active":"Inactive"}</span></td>
                    <td>
                      {u.email!==getEmail()?(
                        <select className="filter-select" value={u.role} onChange={e=>updateRole(u.id,e.target.value)} style={{padding:"4px 8px",fontSize:12}}>
                          <option value="HR">HR</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option><option value="CEO">CEO</option>
                        </select>
                      ):<span style={{fontSize:12,color:T.muted}}>You</span>}
                    </td>
                    <td>
                      <select className="filter-select" value={u.manager_id||""} onChange={e=>updateManager(u.id,e.target.value)} style={{padding:"4px 8px",fontSize:12}}>
                        <option value="">— None —</option>
                        {users.filter(m=>m.id!==u.id).map(m=><option key={m.id} value={m.id}>{m.name||m.email}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <button className="btn btn-sm btn-ghost" onClick={()=>resetPassword(u.email)} disabled={resetting===u.email}>{resetting===u.email?"Sending...":"Reset Password"}</button>
                        {u.email!==getEmail()&&<button className="btn btn-sm btn-ghost" onClick={()=>toggleActive(u.id,u.is_active)}>{u.is_active?"Deactivate":"Activate"}</button>}
                        {u.email!==getEmail()&&<button className="btn btn-sm btn-danger" onClick={()=>deleteUser(u.email, u.user_id)}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Role Permissions</div></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Feature</th><th style={{color:T.red,textAlign:"center"}}>Admin</th><th style={{color:T.accent,textAlign:"center"}}>Manager</th><th style={{color:T.green,textAlign:"center"}}>HR</th></tr></thead>
              <tbody>{[
                ["Dashboard & Call Logs","Done","Done","Done"],
                ["Upload Leads","Done","Done","Done"],
                ["Candidate Updates","Done","Done","Done"],
                ["Start / Pause Campaigns","Done","Done","✗"],
                ["Create / Delete Campaigns","Done","Done","✗"],
                ["Audio Manager","Done","Done","✗"],
                ["Caller IDs & DND","Done","Done","✗"],
                ["User Management","Done","✗","✗"],
              ].map(([f,a,m,h])=>(
                <tr key={f}>
                  <td>{f}</td>
                  <td style={{color:a==="Done"?T.green:T.red,fontWeight:700,textAlign:"center"}}>{a}</td>
                  <td style={{color:m==="Done"?T.green:T.red,fontWeight:700,textAlign:"center"}}>{m}</td>
                  <td style={{color:h==="Done"?T.green:T.red,fontWeight:700,textAlign:"center"}}>{h}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// HIREFLOW — REFERENCE LIST ADMIN
// Processes / Position Types / Lead Sources share the same simple
// name + active-toggle shape, same pattern as Caller IDs / Audio Manager.
// ================================================
function SimpleRefList({ table, title, placeholder, showToast, candidateField }) {
  const [list,setList]=useState([]);const [name,setName]=useState("");const [adding,setAdding]=useState(false);
  const [editingId,setEditingId]=useState(null);const [editName,setEditName]=useState("");const [saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){try{setList(await dbSelect(table,"?select=*&order=created_at"));}catch{}}
  async function add(){
    const clean=name.trim();if(!clean){showToast("Enter a name","error");return;}
    setAdding(true);
    try{await dbInsert(table,{name:clean,is_active:true});showToast("Added","success");setName("");load();}
    catch{showToast("Already exists or failed","error");}
    finally{setAdding(false);}
  }
  async function toggle(id,cur){try{await dbUpdate(table,`id=eq.${id}`,{is_active:!cur});load();}catch{showToast("Failed","error");}}
  async function remove(id){
    if(!window.confirm("Remove this entry? Candidates already tagged with it keep the tag — it just won't be selectable for new ones."))return;
    try{await dbDelete(table,`id=eq.${id}`);showToast("Removed","success");load();}catch{showToast("Failed — may be in use","error");}
  }
  function startEdit(r){setEditingId(r.id);setEditName(r.name);}
  async function saveEdit(id){
    const clean=editName.trim();if(!clean){showToast("Name can't be empty","error");return;}
    setSaving(true);
    try{await dbUpdate(table,`id=eq.${id}`,{name:clean});showToast("Renamed","success");setEditingId(null);load();}
    catch{showToast("Failed to rename — name may already exist","error");}
    finally{setSaving(false);}
  }
  return(
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="card-body">
        <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"flex-end"}}>
          <div className="field" style={{marginBottom:0,flex:1}}><label>Add New</label><input value={name} onChange={e=>setName(e.target.value)} placeholder={placeholder} onKeyDown={e=>e.key==="Enter"&&add()}/></div>
          <button className="btn btn-sm" style={{flexShrink:0}} onClick={add} disabled={adding}>{adding?"Adding...":"Add"}</button>
        </div>
        {list.length===0?<div className="empty-state"><div className="empty-icon">☰</div><div className="empty-title">None yet</div></div>:(
          <table>
            <thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{list.map(r=>(
              <tr key={r.id}>
                <td style={{fontWeight:500}}>
                  {editingId===r.id?(
                    <div style={{display:"flex",gap:6}}>
                      <input value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit(r.id)} style={{flex:1}}/>
                      <button className="btn btn-sm" onClick={()=>saveEdit(r.id)} disabled={saving}>Save</button>
                      <button className="btn btn-sm btn-ghost" onClick={()=>setEditingId(null)}>Cancel</button>
                    </div>
                  ):r.name}
                </td>
                <td><span className={`badge ${r.is_active?"badge-green":"badge-gray"}`}>{r.is_active?"Active":"Inactive"}</span></td>
                <td style={{display:"flex",gap:6}}>
                  {editingId!==r.id&&<button className="btn btn-sm btn-ghost" onClick={()=>startEdit(r)}>Rename</button>}
                  <button className="btn btn-sm btn-ghost" onClick={()=>toggle(r.id,r.is_active)}>{r.is_active?"Deactivate":"Activate"}</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>remove(r.id)}>Remove</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {candidateField&&<MergeCandidatesTool table={table} candidateField={candidateField} options={list} showToast={showToast} onDone={load}/>}
    </div>
  );
}

// Moves every candidate from one Process/Position Type to another in one
// shot -- for when a lookup entry is being retired/merged rather than just
// renamed (renaming keeps the same id, so it needs no candidate changes at
// all; this is only for when the id itself is going away).
function MergeCandidatesTool({ table, candidateField, options, showToast, onDone }) {
  const [fromId,setFromId]=useState("");
  const [toId,setToId]=useState("");
  const [merging,setMerging]=useState(false);
  async function merge(){
    if(!fromId||!toId){showToast("Pick both a source and a destination","error");return;}
    if(fromId===toId){showToast("Source and destination must be different","error");return;}
    const fromLabel=options.find(o=>o.id===fromId)?.name||"—";
    const toLabel=options.find(o=>o.id===toId)?.name||"—";
    if(!window.confirm(`Move every candidate currently tagged "${fromLabel}" to "${toLabel}"? This cannot be undone.`))return;
    setMerging(true);
    try{
      const affected=await dbSelect("candidates",`?select=id&${candidateField}=eq.${fromId}`);
      if(affected.length){
        await dbUpdate("candidates",`${candidateField}=eq.${fromId}`,{[candidateField]:toId});
      }
      showToast(`${affected.length} candidate(s) moved from "${fromLabel}" to "${toLabel}"`,"success");
      setFromId("");setToId("");onDone();
    }catch{showToast("Failed to move candidates","error");}
    finally{setMerging(false);}
  }
  return(
    <div className="card-body" style={{borderTop:`1px solid ${T.border}`}}>
      <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>Merge / Move Candidates</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:12}}>For retiring or splitting an entry — moves every candidate from one value to another. Renaming (above) doesn't need this since the underlying id stays the same.</div>
      <div className="two-col" style={{marginBottom:12}}>
        <div className="field" style={{marginBottom:0}}><label>Move candidates from</label>
          <select value={fromId} onChange={e=>setFromId(e.target.value)}>
            <option value="">—</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div className="field" style={{marginBottom:0}}><label>To</label>
          <select value={toId} onChange={e=>setToId(e.target.value)}>
            <option value="">—</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>
      <button className="btn btn-sm" onClick={merge} disabled={merging||!fromId||!toId}>{merging?"Moving...":"Move Candidates"}</button>
    </div>
  );
}

// ================================================
// HIREFLOW — FUNNEL STAGES ADMIN
// Ordered list (sort_order), reorderable, is_exit_stage marks terminal
// stages (Hired/Rejected/etc.) reachable from anywhere in the funnel.
// ================================================
function FunnelStagesAdmin({ showToast }) {
  const [stages,setStages]=useState([]);const [name,setName]=useState("");const [isExit,setIsExit]=useState(false);const [adding,setAdding]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){try{setStages(await dbSelect("funnel_stages","?select=*&order=sort_order"));}catch{}}
  async function add(){
    const clean=name.trim();if(!clean){showToast("Enter a name","error");return;}
    setAdding(true);
    try{
      const nextOrder=stages.length?Math.max(...stages.map(s=>s.sort_order))+1:1;
      await dbInsert("funnel_stages",{name:clean,sort_order:nextOrder,is_exit_stage:isExit,is_active:true});
      showToast("Added","success");setName("");setIsExit(false);load();
    }catch{showToast("Already exists or failed","error");}
    finally{setAdding(false);}
  }
  async function move(idx,dir){
    const target=idx+dir;
    if(target<0||target>=stages.length)return;
    const a=stages[idx],b=stages[target];
    await dbUpdate("funnel_stages",`id=eq.${a.id}`,{sort_order:b.sort_order});
    await dbUpdate("funnel_stages",`id=eq.${b.id}`,{sort_order:a.sort_order});
    load();
  }
  async function toggleExit(id,cur){try{await dbUpdate("funnel_stages",`id=eq.${id}`,{is_exit_stage:!cur});load();}catch{showToast("Failed","error");}}
  async function toggleActive(id,cur){try{await dbUpdate("funnel_stages",`id=eq.${id}`,{is_active:!cur});load();}catch{showToast("Failed","error");}}
  async function remove(id){
    if(!window.confirm("Remove this stage? Candidates currently on it keep the reference — it just won't be selectable for new stage changes."))return;
    try{await dbDelete("funnel_stages",`id=eq.${id}`);showToast("Removed","success");load();}catch{showToast("Failed — may be in use","error");}
  }
  return(
    <div className="card">
      <div className="card-header"><div className="card-title">Funnel Stages</div></div>
      <div className="card-body">
        <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div className="field" style={{marginBottom:0,flex:1,minWidth:160}}><label>New Stage Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Background Check" onKeyDown={e=>e.key==="Enter"&&add()}/></div>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.muted,marginBottom:10}}>
            <input type="checkbox" checked={isExit} onChange={e=>setIsExit(e.target.checked)} style={{width:"auto"}}/> Exit stage (won/lost, reachable from anywhere)
          </label>
          <button className="btn btn-sm" onClick={add} disabled={adding} style={{marginBottom:10}}>{adding?"Adding...":"Add Stage"}</button>
        </div>
        {stages.length===0?<div className="empty-state"><div className="empty-title">No stages yet</div></div>:(
          <table>
            <thead><tr><th>Order</th><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{stages.map((s,idx)=>(
              <tr key={s.id}>
                <td style={{display:"flex",gap:4}}>
                  <button className="btn btn-sm btn-ghost" onClick={()=>move(idx,-1)} disabled={idx===0} style={{padding:"2px 8px"}}>↑</button>
                  <button className="btn btn-sm btn-ghost" onClick={()=>move(idx,1)} disabled={idx===stages.length-1} style={{padding:"2px 8px"}}>↓</button>
                </td>
                <td style={{fontWeight:500}}>{s.name}</td>
                <td>
                  <span className="badge" style={{cursor:"pointer",background:s.is_exit_stage?`${T.purple}22`:`${T.accent}22`,color:s.is_exit_stage?T.purple:T.accent}} onClick={()=>toggleExit(s.id,s.is_exit_stage)}>
                    {s.is_exit_stage?"Exit stage":"In-funnel"}
                  </span>
                </td>
                <td><span className={`badge ${s.is_active?"badge-green":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>toggleActive(s.id,s.is_active)}>{s.is_active?"Active":"Inactive"}</span></td>
                <td><button className="btn btn-sm btn-danger" onClick={()=>remove(s.id)}>Remove</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DialingSettings({ showToast }) {
  const [retryMinutes,setRetryMinutes]=useState("");
  const [maxRetries,setMaxRetries]=useState("");
  const [saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){
    try{
      const rows=await dbSelect("settings","?select=*&key=in.(hireflow_retry_minutes,hireflow_max_retries)");
      setRetryMinutes(rows.find(r=>r.key==="hireflow_retry_minutes")?.value||"30");
      setMaxRetries(rows.find(r=>r.key==="hireflow_max_retries")?.value||"3");
    }catch{}
  }
  async function save(){
    setSaving(true);
    try{
      await dbUpdate("settings","key=eq.hireflow_retry_minutes",{value:String(retryMinutes),updated_at:new Date().toISOString()});
      await dbUpdate("settings","key=eq.hireflow_max_retries",{value:String(maxRetries),updated_at:new Date().toISOString()});
      showToast("Saved","success");
    }catch{showToast("Failed to save","error");}
    finally{setSaving(false);}
  }
  return(
    <div className="card">
      <div className="card-header"><div className="card-title">On-the-Spot Dialing</div></div>
      <div className="card-body">
        <div className="two-col" style={{marginBottom:12}}>
          <div className="field"><label>Retry Interval (minutes)</label><input type="number" min="1" value={retryMinutes} onChange={e=>setRetryMinutes(e.target.value)}/></div>
          <div className="field"><label>Retries After First Call</label><input type="number" min="0" value={maxRetries} onChange={e=>setMaxRetries(e.target.value)}/></div>
        </div>
        <div className="info-box amber" style={{marginBottom:12}}>Total calls placed = 1 (the initial "Send to IVR" call) + this number. E.g. set to 2 for 1 initial call + 2 retries = 3 calls total, before it stops on its own if still unanswered.</div>
        <button className="btn btn-sm" onClick={save} disabled={saving}>{saving?"Saving...":"Save"}</button>
      </div>
    </div>
  );
}

function IVRQueue({ showToast }) {
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){
    setLoading(true);
    try{setRows(await dbSelect("candidates","?select=id,name,phone,ivr_retry_count,ivr_next_attempt_at&ivr_next_attempt_at=not.is.null&order=ivr_next_attempt_at"));}
    catch{showToast("Failed to load","error");}
    finally{setLoading(false);}
  }
  async function cancel(id){
    try{await dbUpdate("candidates",`id=eq.${id}`,{ivr_next_attempt_at:null});showToast("Retry cancelled","success");load();}
    catch{showToast("Failed","error");}
  }
  return(
    <div className="card">
      <div className="card-header"><div className="card-title">Pending On-the-Spot Retries ({rows.length})</div><button className="btn btn-sm btn-ghost" onClick={load}>↻</button></div>
      <div className="table-wrap">
        {loading?<div className="empty-state">Loading...</div>:rows.length===0?<div className="empty-state"><div className="empty-title">No pending retries</div><div className="empty-sub">Candidates waiting on an automatic IVR retry show up here — not on the Campaigns page.</div></div>:(
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Attempt</th><th>Next Try</th><th>Actions</th></tr></thead>
            <tbody>{rows.map(r=>(
              <tr key={r.id}>
                <td style={{fontWeight:500}}>{r.name}</td>
                <td style={{fontFamily:"monospace"}}>{r.phone}</td>
                <td>{r.ivr_retry_count||0}</td>
                <td style={{fontSize:12,color:T.muted}}>{new Date(r.ivr_next_attempt_at).toLocaleString("en-IN")}</td>
                <td><button className="btn btn-sm btn-danger" onClick={()=>cancel(r.id)}>Cancel Retry</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ================================================
// POSITION OPENINGS (separate module — Admin/Manager/CEO only)
// ================================================
function PositionOpenings({ showToast }) {
  const [openings,setOpenings]=useState([]);
  const [companies,setCompanies]=useState([]);
  const [processes,setProcesses]=useState([]);
  const [positionTypes,setPositionTypes]=useState([]);
  const [candidates,setCandidates]=useState([]);
  const [recruiters,setRecruiters]=useState([]);
  const [hiredCandidates,setHiredCandidates]=useState([]);
  const [linkChoice,setLinkChoice]=useState({});
  const [expandedOpening,setExpandedOpening]=useState(null);
  const [expandedProgress,setExpandedProgress]=useState(null);
  const [openingsColWidths,setOpeningsColWidths]=useState({});
  const [closedColWidths,setClosedColWidths]=useState({});
  const [editingDateId,setEditingDateId]=useState(null);
  const [editingDateValue,setEditingDateValue]=useState("");
  const [progressCandidates,setProgressCandidates]=useState([]);
  const [attemptCountByCandidate,setAttemptCountByCandidate]=useState({});
  const [progressFunnelStages,setProgressFunnelStages]=useState([]);
  const [loading,setLoading]=useState(false);
  const [statusFilter,setStatusFilter]=useState("OPEN");
  const [openingsSearch,setOpeningsSearch]=useState("");
  const [companyFilter,setCompanyFilter]=useState("");
  const [processFilter,setProcessFilter]=useState("");
  const [positionFilter,setPositionFilter]=useState("");
  const [hrFilter,setHrFilter]=useState("");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [form,setForm]=useState({company_id:"",process_id:"",position_type_id:"",target_count:1,note:""});
  const [creating,setCreating]=useState(false);
  const myUserId=useRef(null);
  const hiredStageIdRef=useRef(null);

  useEffect(()=>{load();},[]);

  async function load(){
    setLoading(true);
    try{
      const [ops,comps,procs,posTypes,users,cands,stages,allCands,attempts]=await Promise.all([
        dbSelect("position_openings","?select=*&order=created_at.desc"),
        dbSelect("companies","?select=*&order=name"),
        dbSelect("processes","?select=*&order=name"),
        dbSelect("position_types","?select=*&order=name"),
        dbSelect("user_roles","?select=id,name,email"),
        dbSelect("candidates","?select=id,name,current_stage_id,filled_opening_id,filled_at,filled_by&filled_opening_id=not.is.null"),
        dbSelect("funnel_stages","?select=id,name,is_exit_stage"),
        dbSelect("candidates","?select=id,name,process_id,position_type_id,current_stage_id,created_at"),
        dbSelect("candidate_activity","?select=candidate_id&is_contact_attempt=eq.true"),
      ]);
      setOpenings(ops);setCompanies(comps);setProcesses(procs);setPositionTypes(posTypes);setRecruiters(users);
      setProgressCandidates(allCands);
      setProgressFunnelStages(stages);
      const attemptCounts={};
      attempts.forEach(a=>{attemptCounts[a.candidate_id]=(attemptCounts[a.candidate_id]||0)+1;});
      setAttemptCountByCandidate(attemptCounts);
      const me=users.find(u=>u.email===getEmail());
      myUserId.current=me?.id||null;
      const hiredStageId=stages.find(s=>s.name==="Hired")?.id;
      hiredStageIdRef.current=hiredStageId||null;
      // A candidate only counts as "filled" against an opening while they're
      // still actually in the Hired stage — if a hire gets corrected or
      // rescinded later, they stop counting automatically instead of
      // inflating the opening's fill count forever.
      setCandidates(hiredStageId?cands.filter(c=>c.current_stage_id===hiredStageId):cands);
      if(hiredStageId){
        setHiredCandidates(await dbSelect("candidates",`?select=id,name,phone&current_stage_id=eq.${hiredStageId}&filled_opening_id=is.null`));
      }
    }catch(e){showToast("Failed to load position openings","error");}
    finally{setLoading(false);}
  }

  const companyMap=Object.fromEntries(companies.map(c=>[c.id,c.name]));
  const processMap=Object.fromEntries(processes.map(p=>[p.id,p.name]));
  const positionMap=Object.fromEntries(positionTypes.map(p=>[p.id,p.name]));
  const recruiterMap=Object.fromEntries(recruiters.map(u=>[u.id,u.name||u.email]));
  const filledCountByOpening={};
  const fillsByOpening={};
  candidates.forEach(c=>{
    if(!c.filled_opening_id)return;
    filledCountByOpening[c.filled_opening_id]=(filledCountByOpening[c.filled_opening_id]||0)+1;
    (fillsByOpening[c.filled_opening_id]=fillsByOpening[c.filled_opening_id]||[]).push(c);
  });
  const openOptions=openings.filter(o=>o.status==="OPEN");
  const allOpeningOptions=openings;
  const stageMap=Object.fromEntries(progressFunnelStages.map(s=>[s.id,s]));
  function openingLabelFor(o){
    return `${companyMap[o.company_id]||"—"} / ${processMap[o.process_id]||"—"} / ${positionMap[o.position_type_id]||"—"}`;
  }

  async function linkHire(candidateId){
    const openingId=linkChoice[candidateId];
    if(!openingId){showToast("Pick an opening first","error");return;}
    try{
      const [result]=await dbRpc("link_candidate_to_opening",{p_candidate_id:candidateId,p_opening_id:openingId,p_actor:myUserId.current});
      showToast(result?.closed?"Linked — target headcount reached, position auto-closed":"Linked","success");
      load();
    }catch{showToast("Failed to link","error");}
  }

  async function deleteOpening(o){
    const filled=filledCountByOpening[o.id]||0;
    if(filled>0){showToast("Unlink all filled candidates from this opening before deleting it","error");return;}
    if(!window.confirm(`Permanently delete this ${o.status==="OPEN"?"open":"closed"} requisition (${openingLabelFor(o)})? This cannot be undone.`))return;
    try{
      await dbDelete("position_openings",`id=eq.${o.id}`);
      showToast("Position deleted","success");load();
    }catch{showToast("Failed to delete — it may still have linked candidates","error");}
  }

  async function unlinkHire(candidate){
    if(!window.confirm(`Unlink ${candidate.name} from this opening? They'll no longer count toward its Filled total, and will show up in Unlinked Hires again if still marked Hired.`))return;
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{filled_opening_id:null,filled_at:null,filled_by:null});
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"NOTE",is_contact_attempt:false,
        remark:"Unlinked from opening",changed_by:myUserId.current,
      });
      showToast("Unlinked","success");load();
    }catch{showToast("Failed to unlink","error");}
  }

  async function createOpening(){
    if(!form.company_id||!form.process_id||!form.position_type_id){showToast("Pick company, process, and position","error");return;}
    if(!form.target_count||form.target_count<1){showToast("Target headcount must be at least 1","error");return;}
    const dupe=openings.find(o=>o.status==="OPEN"&&o.company_id===form.company_id&&o.process_id===form.process_id&&o.position_type_id===form.position_type_id);
    if(dupe){showToast("An OPEN requisition for this exact Company/Process/Position already exists — add to its target instead of opening a duplicate","error");return;}
    setCreating(true);
    try{
      await dbInsert("position_openings",{
        company_id:form.company_id,process_id:form.process_id,position_type_id:form.position_type_id,
        target_count:Number(form.target_count),note:form.note.trim()||null,status:"OPEN",created_by:myUserId.current,
      });
      showToast("Position opened","success");
      setForm({company_id:"",process_id:"",position_type_id:"",target_count:1,note:""});
      load();
    }catch{showToast("Failed to open position","error");}
    finally{setCreating(false);}
  }

  async function closeOpening(id){
    try{await dbUpdate("position_openings",`id=eq.${id}`,{status:"CLOSED",closed_at:new Date().toISOString(),closed_by:myUserId.current});showToast("Closed","success");load();}
    catch{showToast("Failed to close","error");}
  }
  async function reopenOpening(id){
    // closed_at is left as-is on reopen — it's the last time this opening
    // was closed, and overwriting it with null erased that history the
    // moment you reopened, before anyone could ever see it.
    try{await dbUpdate("position_openings",`id=eq.${id}`,{status:"OPEN"});showToast("Reopened","success");load();}
    catch{showToast("Failed to reopen","error");}
  }

  async function saveOpenedAt(o){
    if(!editingDateValue){setEditingDateId(null);return;}
    try{
      await dbUpdate("position_openings",`id=eq.${o.id}`,{created_at:new Date(editingDateValue+"T00:00:00").toISOString()});
      showToast("Opened date updated","success");
      setEditingDateId(null);
      load();
    }catch{showToast("Failed to update opened date","error");}
  }

  function openedAtCell(o){
    if(editingDateId===o.id){
      return(
        <div className="date-edit-form" onClick={e=>e.stopPropagation()}>
          <input type="date" value={editingDateValue} onChange={e=>setEditingDateValue(e.target.value)} autoFocus/>
          <button className="icon-btn icon-btn-confirm" title="Save" onClick={()=>saveOpenedAt(o)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button className="icon-btn icon-btn-cancel" title="Cancel" onClick={()=>setEditingDateId(null)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      );
    }
    return(
      <span
        className="date-edit"
        title={(recruiterMap[o.created_by]?`Opened by ${recruiterMap[o.created_by]}`:"")+" — click to change date"}
        onClick={e=>{e.stopPropagation();setEditingDateId(o.id);setEditingDateValue(o.created_at?new Date(o.created_at).toISOString().split("T")[0]:"");}}
      >
        {o.created_at?new Date(o.created_at).toLocaleDateString("en-IN"):"—"}
        <span className="pencil">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </span>
      </span>
    );
  }

  // All filters compose together and drive everything below — KPIs, the
  // avg-days breakdowns, and the Positions table itself — not just the table.
  const hrOptions=[...new Set(Object.values(fillsByOpening).flat().map(c=>c.filled_by).filter(Boolean))];
  const filteredOpenings=openings.filter(o=>{
    if(openingsSearch){
      const q=openingsSearch.toLowerCase();
      const hay=`${companyMap[o.company_id]||""} ${processMap[o.process_id]||""} ${positionMap[o.position_type_id]||""} ${o.note||""}`.toLowerCase();
      if(!hay.includes(q))return false;
    }
    if(companyFilter&&o.company_id!==companyFilter)return false;
    if(processFilter&&o.process_id!==processFilter)return false;
    if(positionFilter&&o.position_type_id!==positionFilter)return false;
    if(hrFilter&&!(fillsByOpening[o.id]||[]).some(c=>c.filled_by===hrFilter))return false;
    if(dateFrom||dateTo){
      const d=new Date(o.created_at).toISOString().split("T")[0];
      if(dateFrom&&d<dateFrom)return false;
      if(dateTo&&d>dateTo)return false;
    }
    return true;
  });
  const filtered=filteredOpenings.filter(o=>statusFilter==="ALL"||o.status===statusFilter);
  const openCount=filteredOpenings.filter(o=>o.status==="OPEN").length;
  const openTarget=filteredOpenings.filter(o=>o.status==="OPEN").reduce((s,o)=>s+o.target_count,0);
  const openFilled=filteredOpenings.filter(o=>o.status==="OPEN").reduce((s,o)=>s+(filledCountByOpening[o.id]||0),0);

  // Days-to-close: only meaningful for openings that have actually closed.
  // For anything reopened and closed again, this measures from the
  // original open date to the latest close, so a reopen gap in between
  // inflates the number — acceptable for now since we don't keep a full
  // per-cycle history, just the most recent close.
  const closedOnes=filteredOpenings.filter(o=>o.status==="CLOSED"&&o.closed_at);
  function daysToClose(o){return (new Date(o.closed_at)-new Date(o.created_at))/86400000;}
  const avgDaysToClose=closedOnes.length?(closedOnes.reduce((s,o)=>s+daysToClose(o),0)/closedOnes.length):null;
  const closedToday=closedOnes.filter(o=>new Date(o.closed_at).toISOString().split("T")[0]===today()).length;

  function avgByKey(keyFn,labelMap){
    const groups={};
    closedOnes.forEach(o=>{
      const k=keyFn(o);
      (groups[k]=groups[k]||[]).push(o);
    });
    return Object.entries(groups).map(([k,ops])=>({
      label:labelMap[k]||"—",count:ops.length,
      avgDays:ops.reduce((s,o)=>s+daysToClose(o),0)/ops.length,
    })).sort((a,b)=>b.count-a.count);
  }
  const avgByProcess=avgByKey(o=>o.process_id,processMap);
  const avgByPosition=avgByKey(o=>o.position_type_id,positionMap);

  return(
    <div>
      <div className="page-header"><div><div className="page-title">Position Openings</div><div className="page-sub">Requisitions across all companies — separate from the hiring pipeline</div></div></div>
      <div className="page-content">
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
              <div className="kpi-card"><div className="kpi-label">Open Positions</div><div className="kpi-value blue">{openCount}</div><div className="kpi-sub">Requisitions</div></div>
              <div className="kpi-card"><div className="kpi-label">Target Headcount</div><div className="kpi-value amber">{openTarget}</div><div className="kpi-sub">Across open positions</div></div>
              <div className="kpi-card"><div className="kpi-label">Filled So Far</div><div className="kpi-value green">{openFilled}</div><div className="kpi-sub">{openTarget?Math.round((openFilled/openTarget)*100):0}% of target</div></div>
              <div className="kpi-card"><div className="kpi-label">Closed Today</div><div className="kpi-value green">{closedToday}</div><div className="kpi-sub">Positions closed</div></div>
              <div className="kpi-card"><div className="kpi-label">Avg Days to Close</div><div className="kpi-value blue">{avgDaysToClose!==null?avgDaysToClose.toFixed(1):"—"}</div><div className="kpi-sub">Across {closedOnes.length} closed position{closedOnes.length===1?"":"s"}</div></div>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <input className="filter-input" value={openingsSearch} onChange={e=>setOpeningsSearch(e.target.value)} placeholder="Search company, process, position, note" style={{maxWidth:240}}/>
              <FilterSelect value={companyFilter} onChange={setCompanyFilter} allLabel="All Companies" options={companies.map(c=>({value:c.id,label:c.name}))}/>
              <FilterSelect value={processFilter} onChange={setProcessFilter} allLabel="All Processes" options={processes.map(p=>({value:p.id,label:p.name}))}/>
              <FilterSelect value={positionFilter} onChange={setPositionFilter} allLabel="All Positions" options={positionTypes.map(p=>({value:p.id,label:p.name}))}/>
              <FilterSelect value={hrFilter} onChange={setHrFilter} allLabel="Everyone (HR)" options={hrOptions.map(id=>({value:id,label:recruiterMap[id]||"—"}))}/>
              <input type="date" className="filter-input" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} title="Opened from date"/>
              <input type="date" className="filter-input" value={dateTo} onChange={e=>setDateTo(e.target.value)} title="Opened to date"/>
              <button className="btn btn-sm btn-ghost" onClick={()=>{const t=today();setDateFrom(t);setDateTo(t);}}>Today</button>
              <button className="btn btn-sm btn-ghost" onClick={()=>{const t=new Date();const f=new Date();f.setDate(t.getDate()-7);setDateFrom(f.toISOString().split("T")[0]);setDateTo(t.toISOString().split("T")[0]);}}>This Week</button>
              {(openingsSearch||companyFilter||processFilter||positionFilter||hrFilter||dateFrom||dateTo)&&(
                <button className="btn btn-sm btn-ghost" onClick={()=>{setOpeningsSearch("");setCompanyFilter("");setProcessFilter("");setPositionFilter("");setHrFilter("");setDateFrom("");setDateTo("");}}>✕ Clear Filters</button>
              )}
            </div>

            <div className="card" style={{marginBottom:16}}>
              <div className="card-header">
                <div className="card-title">Positions ({filtered.length})</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ALL">All</option>
                  </select>
                  {Object.keys(openingsColWidths).length>0&&<button className="btn btn-sm btn-ghost" onClick={()=>setOpeningsColWidths({})}>Reset Columns</button>}
                  <button className="btn btn-sm btn-ghost" onClick={load}>↻</button>
                </div>
              </div>
              <div className="table-wrap">
                {!loading&&filtered.length===0?<div className="empty-state"><div className="empty-icon">▣</div><div className="empty-title">No positions here</div></div>:(
                  <table style={{tableLayout:"fixed"}}>
                    <thead><tr>
                      <ResizableTh col="company" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={100}>Company</ResizableTh>
                      <ResizableTh col="process" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={130}>Process</ResizableTh>
                      <ResizableTh col="position" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={120}>Position</ResizableTh>
                      <ResizableTh col="target" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={70}>Target</ResizableTh>
                      <ResizableTh col="filled" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={70}>Filled</ResizableTh>
                      <ResizableTh col="filledBy" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={100}>Filled By</ResizableTh>
                      <ResizableTh col="status" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={90}>Status</ResizableTh>
                      <ResizableTh col="openedAt" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={130}>Opened At</ResizableTh>
                      <ResizableTh col="closedAt" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={100}>Closed At</ResizableTh>
                      <ResizableTh col="closedBy" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={100}>Closed By</ResizableTh>
                      <ResizableTh col="note" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={160}>Note</ResizableTh>
                      <ResizableTh col="actions" widths={openingsColWidths} setWidths={setOpeningsColWidths} defaultWidth={250}>Actions</ResizableTh>
                    </tr></thead>
                    <tbody>{loading?<SkeletonRows cols={12}/>:filtered.map(o=>{
                      const filled=filledCountByOpening[o.id]||0;
                      const fills=(fillsByOpening[o.id]||[]).slice().sort((a,b)=>new Date(b.filled_at||0)-new Date(a.filled_at||0));
                      const fillSummary=fills.map(c=>`${c.name} (${recruiterMap[c.filled_by]||"—"}, ${c.filled_at?new Date(c.filled_at).toLocaleDateString("en-IN"):"—"})`).join("\n");
                      const cellTrunc={overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"};
                      return(
                        <Fragment key={o.id}>
                        <tr>
                          <td style={{fontWeight:500,...cellTrunc}}>{companyMap[o.company_id]||"—"}</td>
                          <td style={cellTrunc}>{processMap[o.process_id]||"—"}</td>
                          <td style={cellTrunc}>{positionMap[o.position_type_id]||"—"}</td>
                          <td>{o.target_count}</td>
                          <td>
                            <span
                              style={{color:filled>=o.target_count?T.green:undefined,fontWeight:filled>=o.target_count?600:undefined,cursor:fills.length?"pointer":"default",textDecoration:fills.length?"underline dotted":"none"}}
                              onClick={()=>fills.length&&setExpandedOpening(v=>v===o.id?null:o.id)}
                            >{filled}</span>
                          </td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}} title={fillSummary}>
                            {fills.length?[...new Set(fills.map(c=>recruiterMap[c.filled_by]||"—"))].join(", "):"—"}
                          </td>
                          <td><span className={`badge ${o.status==="OPEN"?"badge-green":"badge-gray"}`}>{o.status}</span></td>
                          <td style={{fontSize:12,color:T.muted}}>{openedAtCell(o)}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}}>{o.closed_at?new Date(o.closed_at).toLocaleDateString("en-IN"):"—"}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}}>{o.closed_by?recruiterMap[o.closed_by]||"—":"—"}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}} title={o.note||""}>{o.note||"—"}</td>
                          <td style={{display:"flex",gap:6,flexWrap:"nowrap",padding:"13px 10px"}}>
                            {o.status==="OPEN"?
                              <button className="btn btn-sm btn-ghost" onClick={()=>closeOpening(o.id)}>Close</button>:
                              <button className="btn btn-sm btn-ghost" onClick={()=>reopenOpening(o.id)}>Reopen</button>
                            }
                            <button className="btn btn-sm btn-ghost" onClick={()=>setExpandedProgress(v=>v===o.id?null:o.id)}>{expandedProgress===o.id?"Hide":"Progress"}</button>
                            <button className="btn btn-sm btn-danger" onClick={()=>deleteOpening(o)}>Delete</button>
                          </td>
                        </tr>
                        {expandedProgress===o.id&&(()=>{
                          // Scoped to candidates who existed while this specific
                          // opening was actually open — a position can be
                          // closed and a new one opened later for the same
                          // Process/Position, and those shouldn't share a pool.
                          const windowEnd=o.closed_at?new Date(o.closed_at):new Date();
                          const windowStart=new Date(o.created_at);
                          const matching=progressCandidates.filter(c=>
                            c.process_id===o.process_id&&c.position_type_id===o.position_type_id&&
                            new Date(c.created_at)>=windowStart&&new Date(c.created_at)<=windowEnd
                          );
                          return(
                            <tr key={o.id+"-progress"}>
                              <td colSpan={12} style={{background:T.mode==="light"?"#FAFAFF":"#181D2A",padding:12}}>
                                <div style={{fontSize:12,color:T.muted,marginBottom:8}}>Candidates matching this Process/Position, added between {windowStart.toLocaleDateString("en-IN")} and {o.closed_at?windowEnd.toLocaleDateString("en-IN"):"now"} ({matching.length}) — matched by Process + Position Type, not tied to this specific opening until hired.</div>
                                {matching.length===0?<div style={{fontSize:13,color:T.muted}}>No candidates for this Process/Position yet.</div>:(
                                  <table style={{width:"100%"}}>
                                    <thead><tr><th>Candidate</th><th>Stage</th><th>Attempts</th></tr></thead>
                                    <tbody>{matching.map(c=>{
                                      const stage=stageMap[c.current_stage_id];
                                      return(
                                        <tr key={c.id}>
                                          <td>{c.name}</td>
                                          <td><span className="badge" style={{background:stage?.is_exit_stage?`${T.purple}22`:`${T.accent}22`,color:stage?.is_exit_stage?T.purple:T.accent}}>{stage?.name||"—"}</span></td>
                                          <td>{attemptCountByCandidate[c.id]||0}</td>
                                        </tr>
                                      );
                                    })}</tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          );
                        })()}
                        {expandedOpening===o.id&&fills.length>0&&(
                          <tr key={o.id+"-fills"}>
                            <td colSpan={12} style={{background:T.mode==="light"?"#FAFAFF":"#181D2A",padding:12}}>
                              <table style={{width:"100%"}}>
                                <thead><tr><th>Candidate</th><th>Filled By</th><th>Filled At</th><th>Actions</th></tr></thead>
                                <tbody>{fills.map(c=>(
                                  <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td>{recruiterMap[c.filled_by]||"—"}</td>
                                    <td>{c.filled_at?new Date(c.filled_at).toLocaleDateString("en-IN"):"—"}</td>
                                    <td><button className="btn btn-sm btn-danger" onClick={()=>unlinkHire(c)}>Unlink</button></td>
                                  </tr>
                                ))}</tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                        </Fragment>
                      );
                    })}</tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card" style={{marginBottom:16}}>
              <div className="card-header"><div className="card-title">Open a New Position</div></div>
              <div className="card-body">
                <div className="two-col" style={{marginBottom:12}}>
                  <div className="field"><label>Company *</label>
                    <select value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})}>
                      <option value="">—</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Process *</label>
                    <select value={form.process_id} onChange={e=>setForm({...form,process_id:e.target.value})}>
                      <option value="">—</option>{processes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="two-col" style={{marginBottom:12}}>
                  <div className="field"><label>Position Type *</label>
                    <select value={form.position_type_id} onChange={e=>setForm({...form,position_type_id:e.target.value})}>
                      <option value="">—</option>{positionTypes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Target Headcount *</label>
                    <input type="number" min="1" value={form.target_count} onChange={e=>setForm({...form,target_count:e.target.value})}/>
                  </div>
                </div>
                <div className="field" style={{marginBottom:12}}><label>Note (optional)</label><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="e.g. Urgent — July batch"/></div>
                <button className="btn btn-sm" onClick={createOpening} disabled={creating}>{creating?"Opening...":"Open Position"}</button>
              </div>
            </div>

            {hiredCandidates.length>0&&(
              <div className="card" style={{marginBottom:16}}>
                <div className="card-header">
                  <div className="card-title">Unlinked Hires ({hiredCandidates.length})</div>
                  <span style={{fontSize:12,color:T.muted}}>Hired candidates not yet counted against any opening</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Phone</th><th>Fills Which Opening?</th><th>Actions</th></tr></thead>
                    <tbody>{hiredCandidates.map(c=>(
                      <tr key={c.id}>
                        <td style={{fontWeight:500}}>{c.name}</td>
                        <td style={{fontFamily:"monospace"}}>{c.phone}</td>
                        <td>
                          <select className="filter-select" value={linkChoice[c.id]||""} onChange={e=>setLinkChoice({...linkChoice,[c.id]:e.target.value})}>
                            <option value="">—</option>
                            {allOpeningOptions.map(o=><option key={o.id} value={o.id}>{openingLabelFor(o)}{o.status==="CLOSED"?" (closed)":""}</option>)}
                          </select>
                        </td>
                        <td><button className="btn btn-sm btn-ghost" onClick={()=>linkHire(c.id)}>Link</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {closedOnes.length>0&&(
              <div className="two-col" style={{marginBottom:16}}>
                <div className="card">
                  <div className="card-header"><div className="card-title">Avg Days to Close — by Process</div></div>
                  <div className="table-wrap"><table>
                    <thead><tr><th>Process</th><th>Closed</th><th>Avg Days</th></tr></thead>
                    <tbody>{avgByProcess.map(r=><tr key={r.label}><td>{r.label}</td><td>{r.count}</td><td>{r.avgDays.toFixed(1)}</td></tr>)}</tbody>
                  </table></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Avg Days to Close — by Position</div></div>
                  <div className="table-wrap"><table>
                    <thead><tr><th>Position</th><th>Closed</th><th>Avg Days</th></tr></thead>
                    <tbody>{avgByPosition.map(r=><tr key={r.label}><td>{r.label}</td><td>{r.count}</td><td>{r.avgDays.toFixed(1)}</td></tr>)}</tbody>
                  </table></div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">Closed Positions ({closedOnes.length})</div>
                {Object.keys(closedColWidths).length>0&&<button className="btn btn-sm btn-ghost" onClick={()=>setClosedColWidths({})}>Reset Columns</button>}
              </div>
              <div className="table-wrap">
                {closedOnes.length===0?<div className="empty-state"><div className="empty-icon">▣</div><div className="empty-title">No closed positions here</div></div>:(
                  <table style={{tableLayout:"fixed"}}>
                    <thead><tr>
                      <ResizableTh col="company" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={100}>Company</ResizableTh>
                      <ResizableTh col="process" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={130}>Process</ResizableTh>
                      <ResizableTh col="position" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={120}>Position</ResizableTh>
                      <ResizableTh col="target" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={70}>Target</ResizableTh>
                      <ResizableTh col="filled" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={70}>Filled</ResizableTh>
                      <ResizableTh col="filledBy" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={100}>Filled By</ResizableTh>
                      <ResizableTh col="openedAt" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={130}>Opened At</ResizableTh>
                      <ResizableTh col="closedAt" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={100}>Closed At</ResizableTh>
                      <ResizableTh col="closedBy" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={100}>Closed By</ResizableTh>
                      <ResizableTh col="daysToClose" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={100}>Days to Close</ResizableTh>
                      <ResizableTh col="note" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={160}>Note</ResizableTh>
                      <ResizableTh col="actions" widths={closedColWidths} setWidths={setClosedColWidths} defaultWidth={190}>Actions</ResizableTh>
                    </tr></thead>
                    <tbody>{closedOnes.slice().sort((a,b)=>new Date(b.closed_at)-new Date(a.closed_at)).map(o=>{
                      const filled=filledCountByOpening[o.id]||0;
                      const fills=fillsByOpening[o.id]||[];
                      const cellTrunc={overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"};
                      return(
                        <tr key={o.id}>
                          <td style={{fontWeight:500,...cellTrunc}}>{companyMap[o.company_id]||"—"}</td>
                          <td style={cellTrunc}>{processMap[o.process_id]||"—"}</td>
                          <td style={cellTrunc}>{positionMap[o.position_type_id]||"—"}</td>
                          <td>{o.target_count}</td>
                          <td>{filled}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}}>{fills.length?[...new Set(fills.map(c=>recruiterMap[c.filled_by]||"—"))].join(", "):"—"}</td>
                          <td style={{fontSize:12,color:T.muted}}>{openedAtCell(o)}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}}>{new Date(o.closed_at).toLocaleDateString("en-IN")}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}}>{o.closed_by?recruiterMap[o.closed_by]||"—":"—"}</td>
                          <td>{daysToClose(o).toFixed(1)}</td>
                          <td style={{fontSize:12,color:T.muted,...cellTrunc}} title={o.note||""}>{o.note||"—"}</td>
                          <td style={{display:"flex",gap:6,flexWrap:"nowrap",padding:"13px 10px"}}>
                            <button className="btn btn-sm btn-ghost" onClick={()=>reopenOpening(o.id)}>Reopen</button>
                            <button className="btn btn-sm btn-danger" onClick={()=>deleteOpening(o)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                )}
              </div>
            </div>
      </div>
    </div>
  );
}

function HireFlowSettings({ showToast }) {
  const [tab,setTab]=useState("processes");
  const tabs=[["processes","Processes"],["positions","Position Types"],["companies","Companies"],["sources","Lead Sources"],["reasons","Reasons"],["stages","Funnel Stages"],["dialing","Dialing Settings"],["queue","IVR Queue"]];
  return(
    <div>
      <div className="page-header"><div><div className="page-title">Settings</div><div className="page-sub">Manage the lookup lists used across the hiring funnel</div></div></div>
      <div className="page-content">
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {tabs.map(([id,label])=>(
            <button key={id} className={`btn btn-sm ${tab===id?"":"btn-ghost"}`} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </div>
        {tab==="processes"&&<SimpleRefList table="processes" title="Processes" placeholder="e.g. Cred, Smartcoin, ITI Finance" showToast={showToast} candidateField="process_id"/>}
        {tab==="positions"&&<SimpleRefList table="position_types" title="Position Types" placeholder="e.g. Calling Executive, Field AM" showToast={showToast} candidateField="position_type_id"/>}
        {tab==="companies"&&<SimpleRefList table="companies" title="Companies" placeholder="e.g. Nova Retail Group" showToast={showToast}/>}
        {tab==="sources"&&<SimpleRefList table="lead_sources" title="Lead Sources" placeholder="e.g. Work India, LinkedIn" showToast={showToast}/>}
        {tab==="reasons"&&<SimpleRefList table="rejection_reasons" title="Rejection / Not Interested Reasons" placeholder="e.g. Salary mismatch, Location" showToast={showToast}/>}
        {tab==="stages"&&<FunnelStagesAdmin showToast={showToast}/>}
        {tab==="dialing"&&<DialingSettings showToast={showToast}/>}
        {tab==="queue"&&<IVRQueue showToast={showToast}/>}
      </div>
    </div>
  );
}

// ================================================
// HIREFLOW — CANDIDATE DETAIL MODAL
// ================================================
function CandidateModal({ candidate, companies, processes, positionTypes, leadSources, rejectionReasons, funnelStages, users, onClose, onChanged, showToast }) {
  const [form,setForm]=useState({
    current_salary:candidate.current_salary||"", expected_salary:candidate.expected_salary||"",
    company_id:candidate.company_id||"",
    location:candidate.location||"", process_id:candidate.process_id||"", position_type_id:candidate.position_type_id||"",
    source_id:candidate.source_id||"", intent:candidate.intent||"", languages_spoken:candidate.languages_spoken||"",
    english:candidate.language_ratings?.english||"", hindi:candidate.language_ratings?.hindi||"", malayalam:candidate.language_ratings?.malayalam||"",
  });
  const [saving,setSaving]=useState(false);
  const [showDetails,setShowDetails]=useState(false);
  const [activity,setActivity]=useState([]);
  const [newStage,setNewStage]=useState(candidate.current_stage_id||"");
  const [stageRemark,setStageRemark]=useState("");
  const [remarkText,setRemarkText]=useState(candidate.remark||"");
  const [savingRemark,setSavingRemark]=useState(false);
  const [rejectionReasonId,setRejectionReasonId]=useState("");
  const [interviewAt,setInterviewAt]=useState("");
  const [attemptRemark,setAttemptRemark]=useState("");
  const [reassignTo,setReassignTo]=useState("");
  const [handoffNote,setHandoffNote]=useState("");
  const [sendingToIvr,setSendingToIvr]=useState(false);
  const [busy,setBusy]=useState(false);

  const stageMap=Object.fromEntries(funnelStages.map(s=>[s.id,s]));
  const userMap=Object.fromEntries(users.map(u=>[u.id,u]));
  const myUserId=users.find(u=>u.email===getEmail())?.id;
  const role=getRole();
  const canDirectReassign=["ADMIN","MANAGER"].includes(role);
  const assignableUsers=users.filter(u=>["HR","MANAGER"].includes(u.role));
  const hasPendingRequest=!!candidate.pending_reassign_to;
  const isPendingForMe=candidate.pending_reassign_to===myUserId;
  const isMyOwnPendingRequest=hasPendingRequest&&candidate.assigned_to===myUserId;
  const newStageIsRejected=stageMap[newStage]?.name==="Rejected";
  const newStageIsNotInterested=stageMap[newStage]?.name==="Not Interested";
  const newStageIsInterview=stageMap[newStage]?.name==="Interview Scheduled";
  const newStageIsHired=stageMap[newStage]?.name==="Hired";
  const newStageNeedsReason=newStageIsRejected||newStageIsNotInterested;

  const [openOpenings,setOpenOpenings]=useState([]);
  const [selectedOpeningId,setSelectedOpeningId]=useState("");
  // Which of the 3 opening choices is picked at Hired stage-change time —
  // this is the ONLY place linking happens now; there used to be a second,
  // always-visible "Fills Which Opening?" field here too, asking the same
  // question twice on the same screen.
  const [openingChoice,setOpeningChoice]=useState("none"); // "none" | "existing" | "new"
  const [newOpeningCompanyId,setNewOpeningCompanyId]=useState(candidate.company_id||"");
  const [newOpeningProcessId,setNewOpeningProcessId]=useState(candidate.process_id||"");
  const [newOpeningPositionId,setNewOpeningPositionId]=useState(candidate.position_type_id||"");
  const [newOpeningTarget,setNewOpeningTarget]=useState(1);
  const [newOpeningDate,setNewOpeningDate]=useState(new Date().toISOString().split("T")[0]);

  useEffect(()=>{
    loadActivity();
    dbSelect("position_openings","?select=*&status=eq.OPEN").then(setOpenOpenings).catch(()=>{});
  },[]);
  async function loadActivity(){
    try{setActivity(await dbSelect("candidate_activity",`?select=*&candidate_id=eq.${candidate.id}&order=changed_at.desc`));}catch{}
  }
  const companyMap=Object.fromEntries(companies.map(c=>[c.id,c.name]));
  const processMap=Object.fromEntries(processes.map(p=>[p.id,p.name]));
  const positionMap=Object.fromEntries(positionTypes.map(p=>[p.id,p.name]));
  function openingLabel(o){
    return `${companyMap[o.company_id]||"—"} / ${processMap[o.process_id]||"—"} / ${positionMap[o.position_type_id]||"—"}`;
  }

  async function saveRemark(){
    setSavingRemark(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{remark:remarkText.trim()||null,updated_at:new Date().toISOString()});
      showToast("Remark saved","success");
      onChanged();
    }catch{showToast("Failed to save remark","error");}
    finally{setSavingRemark(false);}
  }

  async function saveDetails(){
    setSaving(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{
        current_salary:form.current_salary||null, expected_salary:form.expected_salary||null,
        company_id:form.company_id||null,
        location:form.location||null, process_id:form.process_id||null, position_type_id:form.position_type_id||null,
        source_id:form.source_id||null, intent:form.intent||null, languages_spoken:form.languages_spoken||null,
        language_ratings:{english:form.english||null,hindi:form.hindi||null,malayalam:form.malayalam||null},
        updated_at:new Date().toISOString(),
      });
      showToast("Details saved","success");
      onChanged();
    }catch{showToast("Failed to save","error");}
    finally{setSaving(false);}
  }

  async function changeStage(){
    if(!newStage||newStage===candidate.current_stage_id){showToast("Pick a different stage first","error");return;}
    if(newStageNeedsReason&&!rejectionReasonId){showToast(newStageIsRejected?"Pick a rejection reason":"Pick a reason","error");return;}
    if(newStageIsInterview&&!interviewAt){showToast("Pick when the interview is scheduled","error");return;}
    if(newStageIsHired&&openingChoice==="existing"&&!selectedOpeningId){showToast("Pick an opening, or switch to Not Linked / Open a New Position","error");return;}
    if(newStageIsHired&&openingChoice==="new"&&(!newOpeningCompanyId||!newOpeningProcessId||!newOpeningPositionId)){showToast("Pick Company, Process, and Position for the new opening","error");return;}
    setBusy(true);
    try{
      const update={current_stage_id:newStage,updated_at:new Date().toISOString(),remark:remarkText.trim()||null};
      if(newStageNeedsReason)update.rejection_reason_id=rejectionReasonId;
      if(newStageIsInterview)update.interview_scheduled_at=new Date(interviewAt).toISOString();
      await dbUpdate("candidates",`id=eq.${candidate.id}`,update);
      const reasonLabel=newStageNeedsReason?rejectionReasons.find(r=>r.id===rejectionReasonId)?.name:null;
      const interviewLabel=newStageIsInterview?`Interview scheduled for ${new Date(interviewAt).toLocaleString("en-IN")}`:null;
      const openingNote=newStageIsHired&&openingChoice==="existing"?`Fills opening: ${openingLabel(openOpenings.find(o=>o.id===selectedOpeningId))}`:
        newStageIsHired&&openingChoice==="new"?`Opens new position: ${companyMap[newOpeningCompanyId]} / ${processMap[newOpeningProcessId]} / ${positionMap[newOpeningPositionId]}`:null;
      const remarkParts=[reasonLabel||interviewLabel||openingNote,stageRemark.trim()].filter(Boolean);
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"STAGE_CHANGE",is_contact_attempt:false,
        from_stage_id:candidate.current_stage_id,to_stage_id:newStage,
        remark:remarkParts.length?remarkParts.join(" — "):null,
        changed_by:myUserId,
      });
      if(newStageIsHired&&openingChoice==="existing"){
        const [result]=await dbRpc("link_candidate_to_opening",{p_candidate_id:candidate.id,p_opening_id:selectedOpeningId,p_actor:myUserId});
        showToast(result?.closed?"Stage updated — target headcount reached, position auto-closed":"Stage updated — linked","success");
      }else if(newStageIsHired&&openingChoice==="new"){
        const [result]=await dbRpc("auto_link_or_create_opening",{
          p_candidate_id:candidate.id,p_company_id:newOpeningCompanyId,p_process_id:newOpeningProcessId,
          p_position_type_id:newOpeningPositionId,p_actor:myUserId,
          p_opened_at:new Date(newOpeningDate).toISOString(),p_target_count:Number(newOpeningTarget)||1,
        });
        showToast(result?.closed?"Stage updated — position opened, target already reached, auto-closed":"Stage updated — position opened and linked","success");
      }else{
        showToast("Stage updated","success");
      }
      setStageRemark("");setRejectionReasonId("");setInterviewAt("");setSelectedOpeningId("");setOpeningChoice("none");
      onChanged();loadActivity();
    }catch{showToast("Failed to update stage","error");}
    finally{setBusy(false);}
  }

  async function logAttempt(){
    if(!attemptRemark.trim()){showToast("Add a quick note about the call","error");return;}
    setBusy(true);
    try{
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"CALL_ATTEMPT",is_contact_attempt:true,
        remark:attemptRemark.trim(),changed_by:myUserId,
      });
      showToast("Logged","success");setAttemptRemark("");
      loadActivity();
    }catch{showToast("Failed to log","error");}
    finally{setBusy(false);}
  }

  async function reassign(){
    if(!canDirectReassign){showToast("Only Admin/Manager can reassign directly","error");return;}
    if(!reassignTo||reassignTo===candidate.assigned_to){showToast("Pick a different recruiter first","error");return;}
    setBusy(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{assigned_to:reassignTo,assigned_at:new Date().toISOString(),pending_reassign_to:null,pending_reassign_note:null,updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"REASSIGNMENT",is_contact_attempt:false,
        remark:`Reassigned to ${userMap[reassignTo]?.name||userMap[reassignTo]?.email||"—"}`,changed_by:myUserId,
      });
      showToast("Reassigned","success");setReassignTo("");
      onChanged();loadActivity();
    }catch{showToast("Failed to reassign","error");}
    finally{setBusy(false);}
  }

  async function requestHandoff(){
    if(!reassignTo){showToast("Pick a recruiter to hand off to","error");return;}
    setBusy(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{pending_reassign_to:reassignTo,pending_reassign_note:handoffNote.trim()||null,updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"REASSIGN_REQUESTED",is_contact_attempt:false,
        remark:`Handoff requested to ${userMap[reassignTo]?.name||userMap[reassignTo]?.email||"—"}${handoffNote.trim()?`: ${handoffNote.trim()}`:""}`,changed_by:myUserId,
      });
      showToast("Handoff requested — waiting for them to accept","success");setReassignTo("");setHandoffNote("");
      onChanged();loadActivity();
    }catch{showToast("Failed to request handoff","error");}
    finally{setBusy(false);}
  }

  async function acceptHandoff(){
    setBusy(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{assigned_to:myUserId,assigned_at:new Date().toISOString(),pending_reassign_to:null,pending_reassign_note:null,updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"REASSIGNMENT",is_contact_attempt:false,
        remark:`Handoff accepted by ${userMap[myUserId]?.name||userMap[myUserId]?.email||"—"}`,changed_by:myUserId,
      });
      showToast("Case accepted","success");
      onChanged();loadActivity();
    }catch{showToast("Failed to accept","error");}
    finally{setBusy(false);}
  }

  async function rejectHandoff(){
    setBusy(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{pending_reassign_to:null,pending_reassign_note:null,updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"REASSIGN_REJECTED",is_contact_attempt:false,
        remark:`Handoff declined by ${userMap[myUserId]?.name||userMap[myUserId]?.email||"—"}`,changed_by:myUserId,
      });
      showToast("Handoff declined","info");
      onChanged();loadActivity();
    }catch{showToast("Failed to decline","error");}
    finally{setBusy(false);}
  }

  async function cancelHandoff(){
    setBusy(true);
    try{
      await dbUpdate("candidates",`id=eq.${candidate.id}`,{pending_reassign_to:null,pending_reassign_note:null,updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",{
        candidate_id:candidate.id,type:"NOTE",is_contact_attempt:false,
        remark:"Handoff request cancelled",changed_by:myUserId,
      });
      showToast("Request cancelled","info");
      onChanged();loadActivity();
    }catch{showToast("Failed to cancel","error");}
    finally{setBusy(false);}
  }

  async function deleteCandidate(){
    if(!canDirectReassign){showToast("Only Admin/Manager can delete candidates","error");return;}
    if(!window.confirm(`Permanently delete ${candidate.name}? This removes the candidate and their activity history. This cannot be undone.`))return;
    setBusy(true);
    try{
      await dbDelete("candidate_activity",`candidate_id=eq.${candidate.id}`);
      await dbDelete("candidates",`id=eq.${candidate.id}`);
      showToast("Candidate deleted","success");
      onChanged();onClose();
    }catch{showToast("Failed to delete","error");}
    finally{setBusy(false);}
  }

  async function sendToIvr(){
    if(candidate.ivr_next_attempt_at){showToast("IVR call already scheduled for this candidate","error");return;}
    if(POSITIVE_HIRING_STAGES.includes(currentStage?.name)){
      if(!window.confirm(`${candidate.name} is already in "${currentStage.name}" — sending to IVR now could interfere with an active hiring process. Continue anyway?`))return;
    }
    setSendingToIvr(true);
    try{
      const res=await renderFetch("/hireflow/send-to-ivr",{method:"POST",body:JSON.stringify({candidate_id:candidate.id})});
      showToast(res.message||"Scheduled","success");
      onChanged();loadActivity();
    }catch(e){showToast(e.message||"Failed to send to IVR","error");}
    finally{setSendingToIvr(false);}
  }

  const ivrAttemptCount=activity.filter(a=>a.remark==="IVR call placed").length;
  const currentStage=stageMap[candidate.current_stage_id];

  return(
    <Modal title={candidate.name} sub={candidate.phone} onClose={onClose} actions={<button className="btn btn-sm btn-ghost" onClick={onClose}>Close</button>}>
      <div className="card" style={{marginBottom:16,borderColor:currentStage?.is_exit_stage?T.purple:T.accent}}>
        <div className="card-body">
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:14}}>
            <span className="badge" style={{fontSize:14,padding:"6px 14px",background:currentStage?.is_exit_stage?`${T.purple}22`:`${T.accent}22`,color:currentStage?.is_exit_stage?T.purple:T.accent}}>{currentStage?.name||"No stage"}</span>
            <span className="badge badge-gray">IVR Attempts {ivrAttemptCount}x</span>
            {candidate.linked_lead_campaign&&<span className="badge badge-green">IVR called before</span>}
          </div>
          <div className="field" style={{marginBottom:14}}>
            <label>Remark</label>
            <div style={{display:"flex",gap:8}}>
              <input value={remarkText} onChange={e=>setRemarkText(e.target.value)} placeholder="Free-text note — stays until changed" style={{flex:1}}/>
              <button className="btn btn-sm" onClick={saveRemark} disabled={savingRemark||remarkText===(candidate.remark||"")}>Save</button>
            </div>
          </div>
          <div className="two-col" style={{marginBottom:8}}>
            <div className="field" style={{marginBottom:0}}><label>Move To</label>
              <select value={newStage} onChange={e=>setNewStage(e.target.value)}>
                {funnelStages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {newStageNeedsReason?(
              <div className="field" style={{marginBottom:0}}><label>{newStageIsRejected?"Rejection Reason *":"Reason *"}</label>
                <select value={rejectionReasonId} onChange={e=>setRejectionReasonId(e.target.value)}>
                  <option value="">—</option>{rejectionReasons.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            ):newStageIsInterview?(
              <div className="field" style={{marginBottom:0}}><label>Interview Date & Time *</label>
                <input type="datetime-local" value={interviewAt} onChange={e=>setInterviewAt(e.target.value)}/>
              </div>
            ):newStageIsHired?(
              <div className="field" style={{marginBottom:0,gridColumn:"1 / -1"}}>
                <label>Fills Which Opening?</label>
                <div style={{display:"flex",gap:14,margin:"4px 0 8px",fontSize:13}}>
                  <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}><input type="radio" checked={openingChoice==="none"} onChange={()=>setOpeningChoice("none")}/> Not linked</label>
                  <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}><input type="radio" checked={openingChoice==="existing"} onChange={()=>setOpeningChoice("existing")}/> Link an open position</label>
                  <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}><input type="radio" checked={openingChoice==="new"} onChange={()=>setOpeningChoice("new")}/> Open a new position</label>
                </div>
                {openingChoice==="existing"&&(
                  <select value={selectedOpeningId} onChange={e=>setSelectedOpeningId(e.target.value)}>
                    <option value="">— Pick an opening —</option>
                    {openOpenings.map(o=><option key={o.id} value={o.id}>{openingLabel(o)}</option>)}
                  </select>
                )}
                {openingChoice==="new"&&(
                  <div className="two-col">
                    <div className="field" style={{marginBottom:0}}><label>Company</label>
                      <select value={newOpeningCompanyId} onChange={e=>setNewOpeningCompanyId(e.target.value)}>
                        <option value="">—</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="field" style={{marginBottom:0}}><label>Process</label>
                      <select value={newOpeningProcessId} onChange={e=>setNewOpeningProcessId(e.target.value)}>
                        <option value="">—</option>{processes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="field" style={{marginBottom:0}}><label>Position Type</label>
                      <select value={newOpeningPositionId} onChange={e=>setNewOpeningPositionId(e.target.value)}>
                        <option value="">—</option>{positionTypes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="field" style={{marginBottom:0}}><label>Target Headcount</label>
                      <input type="number" min="1" value={newOpeningTarget} onChange={e=>setNewOpeningTarget(e.target.value)}/>
                    </div>
                    <div className="field" style={{marginBottom:0}}><label>Opened On</label>
                      <input type="date" value={newOpeningDate} onChange={e=>setNewOpeningDate(e.target.value)}/>
                    </div>
                  </div>
                )}
              </div>
            ):(
              <div className="field" style={{marginBottom:0}}><label>Sub-disposition (activity log note)</label><input value={stageRemark} onChange={e=>setStageRemark(e.target.value)} placeholder="Why the stage is changing"/></div>
            )}
          </div>
          {(newStageNeedsReason||newStageIsInterview||newStageIsHired)&&(
            <div className="field" style={{marginBottom:8}}><label>Additional Note (optional)</label><input value={stageRemark} onChange={e=>setStageRemark(e.target.value)} placeholder="Any extra detail"/></div>
          )}
          <button className="btn btn-sm" onClick={changeStage} disabled={busy}>Update Stage</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:16}}>
        <div className="card-header"><div className="card-title">Log a Contact Attempt</div></div>
        <div className="card-body">
          <div className="field"><label>What happened</label><input value={attemptRemark} onChange={e=>setAttemptRemark(e.target.value)} placeholder="e.g. No answer, tried again"/></div>
          <button className="btn btn-sm" onClick={logAttempt} disabled={busy}>Log Attempt</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:16}}>
        <div className="card-header"><div className="card-title">Assignment</div></div>
        <div className="card-body">
          <div style={{marginBottom:12,fontSize:13}}>Currently: <strong>{userMap[candidate.assigned_to]?.name||userMap[candidate.assigned_to]?.email||"Unassigned"}</strong></div>

          {hasPendingRequest&&(
            <div className="info-box amber" style={{marginBottom:12}}>
              {isPendingForMe?(
                <>
                  <div style={{marginBottom:8}}>{userMap[candidate.assigned_to]?.name||userMap[candidate.assigned_to]?.email||"—"} wants to hand this case to you{candidate.pending_reassign_note?`: "${candidate.pending_reassign_note}"`:""}.</div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-sm btn-green" onClick={acceptHandoff} disabled={busy}>Accept</button>
                    <button className="btn btn-sm btn-ghost" onClick={rejectHandoff} disabled={busy}>Decline</button>
                  </div>
                </>
              ):isMyOwnPendingRequest?(
                <>
                  <div style={{marginBottom:8}}>Handoff requested to {userMap[candidate.pending_reassign_to]?.name||userMap[candidate.pending_reassign_to]?.email||"—"} — waiting for them to accept.</div>
                  <button className="btn btn-sm btn-ghost" onClick={cancelHandoff} disabled={busy}>Cancel Request</button>
                </>
              ):(
                <div>Handoff pending: {userMap[candidate.assigned_to]?.name||"—"} → {userMap[candidate.pending_reassign_to]?.name||"—"}</div>
              )}
            </div>
          )}

          {canDirectReassign?(
            <div className="two-col" style={{marginBottom:8}}>
              <div className="field" style={{marginBottom:0}}><label>Reassign To</label>
                <select value={reassignTo} onChange={e=>setReassignTo(e.target.value)}>
                  <option value="">— Unassigned —</option>{assignableUsers.map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}
                </select>
              </div>
              <button className="btn btn-sm" onClick={reassign} disabled={busy} style={{alignSelf:"flex-end"}}>Reassign</button>
            </div>
          ):(!hasPendingRequest&&candidate.assigned_to===myUserId&&(
            <div style={{marginBottom:8}}>
              <div className="two-col" style={{marginBottom:8}}>
                <div className="field" style={{marginBottom:0}}><label>Hand Off To</label>
                  <select value={reassignTo} onChange={e=>setReassignTo(e.target.value)}>
                    <option value="">— Pick a recruiter —</option>{assignableUsers.filter(u=>u.id!==myUserId).map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}
                  </select>
                </div>
                <button className="btn btn-sm" onClick={requestHandoff} disabled={busy||!reassignTo} style={{alignSelf:"flex-end"}}>Request Handoff</button>
              </div>
              <input value={handoffNote} onChange={e=>setHandoffNote(e.target.value)} placeholder="Optional note for them"/>
            </div>
          ))}

          <button className="btn btn-sm btn-amber" onClick={sendToIvr} disabled={sendingToIvr}>{sendingToIvr?"Scheduling...":"Send to IVR (didn't pick up)"}</button>
        </div>
      </div>

      {canDirectReassign&&(
        <div className="card" style={{marginBottom:16,borderColor:T.red}}>
          <div className="card-header"><div className="card-title" style={{color:T.red}}>Danger Zone</div></div>
          <div className="card-body">
            <button className="btn btn-sm btn-danger" onClick={deleteCandidate} disabled={busy}>Delete Candidate</button>
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:16}}>
        <div className="card-header" style={{cursor:"pointer"}} onClick={()=>setShowDetails(d=>!d)}>
          <div className="card-title">Candidate Details {showDetails?"▾":"▸"}</div>
        </div>
        {showDetails&&(
          <div className="card-body">
            <div className="two-col" style={{marginBottom:8}}>
              <div className="field"><label>Current Salary</label><input value={form.current_salary} onChange={e=>setForm({...form,current_salary:e.target.value})} placeholder="e.g. 18k"/></div>
              <div className="field"><label>Expected Salary</label><input value={form.expected_salary} onChange={e=>setForm({...form,expected_salary:e.target.value})} placeholder="e.g. 22k"/></div>
            </div>
            <div className="two-col" style={{marginBottom:8}}>
              <div className="field"><label>Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="City / area"/></div>
              <div className="field"><label>Intent</label>
                <select value={form.intent} onChange={e=>setForm({...form,intent:e.target.value})}>
                  <option value="">—</option><option value="YES">Yes</option><option value="MAYBE">Maybe</option><option value="NO">No</option>
                </select>
              </div>
            </div>
            <div className="two-col" style={{marginBottom:8}}>
              <div className="field"><label>Company</label>
                <select value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})}>
                  <option value="">—</option>{(companies||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Process</label>
                <select value={form.process_id} onChange={e=>setForm({...form,process_id:e.target.value})}>
                  <option value="">—</option>{processes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="two-col" style={{marginBottom:8}}>
              <div className="field"><label>Position</label>
                <select value={form.position_type_id} onChange={e=>setForm({...form,position_type_id:e.target.value})}>
                  <option value="">—</option>{positionTypes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="two-col" style={{marginBottom:8}}>
              <div className="field" style={{marginBottom:0}}><label>Source</label>
                <select value={form.source_id} onChange={e=>setForm({...form,source_id:e.target.value})}>
                  <option value="">—</option>{leadSources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="field" style={{marginBottom:0}}><label>Languages Spoken</label><input value={form.languages_spoken} onChange={e=>setForm({...form,languages_spoken:e.target.value})} placeholder="e.g. Hindi, English"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:8}}>
              {["english","hindi","malayalam"].map(lang=>(
                <div className="field" key={lang}><label style={{textTransform:"capitalize"}}>{lang}</label>
                  <select value={form[lang]} onChange={e=>setForm({...form,[lang]:e.target.value})}>
                    <option value="">—</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button className="btn btn-sm" onClick={saveDetails} disabled={saving}>{saving?"Saving...":"Save Details"}</button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Activity Timeline</div></div>
        <div className="card-body" style={{maxHeight:260,overflowY:"auto"}}>
          {activity.length===0?<div style={{fontSize:13,color:T.muted}}>No activity yet</div>:activity.map(a=>(
            <div key={a.id} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontWeight:600}}>{a.type.replace("_"," ")}</span>
                <span style={{color:T.muted,fontSize:11}}>{new Date(a.changed_at).toLocaleString("en-IN")}</span>
              </div>
              {a.remark&&<div style={{color:T.muted}}>{a.remark}</div>}
              {a.changed_by&&<div style={{color:T.muted,fontSize:11}}>by {userMap[a.changed_by]?.name||userMap[a.changed_by]?.email||"—"}</div>}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ================================================
// HIREFLOW — CANDIDATES
// ================================================
function HireFlowCandidates({ showToast }) {
  const [candidates,setCandidates]=useState([]);
  const [companies,setCompanies]=useState([]);
  const [processes,setProcesses]=useState([]);
  const [positionTypes,setPositionTypes]=useState([]);
  const [leadSources,setLeadSources]=useState([]);
  const [rejectionReasons,setRejectionReasons]=useState([]);
  const [funnelStages,setFunnelStages]=useState([]);
  const [users,setUsers]=useState([]);
  const [activitySummary,setActivitySummary]=useState({});
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [stageFilter,setStageFilter]=useState("ALL");
  const [processFilter,setProcessFilter]=useState("ALL");
  const [assigneeFilter,setAssigneeFilter]=useState(getRole()==="HR"?"MINE":"");
  const [colWidths,setColWidths]=useState({});
  const [filterFrom,setFilterFrom]=useState("");
  const [filterTo,setFilterTo]=useState("");
  const [page,setPage]=useState(1);
  const pageSize=25;
  const [selected,setSelected]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [addForm,setAddForm]=useState({name:"",phone:"",company_id:"",process_id:"",position_type_id:"",source_id:"",assigned_to:"",languages_spoken:""});
  const [adding,setAdding]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [uploadAssignees,setUploadAssignees]=useState([]);
  const [showAssigneePicker,setShowAssigneePicker]=useState(false);
  const [selectedIds,setSelectedIds]=useState([]);
  const [bulkAssignTo,setBulkAssignTo]=useState("");
  const [bulkAssigning,setBulkAssigning]=useState(false);
  const [bulkDeleting,setBulkDeleting]=useState(false);
  const [bulkHighlighting,setBulkHighlighting]=useState(false);
  const [sendingIvrIds,setSendingIvrIds]=useState([]);
  const [bulkSendingIvr,setBulkSendingIvr]=useState(false);
  const fileRef=useRef();

  const [pageTab,setPageTab]=useState("pipeline");
  const [hiredDateMap,setHiredDateMap]=useState({});
  const [concludedSearch,setConcludedSearch]=useState("");
  const [concludedStageFilter,setConcludedStageFilter]=useState("");
  const [hiredProcessFilter,setHiredProcessFilter]=useState("");
  const [hiredPositionFilter,setHiredPositionFilter]=useState("");
  const [hiredFrom,setHiredFrom]=useState("");
  const [hiredTo,setHiredTo]=useState("");
  const role=getRole();
  const myUserId=users.find(u=>u.email===getEmail())?.id;
  const reporteeIds=users.filter(u=>u.manager_id===myUserId).map(u=>u.id);

  useEffect(()=>{loadAll();},[]);
  // Manager/Admin land on the overall view here (not a self-scoped default)
  // — they're meant to oversee everyone, matching the main Dashboard.
  useEffect(()=>{setPage(1);},[search,stageFilter,processFilter,assigneeFilter,filterFrom,filterTo]);

  async function loadAll(){
    setLoading(true);
    try{
      const [cands,comps,procs,posTypes,sources,reasons,stages,userList,activity]=await Promise.all([
        dbSelect("candidates","?select=*&order=updated_at.desc"),
        dbSelect("companies","?select=*&order=name"),
        dbSelect("processes","?select=*&order=name"),
        dbSelect("position_types","?select=*&order=name"),
        dbSelect("lead_sources","?select=*&order=name"),
        dbSelect("rejection_reasons","?select=*&order=name"),
        dbSelect("funnel_stages","?select=*&order=sort_order"),
        dbSelect("user_roles","?select=id,name,email,role,manager_id"),
        dbSelect("candidate_activity","?select=candidate_id,is_contact_attempt,remark,changed_at&order=changed_at.desc"),
      ]);
      setCandidates(cands);setCompanies(comps);setProcesses(procs);setPositionTypes(posTypes);setLeadSources(sources);setRejectionReasons(reasons);setFunnelStages(stages);setUsers(userList);

      const summary={};
      activity.forEach(a=>{
        if(!summary[a.candidate_id])summary[a.candidate_id]={count:0,ivrCount:0,last:a.changed_at};
        if(a.is_contact_attempt)summary[a.candidate_id].count+=1;
        // "IVR call placed" is the exact remark hireflow.py's _place_call()
        // writes for every on-the-spot IVR dial — the one reliable way to
        // tell an IVR attempt apart from a recruiter's manually-logged one
        // (which shares the same CALL_ATTEMPT type but a free-text remark).
        if(a.remark==="IVR call placed")summary[a.candidate_id].ivrCount+=1;
      });
      setActivitySummary(summary);

      const exitStageIds=stages.filter(s=>s.is_exit_stage).map(s=>s.id);
      if(exitStageIds.length){
        const concludeEvents=await dbSelect("candidate_activity",`?select=candidate_id,changed_at&type=eq.STAGE_CHANGE&to_stage_id=in.(${exitStageIds.join(",")})&order=changed_at.desc`);
        const dateMap={};
        concludeEvents.forEach(e=>{if(!dateMap[e.candidate_id])dateMap[e.candidate_id]=e.changed_at;});
        setHiredDateMap(dateMap);
      }
    }catch(e){showToast("Failed to load candidates","error");}
    finally{setLoading(false);}
  }

  const processMap=Object.fromEntries(processes.map(p=>[p.id,p.name]));
  const positionMap=Object.fromEntries(positionTypes.map(p=>[p.id,p.name]));
  const stageMap=Object.fromEntries(funnelStages.map(s=>[s.id,s]));
  const userMap=Object.fromEntries(users.map(u=>[u.id,u]));
  const sourceMap=Object.fromEntries(leadSources.map(s=>[s.id,s.name]));
  // Candidates can only ever be owned by HR/Manager — Admin and CEO don't work cases.
  const assignableUsers=users.filter(u=>["HR","MANAGER"].includes(u.role));

  function exportCandidatesCSV(){
    const headers=["Name","Phone","Process","Position","Stage","Assigned To","Remarks","IVR Attempts","Last Activity","Current Salary","Expected Salary","Location","Source","Languages Spoken","Created At"];
    const rows=filtered.map(c=>{
      const owner=userMap[c.assigned_to];
      const summary=activitySummary[c.id];
      return [
        c.name,c.phone,processMap[c.process_id]||"",positionMap[c.position_type_id]||"",
        stageMap[c.current_stage_id]?.name||"",owner?(owner.name||owner.email):"Unassigned",
        c.remark||"",summary?.ivrCount||0,
        summary?.last?new Date(summary.last).toLocaleDateString("en-IN"):"Never",
        c.current_salary||"",c.expected_salary||"",c.location||"",sourceMap[c.source_id]||"",
        c.languages_spoken||"",c.created_at?new Date(c.created_at).toLocaleDateString("en-IN"):"",
      ];
    });
    downloadCSV(`hireflow_candidates_${today()}.csv`,headers,rows);
  }

  function isStale(c){
    return daysUntouched(c)>=1;
  }

  const filtered=candidates.filter(c=>{
    // Concluded (exit-stage) candidates live in the Concluded Cases tab now,
    // not the working Pipeline — keeps this view to active cases only.
    if(stageMap[c.current_stage_id]?.is_exit_stage)return false;
    if(search){
      const q=search.toLowerCase();
      if(!c.name?.toLowerCase().includes(q)&&!c.phone?.includes(q))return false;
    }
    if(stageFilter!=="ALL"&&c.current_stage_id!==stageFilter)return false;
    if(processFilter!=="ALL"&&c.process_id!==processFilter)return false;
    if(assigneeFilter==="MINE"&&c.assigned_to!==myUserId)return false;
    if(assigneeFilter==="TEAM"&&!reporteeIds.includes(c.assigned_to)&&c.assigned_to!==myUserId)return false;
    if(assigneeFilter&&!["MINE","TEAM"].includes(assigneeFilter)&&c.assigned_to!==assigneeFilter)return false;
    if((filterFrom||filterTo)&&c.assigned_at){
      const d=new Date(c.assigned_at).toISOString().split("T")[0];
      if(filterFrom&&d<filterFrom)return false;
      if(filterTo&&d>filterTo)return false;
    } else if(filterFrom||filterTo){
      return false;
    }
    return true;
  });
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const pageSafe=Math.min(page,totalPages);
  const paged=filtered.slice((pageSafe-1)*pageSize,pageSafe*pageSize);

  // Concluded Cases — every exit-stage candidate (Hired, Rejected, Not
  // Interested, No Response, or whatever else is marked is_exit_stage),
  // clickable to open the full candidate modal so stage can still be
  // changed from here. Same role scoping as everywhere else.
  const exitStageIdsForTab=funnelStages.filter(s=>s.is_exit_stage).map(s=>s.id);
  const concludedList=candidates.filter(c=>{
    if(!exitStageIdsForTab.includes(c.current_stage_id))return false;
    if(role==="HR"){if(c.assigned_to!==myUserId)return false;}
    else if(role==="MANAGER"){if(!(reporteeIds.includes(c.assigned_to)||c.assigned_to===myUserId))return false;}
    if(concludedSearch&&!(c.name.toLowerCase().includes(concludedSearch.toLowerCase())||c.phone.includes(concludedSearch)))return false;
    if(hiredProcessFilter&&c.process_id!==hiredProcessFilter)return false;
    if(hiredPositionFilter&&c.position_type_id!==hiredPositionFilter)return false;
    if(concludedStageFilter&&c.current_stage_id!==concludedStageFilter)return false;
    if(hiredFrom||hiredTo){
      const hd=hiredDateMap[c.id];
      if(!hd)return false;
      const d=new Date(hd).toISOString().split("T")[0];
      if(hiredFrom&&d<hiredFrom)return false;
      if(hiredTo&&d>hiredTo)return false;
    }
    return true;
  }).sort((a,b)=>new Date(hiredDateMap[b.id]||0)-new Date(hiredDateMap[a.id]||0));
  const concludedByStage=(()=>{
    const groups={};
    concludedList.forEach(c=>{const k=stageMap[c.current_stage_id]?.name||"—";groups[k]=(groups[k]||0)+1;});
    return Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  })();

  // ---- Pipeline KPIs (all-time, role-scoped) ----
  const dashScoped=candidates.filter(c=>{
    if(role==="HR")return c.assigned_to===myUserId;
    if(role==="MANAGER"){
      if(!(reporteeIds.includes(c.assigned_to)||c.assigned_to===myUserId))return false;
    }
    return true;
  });
  const dashNewToday=dashScoped.filter(c=>c.created_at&&new Date(c.created_at).toISOString().split("T")[0]===today()).length;
  const dashHiredTotal=dashScoped.filter(c=>stageMap[c.current_stage_id]?.name==="Hired").length;
  const dashPending=dashScoped.filter(c=>{const s=stageMap[c.current_stage_id];return s&&!s.is_exit_stage;}).length;
  const dashScheduledInterviews=dashScoped.filter(c=>c.interview_scheduled_at&&stageMap[c.current_stage_id]?.name==="Interview Scheduled");
  const dashInterviewsToday=dashScheduledInterviews.filter(c=>new Date(c.interview_scheduled_at).toISOString().split("T")[0]===today());
  const dashInterviewsPast=dashScheduledInterviews.filter(c=>new Date(c.interview_scheduled_at).toISOString().split("T")[0]<today());

  function daysUntouched(c){
    const last=activitySummary[c.id]?.last||c.updated_at||c.created_at;
    if(!last)return 0;
    const lastDate=new Date(last).toISOString().split("T")[0];
    const msPerDay=24*60*60*1000;
    return Math.floor((new Date(today()).getTime()-new Date(lastDate).getTime())/msPerDay);
  }
  const dashActiveScoped=dashScoped.filter(c=>!stageMap[c.current_stage_id]?.is_exit_stage);
  // "Untouched" = still sitting in New — nothing has happened to them since
  // upload/creation. Anything that moved past New (even just to Contacted)
  // has, by definition, been touched.
  const dashUntouched=dashScoped.filter(c=>stageMap[c.current_stage_id]?.name==="New");

  async function addCandidate(){
    const phone=addForm.phone.replace(/\D/g,"");
    if(!addForm.name.trim()||!phone){showToast("Name and phone required","error");return;}
    if(phone.length!==10){showToast("Phone must be 10 digits","error");return;}
    setAdding(true);
    try{
      const dupe=await dbSelect("candidates",`?select=id,name,assigned_to,current_stage_id&phone=eq.${phone}`);
      if(dupe.length){
        const owner=userMap[dupe[0].assigned_to];
        const stage=stageMap[dupe[0].current_stage_id];
        showToast(`Already exists: ${dupe[0].name} (${stage?.name||"no stage"}${owner?`, assigned to ${owner.name||owner.email}`:""})`,"error");
        setAdding(false);return;
      }
      const newStage=funnelStages.find(s=>s.name==="New");
      const inserted=await dbInsert("candidates",{
        name:addForm.name.trim(),phone,
        company_id:addForm.company_id||null,
        process_id:addForm.process_id||null,position_type_id:addForm.position_type_id||null,
        source_id:addForm.source_id||null,assigned_to:addForm.assigned_to||null,
        assigned_at:addForm.assigned_to?new Date().toISOString():null,
        languages_spoken:addForm.languages_spoken||null,
        current_stage_id:newStage?.id||null,uploaded_by:myUserId,
      });
      if(addForm.assigned_to&&inserted?.[0]?.id){
        await dbInsert("candidate_activity",{
          candidate_id:inserted[0].id,type:"ASSIGNMENT",is_contact_attempt:false,
          remark:`Assigned to ${userMap[addForm.assigned_to]?.name||userMap[addForm.assigned_to]?.email||"—"} on add`,changed_by:myUserId,
        });
      }
      showToast("Candidate added","success");
      setShowAdd(false);setAddForm({name:"",phone:"",process_id:"",position_type_id:"",source_id:"",assigned_to:"",languages_spoken:""});
      loadAll();
    }catch{showToast("Failed to add candidate","error");}
    finally{setAdding(false);}
  }

  async function handleUpload(file){
    if(!file||!file.name.endsWith(".csv")){showToast("Please upload a CSV file","error");return;}
    setUploading(true);
    try{
      const text=await file.text();
      const rows=parseCSV(text);
      const existingPhones=new Set(candidates.map(c=>c.phone));
      const newStage=funnelStages.find(s=>s.name==="New");
      let added=0,skippedDup=0,skippedInvalid=0,skippedUnmatched=0;
      const payload=[];
      rows.forEach(row=>{
        const phone=(row.phone||row.number||"").replace(/\D/g,"");
        const name=row.name||row.candidate||"";
        if(!phone||phone.length!==10||!name){skippedInvalid++;return;}
        if(existingPhones.has(phone)){skippedDup++;return;}

        const processText=(row.process||"").trim();
        const matchedProcess=processText?processes.find(p=>p.name.toLowerCase()===processText.toLowerCase()):null;
        if(processText&&!matchedProcess){skippedUnmatched++;return;}

        const positionText=(row.position||"").trim();
        const matchedPosition=positionText?positionTypes.find(p=>p.name.toLowerCase()===positionText.toLowerCase()):null;
        if(positionText&&!matchedPosition){skippedUnmatched++;return;}

        existingPhones.add(phone);
        const matchedSource=leadSources.find(s=>s.name.toLowerCase()===(row.source||"").trim().toLowerCase());
        const assignedTo=uploadAssignees.length?uploadAssignees[added%uploadAssignees.length]:null;
        payload.push({
          name,phone,
          current_salary:row["current salary"]||null,expected_salary:row["expected salary"]||null,
          location:row.location||null,source_id:matchedSource?.id||null,
          process_id:matchedProcess?.id||null,position_type_id:matchedPosition?.id||null,
          languages_spoken:row.language||row["language spoken"]||null,
          current_stage_id:newStage?.id||null,uploaded_by:myUserId,
          assigned_to:assignedTo,assigned_at:assignedTo?new Date().toISOString():null,
        });
        added++;
      });
      let inserted=[];
      if(payload.length)inserted=await dbInsertIgnoreDup("candidates",payload,"phone");
      // The client-side existingPhones check only catches duplicates against
      // candidates already loaded in this browser tab — a phone that exists
      // in the DB but wasn't in that stale snapshot (e.g. another HR added
      // it moments ago, or two rows in the CSV itself share a number)
      // silently gets skipped by the DB instead of failing the whole batch,
      // so the "added" count here is the real post-insert count, not the
      // pre-insert attempt count.
      const dbSkippedDup=payload.length-(inserted?.length||0);
      skippedDup+=dbSkippedDup;
      const assignedRows=(inserted||[]).filter(c=>c.assigned_to);
      if(assignedRows.length){
        await dbInsert("candidate_activity",assignedRows.map(c=>({
          candidate_id:c.id,type:"ASSIGNMENT",is_contact_attempt:false,
          remark:`Assigned to ${userMap[c.assigned_to]?.name||userMap[c.assigned_to]?.email||"—"} on upload (round-robin)`,changed_by:myUserId,
        })));
      }
      const insertedCount=inserted?.length||0;
      showToast(`${insertedCount} added, ${skippedDup} duplicates, ${skippedUnmatched} unmatched process/position, ${skippedInvalid} invalid rows skipped`,insertedCount?"success":"error");
      setUploadAssignees([]);
      loadAll();
    }catch{showToast("Upload failed","error");}
    finally{setUploading(false);if(fileRef.current)fileRef.current.value="";}
  }

  async function toggleHighlight(c){
    const next=!c.highlighted;
    setCandidates(prev=>prev.map(x=>x.id===c.id?{...x,highlighted:next}:x));
    try{await dbUpdate("candidates",`id=eq.${c.id}`,{highlighted:next});}
    catch{setCandidates(prev=>prev.map(x=>x.id===c.id?{...x,highlighted:!next}:x));showToast("Failed to update highlight","error");}
  }

  async function takeCandidate(c){
    try{
      await dbUpdate("candidates",`id=eq.${c.id}`,{assigned_to:myUserId,assigned_at:new Date().toISOString(),updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",{
        candidate_id:c.id,type:"ASSIGNMENT",is_contact_attempt:false,
        remark:`Taken by ${userMap[myUserId]?.name||userMap[myUserId]?.email||"—"}`,changed_by:myUserId,
      });
      showToast("Candidate taken","success");
      loadAll();
    }catch{showToast("Failed to take candidate","error");}
  }

  async function bulkAssign(){
    if(!bulkAssignTo||!selectedIds.length){showToast("Pick a recruiter and at least one candidate","error");return;}
    setBulkAssigning(true);
    try{
      const idList=selectedIds.join(",");
      await dbUpdate("candidates",`id=in.(${idList})`,{assigned_to:bulkAssignTo,assigned_at:new Date().toISOString(),updated_at:new Date().toISOString()});
      await dbInsert("candidate_activity",selectedIds.map(id=>({
        candidate_id:id,type:"ASSIGNMENT",is_contact_attempt:false,
        remark:`Bulk assigned to ${userMap[bulkAssignTo]?.name||userMap[bulkAssignTo]?.email||"—"}`,changed_by:myUserId,
      })));
      showToast(`${selectedIds.length} candidates assigned`,"success");
      setSelectedIds([]);setBulkAssignTo("");
      loadAll();
    }catch{showToast("Failed to bulk assign","error");}
    finally{setBulkAssigning(false);}
  }

  async function bulkDelete(){
    if(!selectedIds.length)return;
    if(!window.confirm(`Permanently delete ${selectedIds.length} candidate(s)? This cannot be undone.`))return;
    setBulkDeleting(true);
    try{
      const idList=selectedIds.join(",");
      await dbDelete("candidate_activity",`candidate_id=in.(${idList})`);
      await dbDelete("candidates",`id=in.(${idList})`);
      showToast(`${selectedIds.length} candidates deleted`,"success");
      setSelectedIds([]);
      loadAll();
    }catch{showToast("Failed to delete","error");}
    finally{setBulkDeleting(false);}
  }

  async function bulkHighlight(state){
    if(!selectedIds.length)return;
    setBulkHighlighting(true);
    try{
      const idList=selectedIds.join(",");
      await dbUpdate("candidates",`id=in.(${idList})`,{highlighted:state});
      setCandidates(prev=>prev.map(c=>selectedIds.includes(c.id)?{...c,highlighted:state}:c));
      showToast(`${selectedIds.length} candidates ${state?"highlighted":"unhighlighted"}`,"success");
      setSelectedIds([]);
    }catch{showToast("Failed to update highlight","error");}
    finally{setBulkHighlighting(false);}
  }

  async function sendToIvrSingle(c){
    if(c.ivr_next_attempt_at){showToast("IVR call already scheduled for this candidate","error");return;}
    const stageName=stageMap[c.current_stage_id]?.name;
    if(POSITIVE_HIRING_STAGES.includes(stageName)){
      if(!window.confirm(`${c.name} is already in "${stageName}" — sending to IVR now could interfere with an active hiring process. Continue anyway?`))return;
    }
    setSendingIvrIds(prev=>[...prev,c.id]);
    try{
      const res=await renderFetch("/hireflow/send-to-ivr",{method:"POST",body:JSON.stringify({candidate_id:c.id})});
      showToast(res.message||"Scheduled","success");
      loadAll();
    }catch(e){showToast(e.message||"Failed to send to IVR","error");}
    finally{setSendingIvrIds(prev=>prev.filter(id=>id!==c.id));}
  }

  async function bulkSendToIvr(){
    if(!selectedIds.length)return;
    const targets=candidates.filter(c=>selectedIds.includes(c.id));
    const alreadyScheduled=targets.filter(c=>c.ivr_next_attempt_at);
    if(alreadyScheduled.length){showToast(`${alreadyScheduled.length} of ${targets.length} selected already have an IVR call scheduled — deselect them first`,"error");return;}
    const positive=targets.filter(c=>POSITIVE_HIRING_STAGES.includes(stageMap[c.current_stage_id]?.name));
    if(positive.length&&!window.confirm(`${positive.length} of ${targets.length} selected are already in a positive hiring stage (Interview/Selected/Hired). Send to IVR anyway?`))return;
    setBulkSendingIvr(true);
    try{
      for(const c of targets){
        await renderFetch("/hireflow/send-to-ivr",{method:"POST",body:JSON.stringify({candidate_id:c.id})});
      }
      showToast(`${targets.length} candidates sent to IVR`,"success");
      setSelectedIds([]);
      loadAll();
    }catch(e){showToast(e.message||"Some sends failed","error");}
    finally{setBulkSendingIvr(false);}
  }

  function toggleSelect(id){
    setSelectedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  }

  return(
    <div>
      <div className="page-header">
        <div><div className="page-title">Hire Flow</div><div className="page-sub">Hiring funnel — from first contact to hired</div></div>
        {pageTab==="pipeline"&&(
          <div style={{display:"flex",gap:8}}>
            <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleUpload(e.target.files[0])}/>
            <div style={{position:"relative"}}>
              <button className="btn btn-sm btn-ghost" onClick={()=>setShowAssigneePicker(v=>!v)} title="Optional: pick recruiters to round-robin assign uploaded rows to">
                {uploadAssignees.length?`Round-robin (${uploadAssignees.length})`:"Round-robin: Off"}
              </button>
              {showAssigneePicker&&(
                <>
                  <div style={{position:"fixed",inset:0,zIndex:19}} onClick={()=>setShowAssigneePicker(false)}/>
                  <div className="card" style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:20,width:220,maxHeight:240,overflowY:"auto",padding:8,margin:0}}>
                    {assignableUsers.map(u=>(
                      <label key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",fontSize:13,cursor:"pointer",borderRadius:6}}>
                        <input type="checkbox" checked={uploadAssignees.includes(u.id)} onChange={()=>setUploadAssignees(prev=>prev.includes(u.id)?prev.filter(x=>x!==u.id):[...prev,u.id])}/>
                        {u.name||u.email}
                      </label>
                    ))}
                    {uploadAssignees.length>0&&<button className="btn btn-sm btn-ghost" style={{width:"100%",marginTop:4}} onClick={()=>setUploadAssignees([])}>Clear</button>}
                  </div>
                </>
              )}
            </div>
            <button className="btn btn-sm btn-ghost" onClick={()=>downloadCSV("hireflow_upload_template.csv",["name","phone","current salary","expected salary","location","process","position","source","language"],[["Jane Doe","9876543210","18000","22000","Bangalore","Cred","Calling Executive","Work India","Hindi, English"]])}>Download Template</button>
            <button className="btn btn-sm btn-ghost" onClick={()=>fileRef.current?.click()} disabled={uploading}>{uploading?"Uploading...":"Upload CSV"}</button>
            <button className="btn btn-sm" onClick={()=>setShowAdd(true)}>Add Candidate</button>
          </div>
        )}
      </div>
      <div className="page-content">
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button className={`btn btn-sm ${pageTab==="pipeline"?"":"btn-ghost"}`} onClick={()=>setPageTab("pipeline")}>Pipeline</button>
          <button className={`btn btn-sm ${pageTab==="concluded"?"":"btn-ghost"}`} onClick={()=>setPageTab("concluded")}>Concluded Cases ({concludedList.length})</button>
          <button className={`btn btn-sm ${pageTab==="ivr"?"":"btn-ghost"}`} onClick={()=>setPageTab("ivr")}>IVR Interested</button>
        </div>
        {pageTab==="ivr"?<InterestedCandidates showToast={showToast}/>:pageTab==="concluded"?(
          <>
          <div className="kpi-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",marginBottom:16}}>
            <div className="kpi-card"><div className="kpi-label">Total Concluded</div><div className="kpi-value green">{concludedList.length}</div><div className="kpi-sub">{hiredFrom||hiredTo?"Filtered range":"All time"}</div></div>
            {concludedByStage.slice(0,4).map(([name,count])=>(
              <div className="kpi-card" key={name}><div className="kpi-label">{name}</div><div className="kpi-value blue">{count}</div><div className="kpi-sub">Candidates</div></div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <input className="filter-input" value={concludedSearch} onChange={e=>setConcludedSearch(e.target.value)} placeholder="Search name or phone" style={{maxWidth:220}}/>
            <FilterSelect value={concludedStageFilter} onChange={setConcludedStageFilter} allLabel="All Outcomes" options={funnelStages.filter(s=>s.is_exit_stage).map(s=>({value:s.id,label:s.name}))}/>
            <FilterSelect value={hiredProcessFilter} onChange={setHiredProcessFilter} allLabel="All Processes" options={processes.map(p=>({value:p.id,label:p.name}))}/>
            <FilterSelect value={hiredPositionFilter} onChange={setHiredPositionFilter} allLabel="All Positions" options={positionTypes.map(p=>({value:p.id,label:p.name}))}/>
            <input type="date" className="filter-input" value={hiredFrom} onChange={e=>setHiredFrom(e.target.value)} title="Concluded from date"/>
            <input type="date" className="filter-input" value={hiredTo} onChange={e=>setHiredTo(e.target.value)} title="Concluded to date"/>
            <button className="btn btn-sm btn-ghost" onClick={()=>{const t=today();setHiredFrom(t);setHiredTo(t);}}>Today</button>
            <button className="btn btn-sm btn-ghost" onClick={()=>{const t=new Date();const f=new Date();f.setDate(t.getDate()-7);setHiredFrom(f.toISOString().split("T")[0]);setHiredTo(t.toISOString().split("T")[0]);}}>This Week</button>
            {(concludedSearch||concludedStageFilter||hiredProcessFilter||hiredPositionFilter||hiredFrom||hiredTo)&&(
              <button className="btn btn-sm btn-ghost" onClick={()=>{setConcludedSearch("");setConcludedStageFilter("");setHiredProcessFilter("");setHiredPositionFilter("");setHiredFrom("");setHiredTo("");}}>✕ Clear Filters</button>
            )}
            {concludedList.length>0&&(
              <button className="btn btn-sm btn-ghost" onClick={()=>setSelectedIds(concludedList.map(c=>c.id))}>Select All Filtered ({concludedList.length})</button>
            )}
          </div>
          {selectedIds.length>0&&(
            <div className="card" style={{display:"flex",gap:8,alignItems:"center",padding:12,marginBottom:16,border:`1.5px solid ${T.accent}`,flexWrap:"wrap"}}>
              <div style={{fontSize:13,fontWeight:600,color:T.accent}}>{selectedIds.length} selected</div>
              <button className="btn btn-sm btn-ghost" style={{color:T.accent,borderColor:T.accent}} onClick={bulkSendToIvr} disabled={bulkSendingIvr}>{bulkSendingIvr?"Sending...":"📞 Send to IVR"}</button>
              <button className="btn btn-sm btn-ghost" onClick={()=>setSelectedIds([])}>Clear</button>
            </div>
          )}
          <div className="card">
            <div className="card-header"><div className="card-title">Concluded Cases ({concludedList.length})</div><button className="btn btn-sm btn-ghost" onClick={loadAll}>↻</button></div>
            <div className="table-wrap">
              {loading?<div className="empty-state">Loading...</div>:concludedList.length===0?<div className="empty-state"><div className="empty-icon">⬡</div><div className="empty-title">No concluded cases yet</div></div>:(
                <table className="table-compact">
                  <thead><tr><th style={{width:22,padding:"8px 4px"}}></th><th>Name</th><th>Phone</th><th>Process</th><th>Position</th><th>Outcome</th><th>Assigned To</th><th>Concluded Date</th><th>Linked Opening</th><th title="Number of on-the-spot IVR calls placed for this candidate">IVR Attempts</th><th>Action</th></tr></thead>
                  <tbody>{concludedList.map(c=>{
                    const owner=userMap[c.assigned_to];
                    const stage=stageMap[c.current_stage_id];
                    const ivrCount=activitySummary[c.id]?.ivrCount||0;
                    return(
                      <tr key={c.id} onClick={()=>setSelected(c)} style={{cursor:"pointer"}}>
                        <td style={{padding:"6px 4px"}} onClick={e=>e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={()=>toggleSelect(c.id)}/>
                        </td>
                        <td style={{fontWeight:500}}>{c.name}</td>
                        <td style={{fontFamily:"monospace"}}>{c.phone}</td>
                        <td>{processMap[c.process_id]||"—"}</td>
                        <td>{positionMap[c.position_type_id]||"—"}</td>
                        <td><span className="badge" style={{background:`${T.purple}22`,color:T.purple}}>{stage?.name||"—"}</span></td>
                        <td>{owner?(owner.name||owner.email):"Unassigned"}</td>
                        <td>{hiredDateMap[c.id]?new Date(hiredDateMap[c.id]).toLocaleDateString("en-IN"):"—"}</td>
                        <td>{c.filled_opening_id?"✓ Linked":"—"}</td>
                        <td>{ivrCount}x</td>
                        <td onClick={e=>e.stopPropagation()}>
                          {c.ivr_next_attempt_at?
                            <span className="badge badge-gray" title={`Scheduled for ${new Date(c.ivr_next_attempt_at).toLocaleString("en-IN")}`}>Scheduled</span>:
                            <button className="btn btn-sm btn-ghost" onClick={()=>sendToIvrSingle(c)} disabled={sendingIvrIds.includes(c.id)}>{sendingIvrIds.includes(c.id)?"...":"📞 Send to IVR"}</button>
                          }
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              )}
            </div>
          </div>
          </>
        ):(<>
        <div className="kpi-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",marginBottom:16}}>
          <div className="kpi-card">
            <div className="kpi-label">New Today</div>
            <div className="kpi-value blue">{dashNewToday}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value">{dashPending}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Hired</div>
            <div className="kpi-value">{dashHiredTotal}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pending Interviews</div>
            <div className={`kpi-value ${dashInterviewsPast.length?"red":""}`}>{dashInterviewsToday.length+dashInterviewsPast.length}</div>
            <div className="kpi-sub" style={dashInterviewsPast.length?{color:T.red,fontWeight:600}:undefined}>
              {dashInterviewsPast.length?`${dashInterviewsPast.length} overdue`:dashInterviewsToday.length?"All on schedule":"None today"}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Untouched Cases</div>
            <div className={`kpi-value ${dashUntouched.length?"red":""}`}>{dashUntouched.length}</div>
            <div className="kpi-sub" style={dashUntouched.length?{color:T.red,fontWeight:600}:undefined}>
              {dashUntouched.length?"Still in New — not yet contacted":"None"}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <input className="filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone" style={{maxWidth:220}}/>
          <FilterSelect value={stageFilter==="ALL"?"":stageFilter} onChange={v=>setStageFilter(v||"ALL")} allLabel="All Stages" options={funnelStages.filter(s=>!s.is_exit_stage).map(s=>({value:s.id,label:s.name}))}/>
          <FilterSelect value={processFilter==="ALL"?"":processFilter} onChange={v=>setProcessFilter(v||"ALL")} allLabel="All Processes" options={processes.map(p=>({value:p.id,label:p.name}))}/>
          {["ADMIN","MANAGER"].includes(role)&&(
            <FilterSelect value={assigneeFilter} onChange={setAssigneeFilter} allLabel="Everyone" options={[
              {value:"MINE",label:"Assigned to Me"},
              ...(role==="MANAGER"?[{value:"TEAM",label:"My Team"}]:[]),
              ...assignableUsers.map(u=>({value:u.id,label:u.name||u.email})),
            ]}/>
          )}
          <input type="date" className="filter-input" value={filterFrom} onChange={e=>setFilterFrom(e.target.value)} title="Assigned from date"/>
          <input type="date" className="filter-input" value={filterTo} onChange={e=>setFilterTo(e.target.value)} title="Assigned to date"/>
          {(filterFrom||filterTo)&&<button className="btn btn-sm btn-ghost" onClick={()=>{setFilterFrom("");setFilterTo("");}}>✕ Clear Dates</button>}
        </div>

        {selectedIds.length>0&&(
          <div className="card" style={{display:"flex",gap:8,alignItems:"center",padding:12,marginBottom:16,border:`1.5px solid ${T.accent}`,flexWrap:"wrap"}}>
            <div style={{fontSize:13,fontWeight:600,color:T.accent}}>{selectedIds.length} selected</div>
            {["ADMIN","MANAGER"].includes(role)&&(<>
              <select className="filter-select" value={bulkAssignTo} onChange={e=>setBulkAssignTo(e.target.value)}>
                <option value="">Reassign to…</option>{assignableUsers.map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}
              </select>
              <button className="btn btn-sm" onClick={bulkAssign} disabled={bulkAssigning||!bulkAssignTo}>{bulkAssigning?"Reassigning...":"Reassign"}</button>
              <button className="btn btn-sm btn-danger" onClick={bulkDelete} disabled={bulkDeleting}>{bulkDeleting?"Deleting...":"Delete"}</button>
              <button className="btn btn-sm btn-ghost" style={{color:T.amber,borderColor:T.amber}} onClick={()=>bulkHighlight(true)} disabled={bulkHighlighting}>★ Highlight</button>
              <button className="btn btn-sm btn-ghost" onClick={()=>bulkHighlight(false)} disabled={bulkHighlighting}>Remove Highlight</button>
            </>)}
            <button className="btn btn-sm btn-ghost" style={{color:T.accent,borderColor:T.accent}} onClick={bulkSendToIvr} disabled={bulkSendingIvr}>{bulkSendingIvr?"Sending...":"📞 Send to IVR"}</button>
            <button className="btn btn-sm btn-ghost" onClick={()=>setSelectedIds([])}>Clear</button>
          </div>
        )}

        <div className="card">
          <div className="card-header"><div className="card-title">Candidates ({filtered.length})</div><div style={{display:"flex",gap:8}}>{Object.keys(colWidths).length>0&&<button className="btn btn-sm btn-ghost" onClick={()=>setColWidths({})}>Reset Columns</button>}<button className="btn btn-sm btn-ghost" onClick={exportCandidatesCSV}>Download CSV</button><button className="btn btn-sm btn-ghost" onClick={loadAll}>↻</button></div></div>
          <div className="table-wrap">
            {!loading&&filtered.length===0?<div className="empty-state"><div className="empty-icon">⬡</div><div className="empty-title">No candidates found</div></div>:(
              <table className="table-compact" style={{tableLayout:"fixed"}}>
                <thead><tr>
                  <th style={{width:20,padding:"8px 4px"}}></th>
                  <th style={{width:22,padding:"8px 4px"}}>#</th>
                  <th style={{width:22,padding:"8px 4px"}}></th>
                  <ResizableTh col="name" widths={colWidths} setWidths={setColWidths} defaultWidth={130}>Name</ResizableTh>
                  <ResizableTh col="phone" widths={colWidths} setWidths={setColWidths} defaultWidth={100}>Phone</ResizableTh>
                  <ResizableTh col="process" widths={colWidths} setWidths={setColWidths} defaultWidth={110}>Process</ResizableTh>
                  <ResizableTh col="position" widths={colWidths} setWidths={setColWidths} defaultWidth={100}>Position</ResizableTh>
                  <ResizableTh col="stage" widths={colWidths} setWidths={setColWidths} defaultWidth={110}>Stage</ResizableTh>
                  <ResizableTh col="assigned" widths={colWidths} setWidths={setColWidths} defaultWidth={100}>Assigned To</ResizableTh>
                  <ResizableTh col="remarks" widths={colWidths} setWidths={setColWidths} defaultWidth={180}>Remarks</ResizableTh>
                  <th style={{width:85}} title="Number of on-the-spot IVR calls placed for this candidate">IVR Attempts</th>
                  <ResizableTh col="lastActivity" widths={colWidths} setWidths={setColWidths} defaultWidth={110}>Last Activity</ResizableTh>
                  <th style={{width:110}}>IVR</th>
                </tr></thead>
                <tbody>{loading?<SkeletonRows cols={13}/>:paged.map((c,i)=>{
                  const stage=stageMap[c.current_stage_id];
                  const owner=userMap[c.assigned_to];
                  const summary=activitySummary[c.id];
                  const stale=isStale(c);
                  const isOwn=["ADMIN","MANAGER"].includes(role)&&c.assigned_to===myUserId;
                  // Stale no longer washes the whole row — with most candidates
                  // untouched since yesterday, that made nearly every row the
                  // same amber tint, drowning out the "your case" highlight and
                  // reading as an unintentional color glitch. The "— STALE" text
                  // on Last Activity already carries that signal on its own.
                  const rowBg=c.highlighted?`${T.amber}22`:isOwn?`${T.accent}14`:"transparent";
                  return(
                    <tr key={c.id} onClick={()=>setSelected(c)} style={{cursor:"pointer",background:rowBg}}>
                      <td style={{padding:"6px 4px"}} onClick={e=>{e.stopPropagation();toggleHighlight(c);}} title={c.highlighted?"Unhighlight":"Highlight"}>
                        <span style={{cursor:"pointer",fontSize:14,color:c.highlighted?T.amber:T.border}}>★</span>
                      </td>
                      <td style={{color:T.muted,fontSize:12,padding:"6px 4px"}}>{(pageSafe-1)*pageSize+i+1}</td>
                      <td style={{padding:"6px 4px"}} onClick={e=>e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={()=>toggleSelect(c.id)}/>
                      </td>
                      <td style={{fontWeight:500}}>{c.name}</td>
                      <td style={{fontFamily:"monospace"}}>{c.phone}</td>
                      <td>{processMap[c.process_id]||"—"}</td>
                      <td>{positionMap[c.position_type_id]||"—"}</td>
                      <td style={{overflow:"hidden"}}><span className="badge" style={{background:stage?.is_exit_stage?`${T.purple}22`:`${T.accent}22`,color:stage?.is_exit_stage?T.purple:T.accent,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"inline-block",maxWidth:"100%",verticalAlign:"middle"}}>{stage?.name||"—"}</span></td>
                      <td style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                        {owner?(isOwn?"You":(<>{owner.name||owner.email}{c.pending_reassign_to&&<span style={{marginLeft:6,fontSize:10,color:T.amber,fontWeight:600}}>{c.pending_reassign_to===myUserId?"TRANSFER PENDING — YOU":"TRANSFER PENDING"}</span>}</>)):(
                          ["HR","MANAGER"].includes(role)?<button className="btn btn-sm btn-ghost" onClick={e=>{e.stopPropagation();takeCandidate(c);}}>Take</button>:"Unassigned"
                        )}
                      </td>
                      <td style={{fontSize:12,color:T.muted,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={c.remark||""}>
                        {c.remark||"—"}
                      </td>
                      <td>{summary?.ivrCount||0}x</td>
                      <td style={{fontSize:12,color:stale?T.amber:T.muted}}>
                        {summary?.last?new Date(summary.last).toLocaleDateString("en-IN"):"Never"}{stale&&" — STALE"}
                      </td>
                      <td onClick={e=>e.stopPropagation()}>
                        {c.ivr_next_attempt_at?
                          <span className="badge badge-gray" title={`Scheduled for ${new Date(c.ivr_next_attempt_at).toLocaleString("en-IN")}`}>Scheduled</span>:
                          <button className="btn btn-sm btn-ghost" onClick={()=>sendToIvrSingle(c)} disabled={sendingIvrIds.includes(c.id)}>{sendingIvrIds.includes(c.id)?"...":"📞 Send to IVR"}</button>
                        }
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            )}
          </div>
          {filtered.length>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderTop:`1px solid ${T.border}`,fontSize:12,color:T.muted}}>
              <div>Showing {(pageSafe-1)*pageSize+1}–{Math.min(pageSafe*pageSize,filtered.length)} of {filtered.length}</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button className="btn btn-sm btn-ghost" disabled={pageSafe<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
                <span>Page {pageSafe} of {totalPages}</span>
                <button className="btn btn-sm btn-ghost" disabled={pageSafe>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
              </div>
            </div>
          )}
        </div>
        </>)}
      </div>

      {selected&&(
        <CandidateModal
          candidate={selected} companies={companies} processes={processes} positionTypes={positionTypes}
          leadSources={leadSources} rejectionReasons={rejectionReasons} funnelStages={funnelStages} users={users}
          onClose={()=>setSelected(null)} onChanged={loadAll} showToast={showToast}
        />
      )}

      {showAdd&&(
        <Modal title="Add Candidate" onClose={()=>setShowAdd(false)} actions={<>
          <button className="btn btn-sm btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
          <button className="btn btn-sm" onClick={addCandidate} disabled={adding}>{adding?"Adding...":"Add"}</button>
        </>}>
          <div className="two-col" style={{marginBottom:12}}>
            <div className="field"><label>Name *</label><input value={addForm.name} onChange={e=>setAddForm({...addForm,name:e.target.value})}/></div>
            <div className="field"><label>Phone *</label><input value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} placeholder="10 digits"/></div>
          </div>
          <div className="two-col" style={{marginBottom:12}}>
            <div className="field"><label>Company</label>
              <select value={addForm.company_id} onChange={e=>setAddForm({...addForm,company_id:e.target.value})}>
                <option value="">—</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Process</label>
              <select value={addForm.process_id} onChange={e=>setAddForm({...addForm,process_id:e.target.value})}>
                <option value="">—</option>{processes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="two-col" style={{marginBottom:12}}>
            <div className="field"><label>Position</label>
              <select value={addForm.position_type_id} onChange={e=>setAddForm({...addForm,position_type_id:e.target.value})}>
                <option value="">—</option>{positionTypes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="two-col">
            <div className="field"><label>Source</label>
              <select value={addForm.source_id} onChange={e=>setAddForm({...addForm,source_id:e.target.value})}>
                <option value="">—</option>{leadSources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Assign To</label>
              <select value={addForm.assigned_to} onChange={e=>setAddForm({...addForm,assigned_to:e.target.value})}>
                <option value="">— Unassigned —</option>{assignableUsers.map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}
              </select>
            </div>
          </div>
          <div className="field" style={{marginTop:12}}><label>Languages Spoken</label><input value={addForm.languages_spoken||""} onChange={e=>setAddForm({...addForm,languages_spoken:e.target.value})} placeholder="e.g. Hindi, English"/></div>
        </Modal>
      )}
    </div>
  );
}

// ================================================
// REPORTS (CEO)
// ================================================
function ResizableTh({ col, widths, setWidths, defaultWidth, children, style }) {
  const width=widths[col]||defaultWidth;
  const [hover,setHover]=useState(false);
  const [dragging,setDragging]=useState(false);
  function onMouseDown(e){
    e.preventDefault();
    const startX=e.clientX;
    setDragging(true);
    function onMove(e2){
      const delta=e2.clientX-startX;
      setWidths(w=>({...w,[col]:Math.max(90,width+delta)}));
    }
    function onUp(){
      setDragging(false);
      document.removeEventListener("mousemove",onMove);
      document.removeEventListener("mouseup",onUp);
    }
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseup",onUp);
  }
  const active=hover||dragging;
  return (
    <th style={{...style,width,position:"relative",userSelect:"none"}}>
      {children}
      <span
        onMouseDown={onMouseDown}
        onMouseEnter={()=>setHover(true)}
        onMouseLeave={()=>setHover(false)}
        title="Drag to resize column"
        style={{position:"absolute",right:-4,top:0,bottom:0,width:9,cursor:"col-resize",zIndex:2,display:"flex",justifyContent:"center"}}
      >
        <span style={{width:active?3:1.5,height:"100%",background:active?T.accent:T.border,transition:dragging?"none":"width 0.12s, background 0.12s"}}/>
      </span>
    </th>
  );
}

function MiniBarChart({ data, valueKey, color, colorOf, formatLabel }) {
  const max = Math.max(1, ...data.map(d => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} title={`${formatLabel(d.key)}: ${d[valueKey]}`}>
          <div style={{ fontSize: 10, color: T.muted }}>{d[valueKey] || ""}</div>
          <div style={{ width: "100%", maxWidth: 24, height: 96, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${Math.max(2, (d[valueKey] / max) * 96)}px`, background: colorOf?colorOf(d):color, borderRadius: "4px 4px 0 0" }} />
          </div>
          <div style={{ fontSize: 9, color: T.muted, whiteSpace: "nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>{formatLabel(d.key)}</div>
        </div>
      ))}
    </div>
  );
}


// ================================================
// MAIN APP
// ================================================
// ================================================
// PASSWORD RESET PAGE
// ================================================
function PasswordResetPage({ onDone }) {
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState(false);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];
  const strengthColor = ["",T.red,T.amber,T.amber,T.green][strength];
  const isValid = Object.values(checks).every(Boolean) && password === confirm;

  async function handleReset() {
    if(!isValid) return;
    setLoading(true); setError("");
    try {
      // Demo mode — password reset is disabled. All 5 demo accounts use a
      // fixed password (see the login card); nothing is actually changed.
      await new Promise(r=>setTimeout(r,400));
      setSuccess(true);
      // Ensure session is fully cleared so user must log in fresh
      localStorage.removeItem("sb_session");
      localStorage.removeItem("sb_role");
      setTimeout(() => {
        window.location.hash = "";
        window.location.reload();
      }, 2000);
    } catch(e) {
      setError(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if(success) return (
    <div className="login-wrap">
      <div className="login-box" style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>✓</div>
        <div style={{fontSize:18,fontWeight:700,color:T.green,marginBottom:8}}>Password Updated</div>
        <div style={{color:T.muted,fontSize:13}}>Redirecting to login...</div>
      </div>
    </div>
  );

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div style={{textAlign:"center",marginBottom:8}}><BrandMark/></div>
        <div className="login-sub" style={{textAlign:"center"}}>Set your new password</div>

        <div className="field">
          <label>New Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 characters"/>
          {password && (
            <div style={{marginTop:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:T.muted}}>Password strength</span>
                <span style={{fontSize:11,fontWeight:600,color:strengthColor}}>{strengthLabel}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${strength*25}%`,background:strengthColor,transition:"all 0.3s"}}/>
              </div>
              <div style={{marginTop:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                {[["8+ characters",checks.length],["Uppercase letter",checks.upper],["Number",checks.number],["Special character",checks.special]].map(([l,ok])=>(
                  <div key={l} style={{fontSize:11,color:ok?T.green:T.muted,display:"flex",alignItems:"center",gap:4}}>
                    <span>{ok?"Done":"-"}</span>{l}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat new password"/>
          {confirm && password !== confirm && <div style={{fontSize:12,color:T.red,marginTop:4}}>Passwords do not match</div>}
          {confirm && password === confirm && <div style={{fontSize:12,color:T.green,marginTop:4}}>Passwords match</div>}
        </div>

        <button className="btn btn-full" onClick={handleReset} disabled={!isValid||loading} style={{marginTop:8}}>
          {loading ? "Updating..." : "Set New Password"}
        </button>
        {error && <div className="err">{error}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [session,setSession]=useState(()=>{try{return JSON.parse(localStorage.getItem("sb_session"));}catch{return null;}});
  const CEO_PAGES=["dashboard","openings"];
  const [page,setPage]=useState(()=>{
    const saved=localStorage.getItem("sb_page");
    return getRole()==="CEO"?(CEO_PAGES.includes(saved)?saved:"dashboard"):(saved||"dashboard");
  });
  const [toasts,setToasts]=useState([]);
  const [role,setRole]=useState(()=>getRole());

  useEffect(()=>{
    if(role==="CEO"&&!CEO_PAGES.includes(page)){setPage("dashboard");localStorage.setItem("sb_page","dashboard");}
  },[role]);
  const [isDark,setIsDark]=useState(()=>localStorage.getItem("theme")!=="light");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>localStorage.getItem("sb_sidebar_collapsed")==="1");
  function toggleSidebar(){
    setSidebarCollapsed(v=>{const nv=!v;localStorage.setItem("sb_sidebar_collapsed",nv?"1":"0");return nv;});
  }
  const [isRecovery,setIsRecovery]=useState(()=>{
    const hash = window.location.hash;
    const recovering = hash.includes("type=recovery");
    if(recovering){
      // Clear any existing session — force fresh login after reset
      localStorage.removeItem("sb_session");
      localStorage.removeItem("sb_role");
    }
    return recovering;
  });

  // Apply theme globally
  useEffect(()=>{
    T = isDark ? DARK : LIGHT;
    localStorage.setItem("theme", isDark?"dark":"light");
    // Force re-render by updating CSS
    const styleEl = document.getElementById("hireflow-theme");
    if(styleEl) styleEl.textContent = getThemeCSS(T);
  },[isDark]);

  function showToast(msg,type="info"){setToasts(q=>[...q,{id:Date.now()+Math.random(),msg,type}]);}

  async function handleLogin(s){
    setSession(s);
    setTimeout(()=>setRole(getRole()),100);
  }

  async function handleLogout(){
    await signOut();
    setSession(null);
    setRole("HR");
    localStorage.removeItem("sb_page");
  }

  function toggleTheme(){setIsDark(d=>!d);}

  // Lightweight presence heartbeat — no realtime layer, just a timestamp
  // read elsewhere as "online if updated in the last few minutes".
  useEffect(()=>{
    if(!session)return;
    function ping(){
      dbRpc("update_own_last_seen").catch(()=>{});
    }
    ping();
    const interval=setInterval(ping,60000);
    return()=>clearInterval(interval);
  },[session]);

  if(isRecovery) return (
    <>
      <style id="hireflow-theme">{getThemeCSS(isDark?DARK:LIGHT)}</style>
      <PasswordResetPage onDone={()=>setIsRecovery(false)}/>
    </>
  );

  if(!session) return (
    <>
      <style id="hireflow-theme">{getThemeCSS(isDark?DARK:LIGHT)}</style>
      <LoginPage onLogin={handleLogin}/>
    </>
  );

  const allNav=[
    {id:"dashboard",label:"Dashboard",icon:"▦",roles:["ADMIN","MANAGER","HR","CEO"]},
    {id:"hireflow",label:"Hire Flow",icon:"⬡",roles:["ADMIN","MANAGER","HR"]},
    {id:"openings",label:"Position Openings",icon:"▣",roles:["ADMIN","MANAGER","HR","CEO"]},
    {id:"campaigns",label:"IVR Campaigns",icon:"◔",roles:["ADMIN","MANAGER"]},
    {id:"leads",label:"Leads",icon:"☰",roles:["ADMIN","MANAGER","HR"]},
    {id:"interested",label:"IVR Interested Candidates",icon:"☆",roles:["ADMIN","MANAGER","HR"]},
    {id:"dnd",label:"IVR DND List",icon:"⊘",roles:["ADMIN","MANAGER"]},
    {id:"callerids",label:"IVR Caller IDs",icon:"☎",roles:["ADMIN","MANAGER"]},
    {id:"audio",label:"IVR Audio Manager",icon:"♪",roles:["ADMIN","MANAGER"]},
    {id:"logs",label:"IVR Call Logs",icon:"▤",roles:["ADMIN","MANAGER","HR"]},
    {id:"hireflow-settings",label:"Settings",icon:"⚙",roles:["ADMIN","MANAGER"]},
    {id:"users",label:"Users",icon:"◉",roles:["ADMIN"]},
  ];

  const nav=allNav.filter(n=>n.roles.includes(role));
  const roleColor={ADMIN:"#EF4444",MANAGER:"#3B7AF8",HR:"#10B981",CEO:"#7238C9"};
  const roleLabel={ADMIN:"Admin",MANAGER:"HR Manager",HR:"HR",CEO:"CEO"};
  const T_cur = isDark ? DARK : LIGHT;

  return(
    <>
      <style id="hireflow-theme">{getThemeCSS(T_cur)}</style>
      <div className="app">
        <button className="sidebar-toggle" style={{left:sidebarCollapsed?14:186}} onClick={toggleSidebar} title={sidebarCollapsed?"Show sidebar":"Hide sidebar"}>{sidebarCollapsed?"»":"«"}</button>
        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarCollapsed?"collapsed":""}`}>
          <div className="sidebar-header">
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"nowrap"}}>
              <BrandMark size={24}/>
              <span className="badge badge-amber" style={{fontSize:9}}>DEMO</span>
            </div>
          </div>
          <nav className="nav">
            <div className="nav-section">Menu</div>
            {nav.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>{setPage(n.id);localStorage.setItem("sb_page",n.id);}}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-name">{getRoleName()}</div>
              <div className="user-email">{session?.user?.email}</div>
              <div style={{marginTop:6}}>
                <span className="badge" style={{background:`${roleColor[role]||"#718096"}22`,color:roleColor[role]||"#718096",fontSize:10}}>
                  {roleLabel[role]||role}
                </span>
              </div>
            </div>
            <button className="theme-toggle btn-full" style={{marginBottom:8,width:"100%",justifyContent:"center"}} onClick={toggleTheme}>
              {isDark?"Light Mode":"Dark Mode"}
            </button>
            <button className="btn btn-sm btn-ghost btn-full" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main">
          {page==="dashboard"&&<Dashboard showToast={showToast} role={role}/>}
          {page==="campaigns"&&["ADMIN","MANAGER"].includes(role)&&<Campaigns showToast={showToast}/>}
          {page==="leads"&&role!=="CEO"&&<Leads showToast={showToast}/>}
          {page==="interested"&&role!=="CEO"&&<InterestedCandidates showToast={showToast}/>}
          {page==="hireflow"&&role!=="CEO"&&<HireFlowCandidates showToast={showToast}/>}
          {page==="hireflow-settings"&&["ADMIN","MANAGER"].includes(role)&&<HireFlowSettings showToast={showToast}/>}
          {page==="dnd"&&["ADMIN","MANAGER"].includes(role)&&<DndList showToast={showToast}/>}
          {page==="callerids"&&["ADMIN","MANAGER"].includes(role)&&<CallerIds showToast={showToast}/>}
          {page==="audio"&&["ADMIN","MANAGER"].includes(role)&&<AudioManager showToast={showToast}/>}
          {page==="logs"&&role!=="CEO"&&<CallLogs showToast={showToast}/>}
          {page==="users"&&role==="ADMIN"&&<UserManagement showToast={showToast}/>}
          {page==="openings"&&["ADMIN","MANAGER","HR","CEO"].includes(role)&&<PositionOpenings showToast={showToast}/>}
        </div>
      </div>
      {toasts[0]&&<Toast key={toasts[0].id} msg={toasts[0].msg} type={toasts[0].type} onClose={()=>setToasts(q=>q.slice(1))}/>}
    </>
  );
}

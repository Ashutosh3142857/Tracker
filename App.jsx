import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0b0e",
  surface: "#12141a",
  card: "#181b23",
  border: "#252836",
  accent: "#f59e0b",
  accentDim: "#92400e",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  muted: "#6b7280",
  text: "#e5e7eb",
  textDim: "#9ca3af",
};

const TABS = ["Tasks", "Time", "Meetings", "Goals"];

const STATUS_COLORS = {
  "Not Started": COLORS.muted,
  "In Progress": COLORS.blue,
  Done: COLORS.green,
  Blocked: COLORS.red,
};

const PRIORITY_COLORS = {
  High: COLORS.red,
  Medium: COLORS.accent,
  Low: COLORS.green,
};

function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      fontFamily: "monospace",
      fontWeight: 600,
      letterSpacing: 1,
    }}>{label}</span>
  );
}

function AIButton({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      background: loading ? COLORS.accentDim : `linear-gradient(135deg, ${COLORS.accent}, #d97706)`,
      color: "#000",
      border: "none",
      borderRadius: 6,
      padding: "6px 14px",
      fontSize: 12,
      fontWeight: 700,
      cursor: loading ? "wait" : "pointer",
      display: "flex", alignItems: "center", gap: 6,
      fontFamily: "monospace",
      letterSpacing: 0.5,
      transition: "all 0.2s",
      boxShadow: loading ? "none" : `0 0 12px ${COLORS.accent}44`,
    }}>
      {loading ? "⚙ Thinking..." : "✦ AI Fill"}
    </button>
  );
}

// ─── TASKS TAB ─────────────────────────────────────────────────────────────
function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design new onboarding flow", priority: "High", status: "In Progress", deadline: "2026-03-25", owner: "Alex" },
    { id: 2, title: "Q1 financial report", priority: "High", status: "Not Started", deadline: "2026-03-28", owner: "Sam" },
    { id: 3, title: "Update API documentation", priority: "Low", status: "Done", deadline: "2026-03-20", owner: "Jordan" },
  ]);
  const [form, setForm] = useState({ title: "", priority: "Medium", status: "Not Started", deadline: "", owner: "" });
  const [loading, setLoading] = useState(false);

  const aiFill = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY_HERE",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a smart work tracker assistant. Given a task title, return ONLY a valid JSON object (no markdown) with these fields:
- priority: "High" | "Medium" | "Low"
- status: "Not Started" | "In Progress" | "Done" | "Blocked"
- deadline: a realistic deadline date in YYYY-MM-DD format (within next 2 weeks from today March 22, 2026)
- owner: a realistic first name
- title: cleaned-up version of the task title

Task: "${form.title}"`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) {}
    setLoading(false);
  };

  const add = () => {
    if (!form.title) return;
    setTasks(t => [...t, { ...form, id: Date.now() }]);
    setForm({ title: "", priority: "Medium", status: "Not Started", deadline: "", owner: "" });
  };

  const updateStatus = (id, status) => setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  const remove = (id) => setTasks(ts => ts.filter(t => t.id !== id));

  const counts = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "Done").length,
    blocked: tasks.filter(t => t.status === "Blocked").length,
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "TOTAL", value: counts.total, color: COLORS.blue },
          { label: "DONE", value: counts.done, color: COLORS.green },
          { label: "BLOCKED", value: counts.blocked, color: COLORS.red },
        ].map(s => (
          <div key={s.label} style={{ background: COLORS.card, border: `1px solid ${s.color}33`, borderRadius: 8, padding: "14px 18px" }}>
            <div style={{ color: s.color, fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>+ NEW TASK</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Task title..."
            style={{ flex: "1 1 200px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 12px", color: COLORS.text, fontSize: 13 }} />
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }}>
            {["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
          </select>
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
            placeholder="Owner"
            style={{ width: 100, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <AIButton onClick={aiFill} loading={loading} />
          <button onClick={add} style={{ background: COLORS.green, color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Add</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || COLORS.muted}`,
            transition: "all 0.2s",
          }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ color: task.status === "Done" ? COLORS.muted : COLORS.text, fontSize: 14, fontWeight: 600,
                textDecoration: task.status === "Done" ? "line-through" : "none" }}>{task.title}</div>
              <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>
                {task.owner && `👤 ${task.owner}`} {task.deadline && `· 📅 ${task.deadline}`}
              </div>
            </div>
            <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]} />
            <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
              style={{ background: STATUS_COLORS[task.status] + "22", border: `1px solid ${STATUS_COLORS[task.status]}44`,
                color: STATUS_COLORS[task.status], borderRadius: 4, padding: "4px 8px", fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>
              {Object.keys(STATUS_COLORS).map(s => <option key={s} style={{ background: COLORS.surface, color: COLORS.text }}>{s}</option>)}
            </select>
            <button onClick={() => remove(task.id)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TIME TAB ───────────────────────────────────────────────────────────────
function TimeTab() {
  const [entries, setEntries] = useState([
    { id: 1, task: "Design review", project: "Onboarding", hours: 2.5, date: "2026-03-22" },
    { id: 2, task: "Bug fixes", project: "Backend", hours: 3, date: "2026-03-21" },
    { id: 3, task: "Client call", project: "Sales", hours: 1, date: "2026-03-21" },
  ]);
  const [form, setForm] = useState({ task: "", project: "", hours: "", date: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const stopTimer = () => {
    setRunning(false);
    const h = (elapsed / 3600).toFixed(2);
    setForm(f => ({ ...f, hours: h }));
    setElapsed(0);
  };

  const aiFill = async () => {
    if (!form.task) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY_HERE",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Return ONLY valid JSON (no markdown) for a time entry:
- task: cleaned title
- project: likely project name based on task
- hours: realistic hours (number, 0.5–4)
- date: "${form.date}"
Task: "${form.task}"`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) {}
    setLoading(false);
  };

  const add = () => {
    if (!form.task) return;
    setEntries(e => [...e, { ...form, hours: parseFloat(form.hours) || 0, id: Date.now() }]);
    setForm(f => ({ ...f, task: "", project: "", hours: "" }));
  };

  const totalHours = entries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0);
  const byProject = entries.reduce((acc, e) => {
    acc[e.project] = (acc[e.project] || 0) + parseFloat(e.hours);
    return acc;
  }, {});

  const fmt = s => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "00")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.green}33`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: COLORS.green, fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>TOTAL HOURS</div>
          <div style={{ color: COLORS.green, fontSize: 32, fontWeight: 800 }}>{totalHours.toFixed(1)}h</div>
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.accent}33`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: COLORS.accent, fontSize: 11, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>LIVE TIMER</div>
          <div style={{ color: COLORS.accent, fontSize: 24, fontWeight: 800, fontFamily: "monospace" }}>{fmt(elapsed)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setRunning(r => !r)} style={{
              background: running ? COLORS.accentDim : COLORS.accent, color: "#000", border: "none", borderRadius: 5,
              padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>{running ? "⏸ Pause" : "▶ Start"}</button>
            {elapsed > 0 && <button onClick={stopTimer} style={{
              background: COLORS.green, color: "#000", border: "none", borderRadius: 5,
              padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>✓ Log</button>}
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>+ LOG TIME</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} placeholder="What did you work on?"
            style={{ flex: "1 1 180px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 12px", color: COLORS.text, fontSize: 13 }} />
          <input value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} placeholder="Project"
            style={{ width: 120, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <input type="number" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="Hrs"
            step="0.5" style={{ width: 70, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <AIButton onClick={aiFill} loading={loading} />
          <button onClick={add} style={{ background: COLORS.green, color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Log</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>RECENT ENTRIES</div>
          {entries.map(e => (
            <div key={e.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{e.task}</div>
                <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "monospace" }}>{e.project} · {e.date}</div>
              </div>
              <div style={{ color: COLORS.green, fontSize: 16, fontWeight: 800, fontFamily: "monospace" }}>{e.hours}h</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>BY PROJECT</div>
          {Object.entries(byProject).map(([proj, hrs]) => (
            <div key={proj} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: COLORS.textDim, fontSize: 12 }}>{proj}</span>
                <span style={{ color: COLORS.text, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{hrs.toFixed(1)}h</span>
              </div>
              <div style={{ background: COLORS.surface, borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.purple})`, height: "100%", width: `${Math.min(100, (hrs / totalHours) * 100)}%`, borderRadius: 4, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MEETINGS TAB ───────────────────────────────────────────────────────────
function MeetingsTab() {
  const [meetings, setMeetings] = useState([
    { id: 1, title: "Sprint Planning", date: "2026-03-22", attendees: "Team", actions: ["Finalize roadmap by Friday", "Alex to share design assets"], summary: "Discussed Q2 priorities and sprint goals." },
  ]);
  const [form, setForm] = useState({ title: "", date: new Date().toISOString().split("T")[0], attendees: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const aiFill = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY_HERE",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Return ONLY valid JSON (no markdown) for a meeting record:
- title: cleaned meeting title
- summary: 1-sentence summary of what was likely discussed
- actions: array of 2-3 realistic action items (strings)
- attendees: realistic team description
- date: "${form.date}"
${form.notes ? `Notes context: ${form.notes}` : ""}
Meeting: "${form.title}"`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(f => ({ ...f, ...parsed, notes: f.notes }));
    } catch (e) {}
    setLoading(false);
  };

  const add = () => {
    if (!form.title) return;
    setMeetings(m => [...m, { ...form, actions: form.actions || [], id: Date.now() }]);
    setForm({ title: "", date: new Date().toISOString().split("T")[0], attendees: "", notes: "" });
  };

  return (
    <div>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>+ LOG MEETING</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Meeting title..."
            style={{ flex: "1 1 180px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 12px", color: COLORS.text, fontSize: 13 }} />
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <input value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="Attendees"
            style={{ width: 130, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
        </div>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Paste raw meeting notes here (optional, AI will extract action items)..."
          style={{ width: "100%", marginTop: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 12px", color: COLORS.text, fontSize: 12, minHeight: 70, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <AIButton onClick={aiFill} loading={loading} />
          <button onClick={add} style={{ background: COLORS.green, color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Save</button>
        </div>
      </div>

      {meetings.map(m => (
        <div key={m.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
          <div onClick={() => setExpanded(expanded === m.id ? null : m.id)}
            style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div>
              <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{m.title}</div>
              <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>📅 {m.date} · 👥 {m.attendees}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge label={`${(m.actions || []).length} actions`} color={COLORS.purple} />
              <span style={{ color: COLORS.muted, fontSize: 18 }}>{expanded === m.id ? "▴" : "▾"}</span>
            </div>
          </div>
          {expanded === m.id && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 16px" }}>
              {m.summary && <p style={{ color: COLORS.textDim, fontSize: 13, margin: "0 0 12px" }}>{m.summary}</p>}
              <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>ACTION ITEMS</div>
              {(m.actions || []).map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: COLORS.accent, fontFamily: "monospace", fontSize: 12, marginTop: 1 }}>→</span>
                  <span style={{ color: COLORS.text, fontSize: 13 }}>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── GOALS TAB ──────────────────────────────────────────────────────────────
function GoalsTab() {
  const [goals, setGoals] = useState([
    { id: 1, title: "Launch new product feature", keyResults: ["Ship MVP", "100 beta users", "NPS > 8"], progress: [80, 30, 0], deadline: "2026-06-30", status: "In Progress" },
    { id: 2, title: "Improve team velocity by 20%", keyResults: ["Reduce blockers", "Ship 15 stories/sprint"], progress: [60, 50], deadline: "2026-03-31", status: "In Progress" },
  ]);
  const [form, setForm] = useState({ title: "", deadline: "", krText: "" });
  const [loading, setLoading] = useState(false);

  const aiFill = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY_HERE",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Return ONLY valid JSON (no markdown) for an OKR goal:
- title: refined goal title
- keyResults: array of 3 specific, measurable key results (strings)
- deadline: realistic date in YYYY-MM-DD (within 3 months of March 22, 2026)
- status: "In Progress"
Goal: "${form.title}"`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) {}
    setLoading(false);
  };

  const add = () => {
    if (!form.title) return;
    const krs = form.krText ? form.krText.split("\n").filter(Boolean) : form.keyResults || [];
    setGoals(g => [...g, { ...form, keyResults: krs, progress: krs.map(() => 0), id: Date.now() }]);
    setForm({ title: "", deadline: "", krText: "" });
  };

  const updateProgress = (goalId, krIdx, val) => {
    setGoals(gs => gs.map(g => {
      if (g.id !== goalId) return g;
      const p = [...g.progress];
      p[krIdx] = Number(val);
      return { ...g, progress: p };
    }));
  };

  return (
    <div>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>+ NEW GOAL / OKR</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Objective / Goal..."
            style={{ flex: "1 1 200px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 12px", color: COLORS.text, fontSize: 13 }} />
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 13 }} />
          <AIButton onClick={aiFill} loading={loading} />
          <button onClick={add} style={{ background: COLORS.green, color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Add</button>
        </div>
        {form.keyResults && (
          <div style={{ marginTop: 10, padding: "10px 12px", background: COLORS.surface, borderRadius: 6, border: `1px solid ${COLORS.purple}33` }}>
            <div style={{ fontSize: 11, color: COLORS.purple, fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>AI SUGGESTED KEY RESULTS</div>
            {(form.keyResults || []).map((kr, i) => <div key={i} style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 3 }}>→ {kr}</div>)}
          </div>
        )}
      </div>

      {goals.map(goal => {
        const avgProgress = goal.progress.length ? goal.progress.reduce((a, b) => a + b, 0) / goal.progress.length : 0;
        return (
          <div key={goal.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>{goal.title}</div>
                {goal.deadline && <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>📅 {goal.deadline}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: avgProgress >= 70 ? COLORS.green : avgProgress >= 30 ? COLORS.accent : COLORS.red, fontSize: 22, fontWeight: 800, fontFamily: "monospace" }}>{Math.round(avgProgress)}%</div>
                <div style={{ color: COLORS.muted, fontSize: 10, fontFamily: "monospace" }}>OVERALL</div>
              </div>
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 4, height: 6, marginBottom: 14 }}>
              <div style={{
                background: `linear-gradient(90deg, ${avgProgress >= 70 ? COLORS.green : COLORS.accent}, ${COLORS.purple})`,
                height: "100%", width: `${avgProgress}%`, borderRadius: 4, transition: "width 0.5s"
              }} />
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>KEY RESULTS</div>
            {goal.keyResults.map((kr, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, color: COLORS.textDim, fontSize: 13 }}>→ {kr}</div>
                <input type="range" min={0} max={100} value={goal.progress[i] || 0}
                  onChange={e => updateProgress(goal.id, i, e.target.value)}
                  style={{ width: 100, accentColor: COLORS.accent }} />
                <span style={{ color: COLORS.accent, fontFamily: "monospace", fontSize: 12, minWidth: 35 }}>{goal.progress[i] || 0}%</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Tasks");

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea { outline: none; color-scheme: dark; }
        input[type=range] { cursor: pointer; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tab-content { animation: fadeIn 0.25s ease; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${COLORS.border}`, padding: "18px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `linear-gradient(180deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%)`
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 8px ${COLORS.accent}` }} />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: COLORS.text }}>WorkOS</span>
            <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace", letterSpacing: 2, paddingLeft: 4 }}>TRACKER</span>
          </div>
          <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "monospace", marginTop: 3 }}>
            ✦ AI-POWERED · MARCH 22, 2026
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? COLORS.accent + "22" : "none",
              border: tab === t ? `1px solid ${COLORS.accent}55` : `1px solid transparent`,
              color: tab === t ? COLORS.accent : COLORS.muted,
              borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12,
              fontFamily: "monospace", fontWeight: 600, letterSpacing: 1, transition: "all 0.15s",
            }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ width: "100%", padding: "28px 32px" }} className="tab-content" key={tab}>
        {tab === "Tasks" && <TasksTab />}
        {tab === "Time" && <TimeTab />}
        {tab === "Meetings" && <MeetingsTab />}
        {tab === "Goals" && <GoalsTab />}
      </div>
    </div>
  );
}

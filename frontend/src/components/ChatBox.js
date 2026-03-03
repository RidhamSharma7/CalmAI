import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

// ── Breathing exercise configs ──
const BREATH_EXERCISES = [
  {
    id: "box",
    name: "Box Breathing",
    desc: "Balance & focus",
    icon: "⬜",
    phases: ["Inhale", "Hold", "Exhale", "Hold"],
    durations: [4, 4, 4, 4],
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.45)",
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    desc: "Deep calm",
    icon: "🌙",
    phases: ["Inhale", "Hold", "Exhale"],
    durations: [4, 7, 8],
    color: "#67e8f9",
    glow: "rgba(103,232,249,0.45)",
  },
  {
    id: "calm",
    name: "Calm Breath",
    desc: "Quick relief",
    icon: "🌸",
    phases: ["Inhale", "Exhale"],
    durations: [4, 6],
    color: "#f9a8d4",
    glow: "rgba(249,168,212,0.45)",
  },
];

const GROUNDING = [
  { n: 5, sense: "See",   icon: "👁️", prompt: "Name 5 things you can see right now",          color: "#a78bfa" },
  { n: 4, sense: "Touch", icon: "✋", prompt: "Notice 4 things you can physically feel",       color: "#67e8f9" },
  { n: 3, sense: "Hear",  icon: "👂", prompt: "Listen for 3 sounds around you",                color: "#6ee7b7" },
  { n: 2, sense: "Smell", icon: "👃", prompt: "Find 2 things you can smell",                   color: "#fcd34d" },
  { n: 1, sense: "Taste", icon: "👅", prompt: "Notice 1 thing you can taste",                  color: "#f9a8d4" },
];

const QUICK_PROMPTS = [
  "I feel overwhelmed right now",
  "Help me calm my thoughts",
  "I'm having a panic attack",
  "I need grounding support",
  "I can't stop worrying",
];

export default function ChatBox() {
  const [tab, setTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Breathing state
  const [selectedExercise, setSelectedExercise] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const breathRef = useRef(null);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingStarted, setGroundingStarted] = useState(false);
  const [groundingDone, setGroundingDone] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (!breathActive) return;
    const ex = BREATH_EXERCISES[selectedExercise];
    breathRef.current = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          setBreathPhase((p) => {
            const next = (p + 1) % ex.phases.length;
            if (next === 0) setBreathCycles((c) => c + 1);
            setBreathTimer(ex.durations[next]);
            return next;
          });
          return ex.durations[0];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(breathRef.current);
  }, [breathActive, selectedExercise]);

  const startBreath = () => {
    const ex = BREATH_EXERCISES[selectedExercise];
    setBreathPhase(0); setBreathTimer(ex.durations[0]); setBreathCycles(0);
    setBreathActive(true);
  };
  const stopBreath = () => {
    setBreathActive(false); clearInterval(breathRef.current);
    setBreathPhase(0); setBreathCycles(0);
  };
  const selectExercise = (i) => { if (breathActive) stopBreath(); setSelectedExercise(i); };

  const startGrounding  = () => { setGroundingStep(0); setGroundingStarted(true); setGroundingDone(false); };
  const nextGrounding   = () => { if (groundingStep >= GROUNDING.length - 1) setGroundingDone(true); else setGroundingStep((s) => s + 1); };
  const resetGrounding  = () => { setGroundingStarted(false); setGroundingDone(false); setGroundingStep(0); };

  const handleSend = async (overrideText) => {
    const text = overrideText || message;
    if (!text.trim() || loading) return;
    setMessage(""); setLoading(true);
    setChat((prev) => [...prev, { sender: "user", text }]);
    try {
      const response = await axios.post(`${API}/chat`, { user_id: "test123", message: text });
      setChat((prev) => [...prev, { sender: "bot", text: response.data.response }]);
    } catch (error) {
      console.log("AXIOS ERROR:", error);
      setChat((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  const ex = BREATH_EXERCISES[selectedExercise];
  const isInhale  = breathPhase === 0;
  const isExhale  = ex.phases[breathPhase] === "Exhale";
  const circleScale = breathActive ? (isExhale ? 0.95 : 1.42) : 1.0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:          #0c0820;
          --lavender:    #c4b5fd;
          --lav-dim:     #a78bfa;
          --rose:        #fda4af;
          --sage:        #86efac;
          --sky:         #7dd3fc;
          --text:        #ede9fe;
          --muted:       #9b8ec4;
          --glass:       rgba(18,10,42,0.78);
          --edge:        rgba(196,181,253,0.14);
          --card-shadow: 0 40px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(196,181,253,0.07);
        }

        body { background: var(--bg); }

        .sr-wrap {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background:
            radial-gradient(ellipse 80% 60% at 15% 10%, #2e1065 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 90%, #0f172a 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, #1e0a3c 0%, transparent 70%),
            #0c0820;
          font-family: 'Nunito', sans-serif;
          padding: 16px;
          position: relative; overflow: hidden;
        }

        /* Stars */
        .stars {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 8%  12%, rgba(255,255,255,.3)  0%, transparent 100%),
            radial-gradient(1px 1px at 25% 38%, rgba(255,255,255,.2)  0%, transparent 100%),
            radial-gradient(1px 1px at 52% 18%, rgba(255,255,255,.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 55%, rgba(255,255,255,.2)  0%, transparent 100%),
            radial-gradient(1px 1px at 88% 8%,  rgba(255,255,255,.3)  0%, transparent 100%),
            radial-gradient(1px 1px at 18% 72%, rgba(255,255,255,.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 42% 88%, rgba(255,255,255,.2)  0%, transparent 100%),
            radial-gradient(1px 1px at 83% 32%, rgba(255,255,255,.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 75%, rgba(255,255,255,.18) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 60%, rgba(255,255,255,.22) 0%, transparent 100%);
        }

        /* Ambient orbs */
        .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .o1 { width:550px;height:550px;background:#3b1f7a;opacity:.22;top:-180px;left:-180px;animation:oA 22s ease-in-out infinite alternate; }
        .o2 { width:450px;height:450px;background:#1e0a4e;opacity:.28;bottom:-140px;right:-140px;animation:oB 28s ease-in-out infinite alternate; }
        .o3 { width:320px;height:320px;background:#7c3aed;opacity:.1; top:38%;left:58%;animation:oC 20s ease-in-out infinite alternate; }
        .o4 { width:220px;height:220px;background:#be185d;opacity:.08;top:18%;right:18%;animation:oD 26s ease-in-out infinite alternate; }
        .o5 { width:280px;height:280px;background:#0369a1;opacity:.1; bottom:18%;left:12%;animation:oE 18s ease-in-out infinite alternate; }
        @keyframes oA{to{transform:translate(80px,100px)}}
        @keyframes oB{to{transform:translate(-70px,-80px)}}
        @keyframes oC{to{transform:translate(60px,70px) scale(1.15)}}
        @keyframes oD{to{transform:translate(-50px,60px)}}
        @keyframes oE{to{transform:translate(50px,-60px)}}

        /* Card */
        .sr-card {
          position:relative; z-index:1;
          width:100%; max-width:760px;
          background: var(--glass);
          backdrop-filter: blur(36px) saturate(160%);
          border: 1px solid var(--edge);
          border-radius: 34px;
          box-shadow: var(--card-shadow);
          display: flex; flex-direction: column;
          overflow: hidden;
          animation: cardIn .65s cubic-bezier(.22,.68,0,1.15) forwards;
        }
        @keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}

        /* Header */
        .sr-header {
          padding: 24px 28px 0;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .sr-brand { display:flex; align-items:center; gap:14px; }
        .sr-logo {
          width:48px;height:48px; border-radius:50%;
          background: linear-gradient(135deg,#c4b5fd,#7c3aed);
          display:flex; align-items:center; justify-content:center; font-size:22px;
          box-shadow: 0 0 28px rgba(167,139,250,.55), 0 0 70px rgba(124,58,237,.25);
          animation: logoPulse 4s ease-in-out infinite; flex-shrink:0;
        }
        @keyframes logoPulse{0%,100%{box-shadow:0 0 28px rgba(167,139,250,.55),0 0 70px rgba(124,58,237,.25)}50%{box-shadow:0 0 44px rgba(167,139,250,.85),0 0 100px rgba(124,58,237,.4)}}
        .sr-appname { font-family:'Lora',serif; font-size:26px; font-weight:600; color:var(--text); letter-spacing:.04em; }
        .sr-tagline { font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--lav-dim); margin-top:2px; }
        .sr-badge {
          font-size:11.5px; padding:6px 16px; border-radius:20px;
          border:1px solid rgba(196,181,253,.22); color:var(--lavender);
          background:rgba(196,181,253,.08); letter-spacing:.06em; transition:all .3s;
        }
        .sr-badge.thinking { color:var(--muted); border-color:rgba(255,255,255,.1); background:rgba(255,255,255,.04); }

        /* Tabs */
        .sr-tabs { padding:18px 28px 0; display:flex; gap:7px; flex-shrink:0; }
        .sr-tab {
          padding:10px 22px; border-radius:22px; border:none;
          font-family:'Nunito',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:all .3s; letter-spacing:.04em;
          display:flex; align-items:center; gap:7px;
        }
        .sr-tab.off { background:rgba(255,255,255,.04); color:var(--muted); border:1px solid rgba(255,255,255,.07); }
        .sr-tab.off:hover { background:rgba(196,181,253,.08); color:var(--lavender); border-color:rgba(196,181,253,.2); }
        .sr-tab.on {
          background:linear-gradient(135deg,rgba(167,139,250,.28),rgba(124,58,237,.28));
          color:var(--lavender); border:1px solid rgba(196,181,253,.38);
          box-shadow:0 0 22px rgba(167,139,250,.2);
        }
        .sep { height:1px; background:rgba(196,181,253,.08); margin:16px 28px 0; flex-shrink:0; }

        /* ─── CHAT ─── */
        .sr-messages {
          height:560px; overflow-y:auto;
          padding:22px 24px; display:flex; flex-direction:column; gap:14px;
          scroll-behavior:smooth;
        }
        .sr-messages::-webkit-scrollbar{width:3px}
        .sr-messages::-webkit-scrollbar-thumb{background:rgba(196,181,253,.2);border-radius:4px}

        .sr-empty {
          flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:14px; padding:50px 0; animation:fadeUp .5s ease;
        }
        .sr-empty-glyph { font-size:52px; animation:floatG 4s ease-in-out infinite; }
        @keyframes floatG{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .sr-empty-title { font-family:'Lora',serif; font-size:22px; font-style:italic; color:rgba(196,181,253,.6); text-align:center; }
        .sr-empty-sub { font-size:14px; color:var(--muted); text-align:center; line-height:1.7; max-width:360px; }

        .msg-row { display:flex; gap:10px; align-items:flex-end; animation:fadeUp .38s ease forwards; opacity:0; }
        .msg-row.user { flex-direction:row-reverse; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        .msg-av {
          width:32px;height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#c4b5fd,#7c3aed);
          display:flex; align-items:center; justify-content:center; font-size:14px;
          box-shadow:0 0 14px rgba(167,139,250,.38);
        }
        .msg-bub { max-width:74%; padding:13px 18px; font-size:14.5px; line-height:1.78; white-space:pre-wrap; word-break:break-word; }
        .msg-bub.bot {
          background:rgba(196,181,253,.07); border:1px solid rgba(196,181,253,.1);
          border-radius:22px 22px 22px 5px; color:#ddd6fe;
        }
        .msg-bub.user {
          background:linear-gradient(135deg,rgba(124,58,237,.35),rgba(190,24,93,.2));
          border:1px solid rgba(196,181,253,.22);
          border-radius:22px 22px 5px 22px; color:#f5f3ff;
        }

        .typing-row { display:flex; gap:10px; align-items:flex-end; animation:fadeUp .38s ease forwards; opacity:0; }
        .typing-bub {
          display:flex; gap:5px; align-items:center; padding:14px 20px;
          background:rgba(196,181,253,.07); border:1px solid rgba(196,181,253,.1);
          border-radius:22px 22px 22px 5px;
        }
        .td { width:7px;height:7px;border-radius:50%;background:var(--lav-dim); }
        .td:nth-child(1){animation:tdB 1.4s infinite}
        .td:nth-child(2){animation:tdB 1.4s .2s infinite}
        .td:nth-child(3){animation:tdB 1.4s .4s infinite}
        @keyframes tdB{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}

        .sr-prompts { padding:4px 24px 14px; display:flex; gap:8px; flex-wrap:wrap; }
        .qpill {
          background:rgba(196,181,253,.05); border:1px solid rgba(196,181,253,.14);
          color:rgba(196,181,253,.6); border-radius:20px;
          padding:6px 15px; font-size:12.5px; font-family:'Nunito',sans-serif;
          cursor:pointer; transition:all .25s;
        }
        .qpill:hover { background:rgba(196,181,253,.12); border-color:rgba(196,181,253,.35); color:var(--lavender); }

        .sr-inputbar {
          padding:15px 20px; border-top:1px solid rgba(196,181,253,.08);
          background:rgba(0,0,0,.22); display:flex; gap:10px; align-items:center; flex-shrink:0;
        }
        .sr-input {
          flex:1; background:rgba(196,181,253,.06); border:1px solid rgba(196,181,253,.18);
          border-radius:18px; padding:13px 17px; color:var(--text);
          font-size:14.5px; font-family:'Nunito',sans-serif;
          transition:border-color .3s; caret-color:var(--lavender);
        }
        .sr-input::placeholder { color:rgba(155,142,196,.4); }
        .sr-input:focus { outline:none; border-color:rgba(196,181,253,.45); }
        .sr-send {
          width:48px;height:48px; border-radius:50%; border:none; flex-shrink:0;
          background:linear-gradient(135deg,#c4b5fd,#7c3aed);
          color:#1a0a3e; font-size:22px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all .3s; box-shadow:0 0 22px rgba(167,139,250,.42);
        }
        .sr-send:hover:not(:disabled){transform:scale(1.1);box-shadow:0 0 36px rgba(167,139,250,.68)}
        .sr-send:disabled{background:rgba(167,139,250,.15);color:#5b4d8a;cursor:not-allowed;box-shadow:none}

        /* ─── BREATHE ─── */
        .breath-tab { padding:24px; display:flex; flex-direction:column; gap:20px; }
        .ex-selector { display:flex; gap:10px; }
        .ex-card {
          flex:1; padding:16px 10px; border-radius:18px;
          border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03);
          cursor:pointer; text-align:center; transition:all .3s;
          display:flex; flex-direction:column; gap:5px; align-items:center;
        }
        .ex-card.sel { border-color:rgba(196,181,253,.4); background:rgba(196,181,253,.1); }
        .ex-icon { font-size:24px; }
        .ex-name { font-size:12.5px; font-weight:600; color:var(--text); letter-spacing:.03em; }
        .ex-desc { font-size:11px; color:var(--muted); }

        .breath-arena {
          display:flex; flex-direction:column; align-items:center; gap:20px; padding:8px 0;
        }
        .breath-ring-outer {
          position:relative; width:260px;height:260px;
          display:flex; align-items:center; justify-content:center;
        }
        .ripple {
          position:absolute; border-radius:50%; border:1.5px solid;
          width:100%;height:100%; opacity:0;
          animation:ripOut 3s ease-out infinite;
        }
        .rp2 { animation-delay:.9s; }
        .rp3 { animation-delay:1.8s; }
        @keyframes ripOut{0%{transform:scale(.75);opacity:.55}100%{transform:scale(1.55);opacity:0}}

        .breath-circle {
          width:195px;height:195px; border-radius:50%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          position:relative; z-index:1;
          transition:transform 1s cubic-bezier(.4,0,.2,1), box-shadow 1s ease, border-color 1s ease, background .8s ease;
        }
        .breath-phase-lbl { font-family:'Lora',serif; font-size:20px; font-weight:500; letter-spacing:.06em; }
        .breath-num       { font-family:'Lora',serif; font-size:54px; font-weight:600; line-height:1; letter-spacing:-.02em; }
        .breath-cycles-lbl { font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }

        .phase-chips { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
        .pchip {
          padding:5px 15px; border-radius:20px; font-size:11.5px; letter-spacing:.05em;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
          color:var(--muted); transition:all .4s;
        }
        .pchip.on { background:rgba(196,181,253,.2); border-color:rgba(196,181,253,.45); color:var(--lavender); }

        .breath-prog { width:100%;height:3px; background:rgba(255,255,255,.06); border-radius:4px; overflow:hidden; }
        .breath-prog-fill { height:100%; border-radius:4px; transition:width 1s linear; }

        .btn-begin {
          border:none; color:#1a0a3e; border-radius:28px;
          padding:13px 40px; font-size:15px; font-family:'Nunito',sans-serif;
          font-weight:600; cursor:pointer; transition:all .3s; letter-spacing:.04em;
        }
        .btn-begin:hover{transform:scale(1.05)}
        .btn-stop {
          background:rgba(253,164,175,.1); border:1px solid rgba(253,164,175,.3);
          color:#fda4af; border-radius:28px;
          padding:13px 40px; font-size:15px; font-family:'Nunito',sans-serif;
          font-weight:600; cursor:pointer; transition:all .3s;
        }
        .btn-stop:hover{background:rgba(253,164,175,.18)}

        /* ─── GROUNDING ─── */
        .ground-tab { padding:26px 24px; display:flex; flex-direction:column; gap:20px; }
        .ground-intro { text-align:center; display:flex; flex-direction:column; gap:12px; align-items:center; }
        .ground-title { font-family:'Lora',serif; font-size:23px; font-weight:500; color:var(--text); }
        .ground-sub { font-size:14px; color:var(--muted); line-height:1.7; max-width:400px; }

        .ground-steps { display:flex; flex-direction:column; gap:10px; }
        .gstep {
          padding:15px 18px; border-radius:18px;
          border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.03);
          display:flex; align-items:center; gap:14px; transition:all .4s;
        }
        .gstep.cur {
          border-color:rgba(196,181,253,.38); background:rgba(196,181,253,.08);
          animation:sPulse 2.5s ease-in-out infinite;
        }
        @keyframes sPulse{0%,100%{box-shadow:0 0 18px rgba(167,139,250,.1)}50%{box-shadow:0 0 32px rgba(167,139,250,.22)}}
        .gstep.done { opacity:.42; border-color:rgba(134,239,172,.18); background:rgba(134,239,172,.03); }
        .gstep-num {
          width:38px;height:38px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'Lora',serif; font-size:16px; font-weight:600;
          border:1px solid rgba(255,255,255,.1); color:var(--muted);
          background:rgba(255,255,255,.04); transition:all .4s;
        }
        .gstep.cur  .gstep-num { background:linear-gradient(135deg,rgba(196,181,253,.28),rgba(124,58,237,.28)); border-color:rgba(196,181,253,.4); color:var(--lavender); }
        .gstep.done .gstep-num { background:rgba(134,239,172,.15); border-color:rgba(134,239,172,.3); color:var(--sage); }
        .gstep-emoji { font-size:24px; }
        .gstep-body { flex:1; }
        .gstep-sense { font-size:10.5px; text-transform:uppercase; letter-spacing:.14em; color:var(--muted); }
        .gstep-prompt { font-size:14.5px; color:var(--text); line-height:1.5; margin-top:3px; }

        .done-card {
          display:flex; flex-direction:column; align-items:center; gap:14px; padding:30px;
          border-radius:22px;
          background:linear-gradient(135deg,rgba(134,239,172,.08),rgba(196,181,253,.08));
          border:1px solid rgba(134,239,172,.2); text-align:center; animation:fadeUp .5s ease;
        }
        .done-icon { font-size:44px; animation:floatG 3s ease-in-out infinite; }
        .done-title { font-family:'Lora',serif; font-size:22px; font-style:italic; color:var(--lavender); }
        .done-sub { font-size:14px; color:var(--muted); line-height:1.65; max-width:320px; }

        .btn-primary {
          background:linear-gradient(135deg,#c4b5fd,#7c3aed); border:none; color:#1a0a3e;
          border-radius:26px; padding:12px 34px; font-size:14.5px;
          font-family:'Nunito',sans-serif; font-weight:600; cursor:pointer;
          transition:all .3s; box-shadow:0 0 20px rgba(167,139,250,.38); letter-spacing:.04em;
        }
        .btn-primary:hover{transform:scale(1.04);box-shadow:0 0 32px rgba(167,139,250,.58)}
        .btn-ghost {
          background:rgba(196,181,253,.06); border:1px solid rgba(196,181,253,.22);
          color:var(--lavender); border-radius:26px;
          padding:12px 28px; font-size:14.5px; font-family:'Nunito',sans-serif;
          font-weight:500; cursor:pointer; transition:all .3s; letter-spacing:.04em;
        }
        .btn-ghost:hover{background:rgba(196,181,253,.12)}
        .row-btns { display:flex; gap:10px; justify-content:center; }

        /* Footer */
        .sr-footer {
          padding:10px 24px 16px; text-align:center;
          font-size:10.5px; letter-spacing:.06em; color:rgba(255,255,255,.15); flex-shrink:0;
        }
      `}</style>

      <div className="stars" />
      <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
      <div className="orb o4" /><div className="orb o5" />

      <div className="sr-wrap">
        <div className="sr-card">

          {/* Header */}
          <div className="sr-header">
            <div className="sr-brand">
              <div className="sr-logo">🌿</div>
              <div>
                <div className="sr-appname">CalmAI</div>
                <div className="sr-tagline">Anxiety Companion</div>
              </div>
            </div>
            <div className={`sr-badge${loading ? " thinking" : ""}`}>
              {loading ? "Thinking…" : "● Online"}
            </div>
          </div>

          {/* Tabs */}
          <div className="sr-tabs">
            {[{id:"chat",label:"Chat",icon:"💬"},{id:"breathe",label:"Breathe",icon:"🫁"},{id:"ground",label:"Grounding",icon:"🌱"}].map(t=>(
              <button key={t.id} className={`sr-tab ${tab===t.id?"on":"off"}`} onClick={()=>setTab(t.id)}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <div className="sep" />

          {/* ══ CHAT ══ */}
          {tab==="chat" && <>
            <div className="sr-messages">
              {chat.length===0 && (
                <div className="sr-empty">
                  <div className="sr-empty-glyph">🌸</div>
                  <div className="sr-empty-title">A quiet space, just for you.</div>
                  <div className="sr-empty-sub">Share what's on your mind — gently, without judgment.<br/>You're safe here.</div>
                </div>
              )}
              {chat.map((msg,idx)=>(
                <div key={idx} className={`msg-row${msg.sender==="user"?" user":""}`}>
                  {msg.sender==="bot" && <div className="msg-av">🌿</div>}
                  <div className={`msg-bub ${msg.sender==="bot"?"bot":"user"}`}>{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className="typing-row">
                  <div className="msg-av">🌿</div>
                  <div className="typing-bub"><div className="td"/><div className="td"/><div className="td"/></div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
            {chat.length===0 && (
              <div className="sr-prompts">
                {QUICK_PROMPTS.map(p=>(
                  <button key={p} className="qpill" onClick={()=>handleSend(p)}>{p}</button>
                ))}
              </div>
            )}
            <div className="sr-inputbar">
              <input className="sr-input" placeholder="Share what's on your mind…"
                value={message} onChange={e=>setMessage(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSend()}/>
              <button className="sr-send" onClick={()=>handleSend()} disabled={loading||!message.trim()}>↑</button>
            </div>
          </>}

          {/* ══ BREATHE ══ */}
          {tab==="breathe" && (
            <div className="breath-tab">
              {/* Exercise picker */}
              <div className="ex-selector">
                {BREATH_EXERCISES.map((e,i)=>(
                  <div key={e.id} className={`ex-card${selectedExercise===i?" sel":""}`}
                    onClick={()=>selectExercise(i)}
                    style={selectedExercise===i?{borderColor:e.color+"66",boxShadow:`0 0 22px ${e.glow}`}:{}}>
                    <div className="ex-icon">{e.icon}</div>
                    <div className="ex-name">{e.name}</div>
                    <div className="ex-desc">{e.desc}</div>
                  </div>
                ))}
              </div>

              <div className="breath-arena">
                {/* Ring + circle */}
                <div className="breath-ring-outer">
                  {breathActive && <>
                    <div className="ripple"    style={{borderColor:ex.color+"55"}}/>
                    <div className="ripple rp2" style={{borderColor:ex.color+"3a"}}/>
                    <div className="ripple rp3" style={{borderColor:ex.color+"22"}}/>
                  </>}
                  <div className="breath-circle" style={{
                    transform:`scale(${circleScale})`,
                    background: breathActive
                      ? `radial-gradient(circle,${ex.color}28 0%,${ex.color}08 70%)`
                      : "radial-gradient(circle,rgba(196,181,253,0.09) 0%,transparent 70%)",
                    border:`2px solid ${breathActive?ex.color+"77":"rgba(196,181,253,0.2)"}`,
                    boxShadow: breathActive ? `0 0 70px ${ex.glow}, inset 0 0 50px ${ex.color}14` : "none",
                  }}>
                    <div className="breath-phase-lbl" style={{color:breathActive?ex.color:"rgba(196,181,253,0.45)"}}>
                      {breathActive ? ex.phases[breathPhase] : "Ready"}
                    </div>
                    <div className="breath-num" style={{color:breathActive?ex.color:"rgba(196,181,253,0.3)"}}>
                      {breathActive ? breathTimer : "—"}
                    </div>
                  </div>
                </div>

                <div className="breath-cycles-lbl">
                  {breathCycles===0 ? "Start when you're ready" : `${breathCycles} cycle${breathCycles>1?"s":""} complete`}
                </div>

                <div className="phase-chips">
                  {ex.phases.map((p,i)=>(
                    <div key={i} className={`pchip${breathActive&&breathPhase===i?" on":""}`}
                      style={breathActive&&breathPhase===i?{borderColor:ex.color+"99",color:ex.color,background:ex.color+"22"}:{}}>
                      {p} {ex.durations[i]}s
                    </div>
                  ))}
                </div>

                {breathActive && (
                  <div className="breath-prog" style={{width:280}}>
                    <div className="breath-prog-fill" style={{
                      width:`${((ex.durations[breathPhase]-breathTimer)/ex.durations[breathPhase])*100}%`,
                      background:`linear-gradient(90deg,${ex.color},${ex.color}99)`,
                    }}/>
                  </div>
                )}

                <div style={{display:"flex",gap:12}}>
                  {!breathActive
                    ? <button className="btn-begin" onClick={startBreath}
                        style={{background:`linear-gradient(135deg,${ex.color},${ex.color}aa)`,boxShadow:`0 0 26px ${ex.glow}`}}>
                        Begin
                      </button>
                    : <button className="btn-stop" onClick={stopBreath}>Stop</button>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ══ GROUNDING ══ */}
          {tab==="ground" && (
            <div className="ground-tab">
              {!groundingStarted && !groundingDone && (
                <div className="ground-intro">
                  <div style={{fontSize:50,animation:"floatG 4s ease-in-out infinite"}}>🌱</div>
                  <div className="ground-title">5-4-3-2-1 Grounding</div>
                  <div className="ground-sub">
                    This technique anchors you to the present moment by engaging all five senses.
                    It's one of the most powerful tools for anxiety and panic attacks.
                  </div>
                  <button className="btn-primary" onClick={startGrounding}>Start Grounding</button>
                </div>
              )}

              {groundingStarted && !groundingDone && <>
                <div className="ground-steps">
                  {GROUNDING.map((g,i)=>(
                    <div key={i} className={`gstep${i===groundingStep?" cur":i<groundingStep?" done":""}`}>
                      <div className="gstep-num">{i<groundingStep?"✓":g.n}</div>
                      <div className="gstep-emoji">{g.icon}</div>
                      <div className="gstep-body">
                        <div className="gstep-sense">{g.sense}</div>
                        <div className="gstep-prompt">{g.prompt}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row-btns">
                  <button className="btn-ghost" onClick={resetGrounding}>Restart</button>
                  <button className="btn-primary" onClick={nextGrounding}>
                    {groundingStep>=GROUNDING.length-1?"Complete ✓":"Next →"}
                  </button>
                </div>
              </>}

              {groundingDone && <>
                <div className="done-card">
                  <div className="done-icon">🌸</div>
                  <div className="done-title">You're grounded.</div>
                  <div className="done-sub">
                    Well done. You've brought yourself back to the present.
                    Take a slow breath and notice how you feel right now.
                  </div>
                </div>
                <div className="row-btns">
                  <button className="btn-ghost" onClick={resetGrounding}>Do it again</button>
                  <button className="btn-primary" onClick={()=>{resetGrounding();setTab("chat");}}>
                    Talk to CalmAI →
                  </button>
                </div>
              </>}
            </div>
          )}

          <div className="sr-footer">
            CalmAI is an AI companion · Not a substitute for professional care · Crisis line: 988
          </div>

        </div>
      </div>
    </>
  );
}
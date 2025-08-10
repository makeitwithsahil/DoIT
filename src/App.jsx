// src/App.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiDownload,
  FiUpload,
  FiZap,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiBarChart2,
  FiGift,
  FiRotateCcw,
  FiX,
} from "react-icons/fi";

/**
 * FocusTasks Pro - Single-file professional Task Manager (App.jsx)
 *
 * Features:
 * - Full single-file React app (JSX) for use with Tailwind CSS + Framer Motion + react-icons
 * - LocalStorage persistence
 * - Add / Edit / Delete / Toggle Complete / Archive
 * - Search, Filters (All / Active / Completed / Archived), Sort (Newest/Oldest/Priority/Due)
 * - Priority, Tags, Due date, Reminder (browser Notification API)
 * - Subtasks, Notes
 * - Undo for deletes (temporary)
 * - Bulk actions: Complete all, Clear completed, Export/Import JSON
 * - Points & streaks gamification stored in localStorage
 * - Theme toggle (light/dark) with smooth transition
 * - Keyboard shortcuts, accessible controls, aria labels
 * - Smooth, consistent animations everywhere (Framer Motion)
 * - Minimal, elegant UI (Tailwind) tuned for professionalism and performance
 *
 * Requirements:
 * - Tailwind CSS configured in project
 * - framer-motion: npm i framer-motion
 * - react-icons: npm i react-icons
 *
 * Drop this into src/App.jsx and run.
 */

/* ---------------------- Helpers ---------------------- */

const STORAGE_KEY = "ftasks.pro.v1";
const META_KEY = "ftasks.pro.meta.v1";

const defaultMeta = {
  theme: "auto", // light | dark | auto
  points: 0,
  streak: { lastDate: null, current: 0 },
};

const QUOTES = [
  "Small steps compound. Start with one.",
  "Focus on the next smallest action.",
  "Progress is built on tiny, consistent wins.",
  "Done beats perfect every time.",
  "Remove friction — make starting trivial.",
];

const TIPS = [
  "Break big tasks into 15–25 minute work blocks.",
  "If it takes less than 2 minutes, do it now.",
  "Eliminate distractions and set a single focus.",
  "Reward yourself with short breaks after focused sessions.",
  "Write the next action, not the whole project.",
];

const genId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const now = () => Date.now();

const formatDateShort = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString();
};

const formatDateTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
};

/* ---------------------- Tiny utilities ---------------------- */

function clamp(n, a = 0, b = 100) {
  return Math.max(a, Math.min(b, n));
}

/* ---------------------- Default sample data (optional) ---------------------- */

const SAMPLE_TASKS = [
  {
    id: genId(),
    title: "Plan weekly study blocks",
    notes: "Use Pomodoro: 25/5 or 50/10. Keep tasks small.",
    priority: "high",
    tags: ["study", "planning"],
    dueAt: null,
    remindAt: null,
    subtasks: [
      { id: genId(), text: "List topics", done: false },
      { id: genId(), text: "Pick top 3 priorities", done: false },
    ],
    completed: false,
    archived: false,
    createdAt: now() - 1000 * 60 * 60 * 24,
    updatedAt: now() - 1000 * 60 * 60 * 24,
  },
  {
    id: genId(),
    title: "Polish portfolio landing page",
    notes: "Improve hero section, CTA, and mobile spacing.",
    priority: "medium",
    tags: ["project", "portfolio"],
    dueAt: null,
    remindAt: null,
    subtasks: [{ id: genId(), text: "Add real projects", done: true }],
    completed: false,
    archived: false,
    createdAt: now() - 1000 * 60 * 60 * 6,
    updatedAt: now() - 1000 * 60 * 60 * 6,
  },
];

/* ---------------------- Local Storage wrapper ---------------------- */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tasks: SAMPLE_TASKS.slice(0, 0) }; // start empty by default
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadState error", e);
    return { tasks: [] };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("saveState error", e);
  }
}

function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta;
    return JSON.parse(raw);
  } catch {
    return defaultMeta;
  }
}

function saveMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error("saveMeta error", e);
  }
}

/* ---------------------- Notification helper ---------------------- */

async function requestNotifyPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

function sendNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: undefined });
  }
}

/* ---------------------- Small UI subcomponents ---------------------- */

/* IconButton: small consistent icon button */
function IconButton({ onClick, title, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition ${className}`}
    >
      {children}
    </button>
  );
}

/* SmallTag for tags/priority display */
function SmallTag({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${className}`}
    >
      {children}
    </span>
  );
}

/* Modal component */
function Modal({ open, onClose, children, ariaLabel = "Modal" }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label={ariaLabel}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-3xl w-full overflow-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* Tiny toast system (in-memory) */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  function push(text, opts = {}) {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, text, ...opts }]);
    if (!opts.permanent) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, opts.duration || 3500);
    }
  }
  function remove(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }
  return { toasts, push, remove };
}

/* ---------------------- Main App ---------------------- */

export default function App() {
  const initial = loadState();
  const initialMeta = loadMeta();

  const [tasksState, setTasksState] = useState(initial.tasks || []);
  const [meta, setMeta] = useState(initialMeta);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed | archived
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | priority | due
  const [showArchived, setShowArchived] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [showStats, setShowStats] = useState(false);

  const toasts = useToasts();

  // form state
  const [fTitle, setFTitle] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fPriority, setFPriority] = useState("medium");
  const [fTags, setFTags] = useState([]);
  const [fDueAt, setFDueAt] = useState("");
  const [fRemindAt, setFRemindAt] = useState("");
  const [fSubtaskText, setFSubtaskText] = useState("");
  const [fSubtasks, setFSubtasks] = useState([]);

  // undo stack for delete
  const undoRef = useRef(null);

  // theme
  const [theme, setTheme] = useState(meta.theme || "auto"); // apply onto root

  // random quote/tip
  const [quote, setQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [tip, setTip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  /* ---------------------- Effects: Persisting ---------------------- */

  useEffect(() => {
    saveState({ tasks: tasksState });
  }, [tasksState]);

  useEffect(() => {
    saveMeta(meta);
  }, [meta]);

  /* ---------------------- Theme handling ---------------------- */

  useEffect(() => {
    // apply theme to html root
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = theme === "auto" ? (prefersDark ? "dark" : "light") : theme;
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  /* ---------------------- Notifications check ---------------------- */
  useEffect(() => {
    // request permission on first load if not denied
    if ("Notification" in window && Notification.permission === "default") {
      // don't auto-prompt aggressively, only set once
      // but we can prompt when user enables reminders
    }
  }, []);

  /* ---------------------- Derived values ---------------------- */

  const activeTasks = tasksState.filter((t) => !t.completed && !t.archived);
  const completedTasks = tasksState.filter((t) => t.completed && !t.archived);
  const archivedTasks = tasksState.filter((t) => t.archived);

  const stats = useMemo(() => {
    const total = tasksState.length;
    const completed = tasksState.filter((t) => t.completed).length;
    const active = tasksState.filter((t) => !t.completed && !t.archived).length;
    const archived = tasksState.filter((t) => t.archived).length;
    const high = tasksState.filter((t) => t.priority === "high" && !t.archived).length;
    return { total, completed, active, archived, high };
  }, [tasksState]);

  /* ---------------------- Core CRUD actions ---------------------- */

  const createTask = useCallback(
    ({
      title,
      notes = "",
      priority = "medium",
      tags = [],
      dueAt = null,
      remindAt = null,
      subtasks = [],
      completed = false,
    }) => {
      const t = {
        id: genId(),
        title,
        notes,
        priority,
        tags,
        dueAt,
        remindAt,
        subtasks,
        completed,
        archived: false,
        createdAt: now(),
        updatedAt: now(),
      };
      setTasksState((prev) => [t, ...prev]);
      setMeta((m) => ({ ...m, points: m.points + (priority === "high" ? 10 : 5) }));
      toasts.push("Task added");
      return t;
    },
    [toasts]
  );

  const updateTask = useCallback(
    (id, patch) => {
      setTasksState((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)));
    },
    []
  );

  const removeTask = useCallback(
    (id) => {
      const t = tasksState.find((x) => x.id === id);
      if (!t) return;
      undoRef.current = { type: "delete", payload: t, ts: now() };
      setTasksState((prev) => prev.filter((x) => x.id !== id));
      toasts.push("Task deleted — undo available", { duration: 4000 });
      // schedule undo clear
      setTimeout(() => {
        if (undoRef.current && undoRef.current.payload?.id === t.id) {
          undoRef.current = null;
        }
      }, 4200);
    },
    [tasksState, toasts]
  );

  const undoDelete = useCallback(() => {
    if (undoRef.current && undoRef.current.type === "delete") {
      setTasksState((prev) => [undoRef.current.payload, ...prev]);
      toasts.push("Undo successful");
      undoRef.current = null;
    } else {
      toasts.push("Nothing to undo");
    }
  }, [toasts]);

  const toggleComplete = useCallback(
    async (id) => {
      const t = tasksState.find((x) => x.id === id);
      if (!t) return;
      const next = !t.completed;
      updateTask(id, { completed: next });
      // Reward
      if (next) {
        const pts = t.priority === "high" ? 30 : t.priority === "medium" ? 15 : 8;
        setMeta((m) => {
          const newPoints = (m.points || 0) + pts;
          // streak update
          const today = new Date().toISOString().slice(0, 10);
          let streakObj = { ...m.streak };
          if (streakObj.lastDate === today) {
            // already counted today
          } else {
            // if lastDate was yesterday then increment, else reset
            const last = streakObj.lastDate;
            if (last) {
              const lastDate = new Date(last);
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const isYesterday = lastDate.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10);
              streakObj.current = isYesterday ? streakObj.current + 1 : 1;
            } else {
              streakObj.current = 1;
            }
            streakObj.lastDate = today;
          }
          const updated = { ...m, points: newPoints, streak: streakObj };
          saveMeta(updated);
          return updated;
        });

        // subtle notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          sendNotification("Task completed", `${t.title} — +${t.priority === "high" ? 30 : t.priority === "medium" ? 15 : 8} pts`);
        }
        toasts.push(`+${t.priority === "high" ? 30 : t.priority === "medium" ? 15 : 8} points`);
      }
    },
    [tasksState, updateTask, toasts]
  );

  const archiveTask = useCallback((id) => {
    updateTask(id, { archived: true });
    toasts.push("Task archived");
  }, [updateTask, toasts]);

  /* ---------------------- Bulk actions ---------------------- */

  function clearCompleted() {
    if (!confirm("Clear all completed tasks? This cannot be undone.")) return;
    setTasksState((prev) => prev.filter((t) => !t.completed));
    toasts.push("Cleared completed");
  }

  function completeAll() {
    setTasksState((prev) => prev.map((t) => ({ ...t, completed: true })));
    toasts.push("All tasks marked complete");
  }

  function deleteAll() {
    if (!confirm("Delete ALL tasks? This cannot be undone.")) return;
    setTasksState([]);
    toasts.push("All tasks deleted");
  }

  /* ---------------------- Export / Import ---------------------- */

  function exportTasks() {
    try {
      const data = JSON.stringify(tasksState, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ftasks-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toasts.push("Export complete");
    } catch {
      toasts.push("Export failed");
    }
  }

  function importTasks(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error("Invalid file");
        // sanitize
        const sanitized = parsed.map((t) => ({
          id: t.id || genId(),
          title: String(t.title || "Untitled"),
          notes: t.notes || "",
          priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : "medium",
          tags: Array.isArray(t.tags) ? t.tags : [],
          dueAt: t.dueAt || null,
          remindAt: t.remindAt || null,
          subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          completed: !!t.completed,
          archived: !!t.archived,
          createdAt: Number(t.createdAt) || now(),
          updatedAt: Number(t.updatedAt) || now(),
        }));
        setTasksState((prev) => [...sanitized, ...prev]);
        toasts.push(`Imported ${sanitized.length} tasks`);
      } catch (err) {
        console.error(err);
        toasts.push("Import failed");
      }
    };
    reader.readAsText(file);
  }

  /* ---------------------- Search & Filters ---------------------- */

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tasksState.filter((t) => {
      if (filter === "active") return !t.completed && !t.archived;
      if (filter === "completed") return t.completed && !t.archived;
      if (filter === "archived") return t.archived;
      return !t.archived;
    });

    if (q) {
      list = list.filter((t) => {
        return (
          t.title.toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
          (t.subtasks || []).some((s) => s.text.toLowerCase().includes(q))
        );
      });
    }

    if (sortBy === "newest") list.sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === "oldest") list.sort((a, b) => a.createdAt - b.createdAt);
    if (sortBy === "priority") {
      const map = { high: 0, medium: 1, low: 2 };
      list.sort((a, b) => (map[a.priority] - map[b.priority]));
    }
    if (sortBy === "due") {
      list.sort((a, b) => (Number(a.dueAt || 1e15) - Number(b.dueAt || 1e15)));
    }

    return list;
  }, [tasksState, query, filter, sortBy]);

  /* ---------------------- Form open for new/edit ---------------------- */

  function openNewForm(prefill = null) {
    if (!prefill) {
      setEditingId(null);
      setFTitle("");
      setFNotes("");
      setFPriority("medium");
      setFTags([]);
      setFDueAt("");
      setFRemindAt("");
      setFSubtasks([]);
    } else {
      setEditingId(prefill.id);
      setFTitle(prefill.title || "");
      setFNotes(prefill.notes || "");
      setFPriority(prefill.priority || "medium");
      setFTags(prefill.tags || []);
      setFDueAt(prefill.dueAt ? new Date(prefill.dueAt).toISOString().slice(0, 16) : "");
      setFRemindAt(prefill.remindAt ? new Date(prefill.remindAt).toISOString().slice(0, 16) : "");
      setFSubtasks(prefill.subtasks ? [...prefill.subtasks] : []);
    }
    setFormOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 150);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFTitle("");
    setFNotes("");
    setFPriority("medium");
    setFTags([]);
    setFDueAt("");
    setFRemindAt("");
    setFSubtasks([]);
  }

  function saveForm(e) {
    e?.preventDefault();
    const title = fTitle.trim();
    if (!title) {
      toasts.push("Please add a title");
      return;
    }
    const obj = {
      title,
      notes: fNotes.trim(),
      priority: fPriority,
      tags: fTags,
      dueAt: fDueAt ? new Date(fDueAt).getTime() : null,
      remindAt: fRemindAt ? new Date(fRemindAt).getTime() : null,
      subtasks: fSubtasks.map((s) => ({ id: s.id || genId(), text: s.text, done: !!s.done })),
    };
    if (editingId) {
      updateTask(editingId, obj);
      toasts.push("Task updated");
    } else {
      createTask(obj);
    }
    closeForm();
  }

  function toggleSubtask(taskId, subId) {
    const t = tasksState.find((x) => x.id === taskId);
    if (!t) return;
    const nextSubs = (t.subtasks || []).map((s) => (s.id === subId ? { ...s, done: !s.done } : s));
    updateTask(taskId, { subtasks: nextSubs });
  }

  /* ---------------------- Reminder check loop ---------------------- */

  useEffect(() => {
    let active = true;
    // check every minute
    const timer = setInterval(() => {
      if (!active) return;
      const nowTs = Date.now();
      tasksState.forEach((t) => {
        if (t.remindAt && !t.completed && !t.archived && nowTs >= t.remindAt && (!t._reminded)) {
          // send notification
          if ("Notification" in window) {
            requestNotifyPermission().then((granted) => {
              if (granted) sendNotification("Reminder: " + t.title, t.notes || "Time to complete your task");
            });
          }
          // mark as reminded in memory (not persisted) to avoid duplicates
          t._reminded = true;
        }
      });
    }, 60 * 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [tasksState]);

  /* ---------------------- Keyboard shortcuts ---------------------- */

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        // focus search
        const el = document.querySelector("#ftask-search");
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openNewForm();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undoDelete();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undoDelete]);

  /* ---------------------- Small UI components inside main file ---------------------- */

  function Header() {
    return (
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-violet-500 text-white w-12 h-12 grid place-items-center text-xl font-bold shadow">
            FT
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">FocusTasks Pro</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Minimal • Smooth • Productive</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <SmallTag className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <FiZap /> <span className="ml-1 text-xs">Points {meta.points || 0}</span>
            </SmallTag>
            <SmallTag className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <FiStar /> <span className="ml-1 text-xs">Streak {meta.streak?.current || 0}d</span>
            </SmallTag>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-md">
            <IconButton
              title="Toggle theme"
              onClick={() => {
                const next = theme === "light" ? "dark" : theme === "dark" ? "auto" : "light";
                setTheme(next);
                setMeta((m) => ({ ...m, theme: next }));
              }}
            >
              {theme === "dark" ? <FiMoon /> : theme === "light" ? <FiSun /> : <FiChevronDown />}
            </IconButton>

            <IconButton
              title="Open stats"
              onClick={() => setShowStats((s) => !s)}
            >
              <FiBarChart2 />
            </IconButton>

            <IconButton
              title="Quick add"
              onClick={() => {
                openNewForm();
              }}
            >
              <FiPlus />
            </IconButton>
          </div>
        </div>
      </header>
    );
  }

  function LeftPanel() {
    return (
      <aside className="max-w-xs w-full">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow">
            <div className="flex items-center gap-2">
              <FiSearch className="text-slate-400" />
              <input
                id="ftask-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, tags, notes..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
              />
              <button
                onClick={() => {
                  setQuery("");
                }}
                className="text-xs text-slate-400"
                title="Clear search"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`py-2 rounded-lg text-sm ${filter === "all" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}
              >
                All <span className="ml-1 text-xs opacity-70">({stats.total})</span>
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`py-2 rounded-lg text-sm ${filter === "active" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}
              >
                Active <span className="ml-1 text-xs opacity-70">({stats.active})</span>
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`py-2 rounded-lg text-sm ${filter === "completed" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}
              >
                Completed <span className="ml-1 text-xs opacity-70">({stats.completed})</span>
              </button>
              <button
                onClick={() => setFilter("archived")}
                className={`py-2 rounded-lg text-sm ${filter === "archived" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}
              >
                Archived <span className="ml-1 text-xs opacity-70">({stats.archived})</span>
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 justify-between">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm bg-transparent">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priority">Priority</option>
                <option value="due">Due date</option>
              </select>

              <div className="text-xs text-slate-400">Sort</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Quick add</div>
              <div className="text-xs text-slate-400">Ctrl/Cmd + N</div>
            </div>
            <div className="flex gap-2">
              <input
                value={quickAdd}
                onChange={(e) => setQuickAdd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickAdd.trim()) {
                    createTask({ title: quickAdd.trim() });
                    setQuickAdd("");
                  }
                }}
                placeholder="Add quick task..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm outline-none"
              />
              <button
                onClick={() => {
                  if (!quickAdd.trim()) return;
                  createTask({ title: quickAdd.trim() });
                  setQuickAdd("");
                }}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white"
              >
                <FiPlus />
              </button>
            </div>

            <div className="text-xs text-slate-500">{quote}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Actions</div>
              <div className="text-xs text-slate-400">Bulk</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={completeAll} className="px-2 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
                <FiCheckCircle className="inline-block mr-2" /> Complete all
              </button>
              <button onClick={clearCompleted} className="px-2 py-2 rounded-lg bg-rose-50 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-sm">
                <FiTrash2 className="inline-block mr-2" /> Clear completed
              </button>

              <button onClick={() => exportTasks()} className="px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                <FiDownload className="inline-block mr-2" /> Export
              </button>
              <label className="px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm cursor-pointer">
                <FiUpload className="inline-block mr-2" /> Import
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => importTasks(e.target.files?.[0])}
                  className="hidden"
                />
              </label>

              <button onClick={() => { setTasksState(SAMPLE_TASKS); toasts.push("Loaded sample tasks"); }} className="px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                <FiRotateCcw className="inline-block mr-2" /> Load sample
              </button>

              <button onClick={undoDelete} className="px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                <FiRotateCcw className="inline-block mr-2" /> Undo
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow">
            <div className="text-xs text-slate-400 mb-2">Motivation tip</div>
            <div className="text-sm text-slate-700 dark:text-slate-200">{tip}</div>
          </div>
        </div>
      </aside>
    );
  }

  function RightPanel() {
    return (
      <main className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-500">Filter</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-full text-sm ${filter === "all" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}>All</button>
              <button onClick={() => setFilter("active")} className={`px-3 py-1 rounded-full text-sm ${filter === "active" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}>Active</button>
              <button onClick={() => setFilter("completed")} className={`px-3 py-1 rounded-full text-sm ${filter === "completed" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}>Completed</button>
              <button onClick={() => setFilter("archived")} className={`px-3 py-1 rounded-full text-sm ${filter === "archived" ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700"}`}>Archived</button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-500">Sort</div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1 rounded-md bg-transparent text-sm">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
            </select>

            <button onClick={() => openNewForm()} className="ml-4 px-3 py-1 rounded-md bg-indigo-600 text-white flex items-center gap-2">
              <FiPlus /> New task
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow">
          <AnimatePresence>
            {filteredSorted.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center text-slate-400">
                No tasks found. Try adding one — Ctrl/Cmd + N
              </motion.div>
            ) : (
              <motion.ul layout className="space-y-3">
                {filteredSorted.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  /* ---------------------- Task Row component ---------------------- */

  function TaskRow({ task }) {
    const overDue = task.dueAt && Date.now() > task.dueAt && !task.completed;
    return (
      <motion.li
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="p-3 rounded-lg border border-transparent hover:shadow-md transition bg-white dark:bg-slate-800 flex gap-3 items-start"
      >
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => toggleComplete(task.id)}
            title={task.completed ? "Mark as not completed" : "Mark completed"}
            className={`w-10 h-10 grid place-items-center rounded-md transition ${task.completed ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-700 text-slate-600"}`}
          >
            <FiCheckCircle />
          </button>

          <div className="text-xs text-slate-400">{formatDateShort(task.createdAt)}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className={`text-sm font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                  {task.title}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {task.dueAt && (
                    <SmallTag className={overDue ? "border-rose-200 text-rose-600 bg-rose-50" : "border-slate-200 text-slate-600"}>
                      <FiClock /> <span className="ml-1">{formatDateShort(task.dueAt)}</span>
                    </SmallTag>
                  )}

                  <SmallTag className={task.priority === "high" ? "border-red-100 text-red-600" : task.priority === "low" ? "border-sky-100 text-sky-600" : "border-amber-100 text-amber-700"}>
                    <FiStar /> <span className="ml-1">{task.priority}</span>
                  </SmallTag>
                </div>
              </div>

              {task.notes && <div className="text-xs text-slate-500 mt-1 truncate">{task.notes}</div>}

              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {task.subtasks.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={!!s.done} onChange={() => toggleSubtask(task.id, s.id)} className="w-4 h-4" />
                      <div className={s.done ? "line-through text-slate-400" : "text-slate-700"}>{s.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-1">
                <IconButton title="Edit" onClick={() => openNewForm(task)}>
                  <FiEdit2 />
                </IconButton>
                <IconButton title="Archive" onClick={() => archiveTask(task.id)}>
                  <FiChevronDown />
                </IconButton>
                <IconButton title="Delete" onClick={() => removeTask(task.id)}>
                  <FiTrash2 />
                </IconButton>
              </div>

              <div className="text-xs text-slate-400">{task.tags && task.tags.length > 0 ? task.tags.slice(0, 3).join(", ") : ""}</div>
            </div>
          </div>
        </div>
      </motion.li>
    );
  }

  /* ---------------------- Stats panel ---------------------- */

  function StatsPanel() {
    return (
      <Modal open={showStats} onClose={() => setShowStats(false)} ariaLabel="Statistics">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Stats & Progress</h3>
            <IconButton onClick={() => setShowStats(false)} title="Close stats"><FiX /></IconButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-500">Total tasks</div>
              <div className="text-2xl font-semibold">{stats.total}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-500">Completed</div>
              <div className="text-2xl font-semibold">{stats.completed}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-500">Active</div>
              <div className="text-2xl font-semibold">{stats.active}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-500">Archived</div>
              <div className="text-2xl font-semibold">{stats.archived}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-slate-500">Points</div>
            <div className="text-4xl font-semibold text-indigo-600">{meta.points || 0}</div>
            <div className="text-xs text-slate-400 mt-2">Streak: {meta.streak?.current || 0} days</div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={() => { setMeta(defaultMeta); toasts.push("Progress reset"); }} className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600">Reset</button>
            <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify({ meta })); toasts.push("Meta copied"); }} className="px-3 py-2 rounded-lg bg-slate-50">Export meta</button>
          </div>
        </div>
      </Modal>
    );
  }

  /* ---------------------- Form modal UI ---------------------- */

  function TaskFormModal() {
    return (
      <Modal open={formOpen} onClose={() => closeForm()} ariaLabel={editingId ? "Edit task" : "New task"}>
        <form onSubmit={saveForm} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{editingId ? "Edit task" : "New task"}</h3>
            <div className="text-xs text-slate-400">Tip: keep titles short</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              autoFocus
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
              placeholder="Title"
              className="md:col-span-2 px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
            />
            <select value={fPriority} onChange={(e) => setFPriority(e.target.value)} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900">
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 min-h-[80px]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="datetime-local" value={fDueAt} onChange={(e) => setFDueAt(e.target.value)} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900" />
            <input type="datetime-local" value={fRemindAt} onChange={(e) => setFRemindAt(e.target.value)} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900" />
          </div>

          <div>
            <div className="text-sm text-slate-500 mb-2">Subtasks</div>
            <div className="flex gap-2">
              <input value={fSubtaskText} onChange={(e) => setFSubtaskText(e.target.value)} placeholder="Add subtask..." className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-slate-900" />
              <button type="button" onClick={() => { if (fSubtaskText.trim()) { setFSubtasks((s) => [...s, { id: genId(), text: fSubtaskText.trim(), done: false }]); setFSubtaskText(""); } }} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">
                Add
              </button>
            </div>

            <div className="mt-2 space-y-1">
              {fSubtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!s.done} onChange={() => setFSubtasks((prev) => prev.map((x) => x.id === s.id ? { ...x, done: !x.done } : x))} />
                  <div className={s.done ? "line-through text-slate-400" : ""}>{s.text}</div>
                  <button type="button" onClick={() => setFSubtasks((prev) => prev.filter((x) => x.id !== s.id))} className="ml-auto text-xs text-rose-600">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">{editingId ? "Save changes" : "Create task"}</button>
            <button type="button" onClick={() => { closeForm(); }} className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">Cancel</button>
          </div>
        </form>
      </Modal>
    );
  }

  /* ---------------------- Toasts UI ---------------------- */

  function Toaster() {
    return (
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow flex items-center gap-3">
              <div className="text-sm">{t.text}</div>
              <div className="ml-auto text-xs text-slate-400">{t.subtext}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  /* ---------------------- Final render ---------------------- */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <LeftPanel />
          <RightPanel />
        </div>

        <AnimatePresence>{formOpen && <TaskFormModal />}</AnimatePresence>

        <StatsPanel />

        <Toaster />

        {/* Floating reward & undo */}
        <div className="fixed left-6 bottom-6 z-40 space-y-2">
          <AnimatePresence>
            {undoRef.current && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow flex items-center gap-3">
                <div className="text-sm">Action available</div>
                <button onClick={() => undoDelete()} className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white">Undo</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

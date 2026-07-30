/**
 * Simple client-side task store backed by localStorage.
 * No backend yet — this keeps tasks working end-to-end (chat -> dashboard
 * -> tasks list) without needing a database for the capstone demo.
 */

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = "taskflow.tasks";

// Simple pub/sub so components re-render when tasks change from
// somewhere else (e.g. added via chat while Dashboard is open).
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeToTasks(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  notify();
}

export function addTask(title: string): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
  };
  saveTasks([task, ...getTasks()]);
  return task;
}

export function toggleTask(id: string) {
  const tasks = getTasks().map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks(tasks);
}

export function deleteTask(id: string) {
  saveTasks(getTasks().filter((t) => t.id !== id));
}
export function clearAllTasks() {
  saveTasks([]);
}
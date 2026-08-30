import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addTask,
  toggleTask,
  deleteTask,
  clearAllTasks,
  getTasks,
  subscribeToTasks,
} from "@/lib/tasks";

// Reset localStorage before every test so tests don't leak state into
// each other (this file is the reason lib/tasks.ts wasn't showing up in
// the coverage report at all before — it had zero test coverage).
beforeEach(() => {
  window.localStorage.clear();
});

describe("getTasks", () => {
  it("returns an empty array when nothing has been stored yet", () => {
    expect(getTasks()).toEqual([]);
  });

  it("returns an empty array instead of throwing if localStorage holds invalid JSON", () => {
    window.localStorage.setItem("taskflow.tasks", "{not valid json");
    expect(getTasks()).toEqual([]);
  });
});

describe("addTask", () => {
  it("adds a task with the given title and defaults completed to false", () => {
    const task = addTask("Buy groceries");
    expect(task.title).toBe("Buy groceries");
    expect(task.completed).toBe(false);
    expect(typeof task.id).toBe("string");
    expect(task.id.length).toBeGreaterThan(0);
  });

  it("trims whitespace from the title", () => {
    const task = addTask("   Walk the dog   ");
    expect(task.title).toBe("Walk the dog");
  });

  it("persists the task so a later getTasks() call sees it", () => {
    addTask("Read a book");
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe("Read a book");
  });

  it("puts the newest task first", () => {
    addTask("First task");
    addTask("Second task");
    const tasks = getTasks();
    expect(tasks[0].title).toBe("Second task");
    expect(tasks[1].title).toBe("First task");
  });
});

describe("toggleTask", () => {
  it("flips completed from false to true", () => {
    const task = addTask("Finish report");
    toggleTask(task.id);
    expect(getTasks()[0].completed).toBe(true);
  });

  it("flips completed back to false on a second toggle", () => {
    const task = addTask("Finish report");
    toggleTask(task.id);
    toggleTask(task.id);
    expect(getTasks()[0].completed).toBe(false);
  });

  it("does not affect other tasks", () => {
    const first = addTask("Task A");
    addTask("Task B");
    toggleTask(first.id);
    const tasks = getTasks();
    const taskB = tasks.find((t) => t.title === "Task B");
    expect(taskB?.completed).toBe(false);
  });
});

describe("deleteTask", () => {
  it("removes only the specified task", () => {
    const first = addTask("Keep me");
    const second = addTask("Delete me");
    deleteTask(second.id);
    const tasks = getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(first.id);
  });

  it("is a no-op if the id doesn't exist", () => {
    addTask("Only task");
    deleteTask("nonexistent-id");
    expect(getTasks()).toHaveLength(1);
  });
});

describe("clearAllTasks", () => {
  it("removes every task", () => {
    addTask("One");
    addTask("Two");
    clearAllTasks();
    expect(getTasks()).toEqual([]);
  });
});

describe("subscribeToTasks", () => {
  it("calls the listener when a task is added", () => {
    const listener = vi.fn();
    subscribeToTasks(listener);
    addTask("Trigger a notification");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops calling the listener after unsubscribing", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToTasks(listener);
    unsubscribe();
    addTask("Should not notify");
    expect(listener).not.toHaveBeenCalled();
  });

  it("notifies on toggle, delete, and clear as well as add", () => {
    const listener = vi.fn();
    const task = addTask("Watch me");
    subscribeToTasks(listener);
    toggleTask(task.id);
    deleteTask(task.id);
    clearAllTasks();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
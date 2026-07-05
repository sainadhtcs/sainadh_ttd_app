(function () {
  "use strict";

  const STORAGE_KEY = "todo-app-tasks-v1";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const itemsLeft = document.getElementById("items-left");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let tasks = [];
  let currentFilter = "all";

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      tasks = saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Could not load saved tasks:", err);
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Could not save tasks:", err);
    }
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.unshift({ id: makeId(), text: trimmed, completed: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  function getFilteredTasks() {
    if (currentFilter === "active") return tasks.filter((t) => !t.completed);
    if (currentFilter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const filtered = getFilteredTasks();
    list.innerHTML = "";

    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (task.completed ? " completed" : "");
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task as done" />
        <span class="todo-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" aria-label="Delete task">✕</button>
      `;

      li.querySelector("input").addEventListener("change", () => toggleTask(task.id));
      li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));

      list.appendChild(li);
    });

    emptyState.style.display = filtered.length === 0 ? "block" : "none";

    const remaining = tasks.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask(input.value);
    input.value = "";
    input.focus();
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  loadTasks();
  render();
})();

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const totalCount = document.querySelector("#total-count");
const pendingCount = document.querySelector("#pending-count");
const completedCount = document.querySelector("#completed-count");
const remainingText = document.querySelector("#remaining-text");
const clearCompletedButton = document.querySelector("#clear-completed");
const todayDate = document.querySelector("#today-date");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

todayDate.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric"
}).format(new Date());

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("simpleTodoTasks")) || [];
  } catch (error) {
    console.warn("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("simpleTodoTasks", JSON.stringify(tasks));
}

function addTask(description) {
  const cleanDescription = description.trim();
  if (!cleanDescription) return;

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: cleanDescription,
    completed: false
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "task-check";
    checkButton.setAttribute("aria-label", task.completed ? "Mark as not done" : "Mark as done");
    checkButton.textContent = task.completed ? "✓" : "";
    checkButton.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.title = "Delete task";
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkButton, text, deleteButton);
    taskList.append(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  totalCount.textContent = tasks.length;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
  remainingText.textContent = pending === 0
    ? "You're all caught up!"
    : `${pending} task${pending === 1 ? "" : "s"} left to do.`;

  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;
  clearCompletedButton.disabled = completed === 0;
  clearCompletedButton.style.opacity = completed === 0 ? "0.45" : "1";
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(filter => {
      const isActive = filter === button;
      filter.classList.toggle("active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();

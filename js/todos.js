import { playUiSound } from './audio.js';

let todos = JSON.parse(localStorage.getItem('nexus_todos')) || [];

export function initSidebarAndTodos() {
  const sidebar = document.getElementById('sidebar');
  const trigger = document.getElementById('toggleSidebarBtn');
  const todoInput = document.getElementById('todoInput');
  const addTodoBtn = document.getElementById('addTodoBtn');

  trigger?.addEventListener('click', () => {
    playUiSound(500, 0.05);
    sidebar?.classList.toggle('active');
  });

  addTodoBtn?.addEventListener('click', addTodo);
  todoInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  renderTodos();
}

function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input?.value.trim();
  if (text) {
    playUiSound(700, 0.04);
    todos.push({ text, completed: false });
    localStorage.setItem('nexus_todos', JSON.stringify(todos));
    if (input) input.value = '';
    renderTodos();
  }
}

function renderTodos() {
  const list = document.getElementById('todoList');
  if (!list) return;
  list.innerHTML = '';

  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${todo.text}</span>
      <i class="fa-solid fa-trash"></i>
    `;

    li.querySelector('span')?.addEventListener('click', () => {
      playUiSound(600, 0.03);
      todos[idx].completed = !todos[idx].completed;
      localStorage.setItem('nexus_todos', JSON.stringify(todos));
      renderTodos();
    });

    li.querySelector('i')?.addEventListener('click', () => {
      playUiSound(300, 0.05);
      todos.splice(idx, 1);
      localStorage.setItem('nexus_todos', JSON.stringify(todos));
      renderTodos();
    });

    list.appendChild(li);
  });
}

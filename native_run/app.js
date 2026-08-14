import { addTask, moveTask } from './task-store.js';

const key = 'mini-task-board.v1';
const labels = { inbox: 'Входящие', today: 'Сегодня', done: 'Готово' };
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const message = document.querySelector('#form-message');
let tasks = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(key, JSON.stringify(tasks));
}

function render() {
  document.querySelector('#task-count').textContent = `${tasks.length} ${plural(tasks.length)}`;
  document.querySelectorAll('.cards').forEach((column) => {
    column.replaceChildren(...tasks.filter((task) => task.status === column.dataset.status).map(card));
  });
}

function card(task) {
  const node = document.querySelector('#task-template').content.firstElementChild.cloneNode(true);
  node.querySelector('h3').textContent = task.title;
  const select = node.querySelector('select');
  select.innerHTML = Object.entries(labels).map(([status, label]) => `<option value="${status}">${label}</option>`).join('');
  select.value = task.status;
  select.addEventListener('change', () => {
    tasks = moveTask(tasks, task.id, select.value);
    save(); render();
  });
  node.querySelector('.delete').addEventListener('click', () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    save(); render();
  });
  return node;
}

function plural(count) {
  if (count % 10 === 1 && count % 100 !== 11) return 'задача';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'задачи';
  return 'задач';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    tasks = addTask(tasks, input.value, new FormData(form).get('status'));
    input.value = ''; message.textContent = ''; save(); render(); input.focus();
  } catch (error) {
    message.textContent = error.message;
    input.focus();
  }
});

document.querySelector('#date').textContent = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date());
render();

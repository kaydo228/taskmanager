import test from 'node:test';
import assert from 'node:assert/strict';
import { addTask, moveTask } from './task-store.js';

test('addTask trims a title and places a task in Inbox', () => {
  const tasks = addTask([], '  План на неделю  ');

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].title, 'План на неделю');
  assert.equal(tasks[0].status, 'inbox');
});

test('addTask rejects an empty title', () => {
  assert.throws(() => addTask([], '   '), /Введите название задачи/);
});

test('moveTask changes only the selected task status', () => {
  const tasks = [
    { id: 'a', title: 'Первая', status: 'inbox' },
    { id: 'b', title: 'Вторая', status: 'today' },
  ];

  const next = moveTask(tasks, 'a', 'done');

  assert.equal(next[0].status, 'done');
  assert.equal(next[1].status, 'today');
});

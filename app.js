import {readTasks, visibleTasks} from './tasks.js';
const key = 'watashi-tasks-v1';
const list = document.querySelector('#tasks');
const input = document.querySelector('#task-input');
const status = document.querySelector('#status');
let tasks = [];
let filter = 'all';
let storageReadable = true;
try { tasks = readTasks(localStorage.getItem(key)); }
catch { storageReadable = false; status.textContent = '保存データを読み込めませんでした。元のデータを保護するため、今回は保存せずに利用できます。'; }
function save() {
  if (!storageReadable) return;
  try { localStorage.setItem(key, JSON.stringify(tasks)); status.textContent = ''; }
  catch { status.textContent = '保存できませんでした。ブラウザの保存設定や空き容量をご確認ください。'; }
}
function render() {
  list.replaceChildren();
  const shown = visibleTasks(tasks, filter);
  for (const task of shown) {
    const row = document.createElement('li');
    row.classList.toggle('done', task.done);
    const label = document.createElement('label');
    const check = document.createElement('input');
    check.type = 'checkbox'; check.checked = task.done;
    const text = document.createElement('span'); text.textContent = task.text;
    check.addEventListener('change', () => { task.done = check.checked; save(); render(); });
    label.append(check, text);
    const remove = document.createElement('button');
    remove.className = 'delete'; remove.textContent = '削除';
    remove.setAttribute('aria-label', `${task.text}を削除`);
    remove.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); save(); render(); });
    row.append(label, remove); list.append(row);
  }
  const empty = document.querySelector('#empty');
  empty.hidden = shown.length > 0;
  empty.textContent = tasks.length === 0 ? 'まだタスクはありません。小さなことから追加してみましょう。' : '該当するタスクはありません。';
  document.querySelector('#count').textContent = `未完了 ${tasks.filter(t => !t.done).length} 件 / 全 ${tasks.length} 件`;
}
document.querySelector('#add-form').addEventListener('submit', event => {
  event.preventDefault(); const text = input.value.trim();
  if (!text) { input.setCustomValidity('タスクを入力してください。'); input.reportValidity(); return; }
  tasks.push({id: crypto.randomUUID(), text, done:false});
  filter = 'all'; updateFilters(); input.value = ''; save(); render(); input.focus();
});
input.addEventListener('input', () => input.setCustomValidity(''));
function updateFilters() { document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter))); }
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; updateFilters(); render(); }));
render();

import {readTasks, visibleTasks, mergeTasks} from './tasks.js';
const key = 'watashi-tasks-v1';
const $ = selector => document.querySelector(selector);
const form = $('#add-form');
const input = $('#task-input');
const status = $('#status');
let tasks = [], filter = 'all', editing = null, storageReadable = true;
try { tasks = readTasks(localStorage.getItem(key)); }
catch { storageReadable = false; status.textContent = '保存データを読み込めませんでした。元のデータを保護するため、今回は保存せずに利用できます。'; }
function save() {
  if (!storageReadable) return;
  try { localStorage.setItem(key, JSON.stringify(tasks)); status.textContent = ''; }
  catch { status.textContent = '保存できませんでした。バックアップを保存し、ブラウザの保存設定や空き容量をご確認ください。'; }
}
function resetForm() {
  editing = null; form.reset(); $('#submit-task').textContent = '追加する'; $('#cancel-edit').hidden = true;
}
function edit(task) {
  editing = task.id; input.value = task.text;
  for (const field of ['due','priority','progress','memo']) $(`#task-${field}`).value = task[field];
  $('#submit-task').textContent = '変更を保存'; $('#cancel-edit').hidden = false;
  $('#details').open = true; input.focus(); form.scrollIntoView({behavior:'smooth',block:'start'});
}
function render() {
  const list = $('#tasks'); list.replaceChildren();
  for (const task of visibleTasks(tasks, filter)) {
    const row = document.createElement('li'); row.classList.toggle('done', task.done);
    const content = document.createElement('div'); content.className = 'task-content';
    const label = document.createElement('label');
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done;
    const title = document.createElement('span'); title.textContent = task.text;
    check.addEventListener('change', () => { task.done = check.checked; task.progress = task.done ? 100 : 0; if (editing === task.id) $('#task-progress').value = task.progress; save(); render(); });
    label.append(check, title); content.append(label);
    const meta = document.createElement('div'); meta.className = 'task-meta';
    const today = new Date(); const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    if (!task.done && task.due && task.due < localDate) meta.classList.add('overdue');
    meta.textContent = `${task.due ? `期限 ${task.due}` : '期限なし'} ・ 優先度 ${ {high:'高',medium:'中',low:'低'}[task.priority]} ・ 進捗 ${task.progress}%`;
    content.append(meta);
    if (task.memo) { const memo = document.createElement('p'); memo.className = 'memo'; memo.textContent = task.memo; content.append(memo); }
    const actions = document.createElement('div'); actions.className = 'task-actions';
    const change = document.createElement('button'); change.textContent = '編集'; change.setAttribute('aria-label',`${task.text}を編集`); change.addEventListener('click',()=>edit(task));
    const remove = document.createElement('button'); remove.className = 'delete'; remove.textContent = '削除'; remove.setAttribute('aria-label',`${task.text}を削除`);
    remove.addEventListener('click', () => { if (!confirm(`「${task.text}」を削除しますか？`)) return; tasks = tasks.filter(t=>t.id!==task.id); if(editing===task.id) resetForm(); save(); render(); });
    actions.append(change,remove); row.append(content,actions); list.append(row);
  }
  $('#empty').hidden = visibleTasks(tasks, filter).length > 0;
  $('#empty').textContent = tasks.length ? '該当するタスクはありません。' : 'まだタスクはありません。小さなことから追加してみましょう。';
  $('#count').textContent = `未完了 ${tasks.filter(t=>!t.done).length} 件 / 全 ${tasks.length} 件`;
}
form.addEventListener('submit', event => {
  event.preventDefault(); const text = input.value.trim();
  if (!text) { input.setCustomValidity('タスクを入力してください。'); input.reportValidity(); return; }
  const progress = Number($('#task-progress').value);
  const task = {id:editing ?? crypto.randomUUID(),text,due:$('#task-due').value,priority:$('#task-priority').value,progress,done:progress===100,memo:$('#task-memo').value};
  try { readTasks(JSON.stringify([task])); } catch { status.textContent = '入力内容をご確認ください。期限と進捗は有効な値を入力してください。'; return; }
  if (editing) tasks = tasks.map(t=>t.id===editing?task:t); else tasks.push(task);
  resetForm(); filter='all'; updateFilters(); save(); render(); input.focus();
});
input.addEventListener('input',()=>input.setCustomValidity(''));
$('#cancel-edit').addEventListener('click',resetForm);
function updateFilters() { document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter))); }
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;updateFilters();render();}));
$('#export').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(tasks,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`tasks-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('#import').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    if(file.size>5*1024*1024)throw Error('File too large');
    const incoming=readTasks(await file.text());
    const merged=mergeTasks(tasks,incoming); const added=merged.length-tasks.length;
    tasks=merged;save();render();
    if(storageReadable && !status.textContent)status.textContent=`${added}件を復元しました。同じIDのタスクは既存の内容を残します。`;
  } catch { status.textContent='復元できませんでした。このアプリから保存した5MB以下のバックアップファイルを選んでください。'; }
  finally{event.target.value='';}
});
render();

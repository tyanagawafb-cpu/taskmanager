import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readTasks, visibleTasks} from '../tasks.js';
test('保存した日本語タスクを復元し、完了状態で絞り込める', () => {
  const tasks = [{id:'1',text:'買い物',done:false},{id:'2',text:'読書',done:true}];
  const restored = readTasks(JSON.stringify(tasks));
  assert.deepEqual(restored, tasks);
  assert.deepEqual(visibleTasks(restored,'active'), [tasks[0]]);
  assert.deepEqual(visibleTasks(restored,'done'), [tasks[1]]);
  assert.equal(visibleTasks(restored,'all').length, 2);
});
test('未保存の場合は空で開始し、壊れたデータは検出する', () => {
  assert.deepEqual(readTasks(null), []);
  for (const value of ['{', '{}', '[null]', '[{"id":"1","text":"x"}]']) assert.throws(() => readTasks(value));
});

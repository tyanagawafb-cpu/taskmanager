import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readTasks, visibleTasks, mergeTasks} from '../tasks.js';
const base={id:'1',text:'資料作成',done:false,due:'2026-11-10',priority:'high',progress:40,memo:'図を追加\n確認を依頼'};
test('詳細情報を保存・復元し、進捗100%を完了として絞り込む',()=>{
  assert.deepEqual(readTasks(JSON.stringify([base])),[base]);
  const tasks=readTasks(JSON.stringify([base,{...base,id:'2',progress:100}]));
  assert.equal(tasks[1].done,true);
  assert.deepEqual(visibleTasks(tasks,'active'),[tasks[0]]);
  assert.deepEqual(visibleTasks(tasks,'done'),[tasks[1]]);
});
test('以前のタスクに初期値を補い、完了状態を引き継ぐ',()=>{
  const restored=readTasks(JSON.stringify([{id:'1',text:'買い物',done:true}]));
  assert.deepEqual(restored,[{id:'1',text:'買い物',done:true,due:'',priority:'medium',progress:100,memo:''}]);
  assert.deepEqual(readTasks(null),[]);
});
test('不正なバックアップ、重複ID、存在しない日付を拒否する',()=>{
  for(const value of ['{','{}','[null]',JSON.stringify([base,base])])assert.throws(()=>readTasks(value));
  for(const patch of [{due:'2026-02-30'},{due:3},{progress:101},{progress:2.5},{priority:'urgent'},{memo:2},{text:' '}])assert.throws(()=>readTasks(JSON.stringify([{...base,...patch}])));
});
test('バックアップを追加復元して既存のタスクを保護する',()=>{
  const changed={...base,text:'過去の内容'};
  const other={...base,id:'2'};
  assert.deepEqual(mergeTasks([base],[changed,other]),[base,other]);
});

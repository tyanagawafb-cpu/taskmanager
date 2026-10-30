export function readTasks(value) {
  const data = JSON.parse(value ?? '[]');
  if (!Array.isArray(data) || new Set(data.map(t => t?.id)).size !== data.length) throw new Error('Invalid tasks');
  return data.map(t => {
    if (!t || typeof t.id !== 'string' || !t.id || typeof t.text !== 'string' || !t.text.trim() || t.text.length > 200 || typeof t.done !== 'boolean') throw new Error('Invalid task');
    const due = t.due ?? '';
    const priority = t.priority ?? 'medium';
    const progress = t.progress ?? (t.done ? 100 : 0);
    const memo = t.memo ?? '';
    if (typeof due !== 'string' || (due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(Date.parse(due)) || new Date(due).toISOString().slice(0,10) !== due)) || !['high','medium','low'].includes(priority) || !Number.isInteger(progress) || progress < 0 || progress > 100 || typeof memo !== 'string' || memo.length > 5000) throw new Error('Invalid details');
    return {id:t.id, text:t.text, done:progress === 100, due, priority, progress, memo};
  });
}
export function visibleTasks(tasks, filter) {
  return tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done));
}
export function mergeTasks(current, incoming) {
  const ids = new Set(current.map(t => t.id));
  return [...current, ...incoming.filter(t => !ids.has(t.id))];
}

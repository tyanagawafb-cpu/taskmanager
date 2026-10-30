export function readTasks(value) {
  const data = JSON.parse(value ?? '[]');
  if (!Array.isArray(data) || !data.every(t => t && typeof t.id === 'string' && typeof t.text === 'string' && typeof t.done === 'boolean') || new Set(data.map(t => t.id)).size !== data.length) throw new Error('Invalid tasks');
  return data;
}
export function visibleTasks(tasks, filter) {
  return tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done));
}

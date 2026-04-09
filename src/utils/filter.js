const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2, None: 3 };

export function filterAndSort(todos, filter) {
  let filtered = todos;

  if (filter === 'active') {
    filtered = todos.filter((t) => t.status !== 'Done');
  } else if (filter === 'done') {
    filtered = todos.filter((t) => t.status === 'Done');
  }

  return filtered.sort((a, b) => {
    // Done items go to bottom
    if (a.status === 'Done' && b.status !== 'Done') return 1;
    if (a.status !== 'Done' && b.status === 'Done') return -1;

    // Sort by priority
    const pa = PRIORITY_ORDER[a.priority] ?? 3;
    const pb = PRIORITY_ORDER[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;

    // Sort by due date (earlier first, null last)
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    return 0;
  });
}

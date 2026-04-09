import React from 'react';
import '../styles/todoItem.css';

const STATUS_ICONS = {
  'Not started': '⬜',
  'In progress': '🔵',
  Done: '✅',
};

const PRIORITY_COLORS = {
  High: '#ff6b6b',
  Medium: '#ffa94d',
  Low: '#69db7c',
  None: '#adb5bd',
};

export default function TodoItem({ todo, onStatusChange, onOpenPage }) {
  const { id, title, status, priority, dueDate, url, tags } = todo;

  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'Done';

  return (
    <li className={`todo-item ${status === 'Done' ? 'todo-done' : ''}`}>
      <button
        className="status-btn"
        onClick={() => onStatusChange(id)}
        title={`상태 변경: ${status}`}
      >
        {STATUS_ICONS[status] || '⬜'}
      </button>

      <div className="todo-content">
        <div className="todo-title-row">
          <span className={`todo-text ${status === 'Done' ? 'line-through' : ''}`}>
            {title}
          </span>
          <button
            className="notion-link"
            onClick={() => onOpenPage(url)}
            title="Notion에서 열기"
          >
            🔗
          </button>
        </div>

        <div className="todo-meta">
          {priority && priority !== 'None' && (
            <span
              className="priority-badge"
              style={{ backgroundColor: PRIORITY_COLORS[priority] }}
            >
              {priority}
            </span>
          )}
          {dueDate && (
            <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
              📅 {dueDate}
            </span>
          )}
          {tags.map((tag) => (
            <span key={tag} className="tag-badge">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

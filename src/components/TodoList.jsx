import React from 'react';
import TodoItem from './TodoItem';
import '../styles/todoList.css';

const FILTER_OPTIONS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'done', label: '완료' },
];

export default function TodoList({
  todos,
  filter,
  onFilterChange,
  onStatusChange,
  onOpenPage,
  onRefresh,
  onDisconnect,
  isLoading,
  error,
}) {
  return (
    <div className="todo-panel">
      {/* Header */}
      <div className="todo-header">
        <h2 className="todo-title">Laon Focus</h2>
        <div className="todo-header-actions">
          <button
            className={`refresh-btn ${isLoading ? 'spinning' : ''}`}
            onClick={onRefresh}
            disabled={isLoading}
            title="새로고침"
          >
            🔄
          </button>
          {onDisconnect && (
            <button
              className="disconnect-btn"
              onClick={onDisconnect}
              title="Notion 연결 해제"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-tab ${filter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="todo-error">{error}</div>}

      {/* List */}
      <div className="todo-list-scroll">
        {isLoading && todos.length === 0 ? (
          <div className="todo-loading">
            <span className="loading-cat">🐱</span>
            <p>불러오는 중...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="todo-empty">
            <span className="empty-icon">✨</span>
            <p>
              {filter === 'done'
                ? '완료된 할 일이 없다냥'
                : filter === 'active'
                  ? '진행 중인 할 일이 없다냥'
                  : '할 일이 없다냥! 🎉'}
            </p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onStatusChange={onStatusChange}
                onOpenPage={onOpenPage}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

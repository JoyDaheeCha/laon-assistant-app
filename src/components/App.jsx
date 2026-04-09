import React, { useState, useEffect, useCallback } from 'react';
import LaonMascot from './LaonMascot';
import TodoList from './TodoList';
import { filterAndSort } from '../utils/filter';
import '../styles/app.css';

const STATUS_CYCLE = ['Not started', 'In progress', 'Done'];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all | active | done
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await window.laonAPI.getTodos();
      setTodos(data);
    } catch (err) {
      setError('Notion 연결 실패! 토큰을 확인해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (!window.laonAPI?.onWindowBlur) return;
    const cleanup = window.laonAPI.onWindowBlur(() => {
      // Don't auto-close on blur for better UX
    });
    return cleanup;
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) fetchTodos();
  };

  const handleStatusChange = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const currentIndex = STATUS_CYCLE.indexOf(todo.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    const result = await window.laonAPI.updateStatus(id, nextStatus);
    if (!result.success) {
      // Revert on failure
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: todo.status } : t))
      );
    }
  };

  const handleOpenPage = (url) => {
    window.laonAPI.openPage(url);
  };

  const filteredTodos = filterAndSort(todos, filter);

  const activeTodoCount = todos.filter((t) => t.status !== 'Done').length;

  // Click-through: UI 요소 위에서만 클릭 가능, 나머지는 투과
  const handleMouseEnterUI = () => {
    window.laonAPI?.setIgnoreMouse(false);
  };
  const handleMouseLeaveUI = () => {
    window.laonAPI?.setIgnoreMouse(true);
  };

  return (
    <div className="app-container">
      <div onMouseEnter={handleMouseEnterUI} onMouseLeave={handleMouseLeaveUI}>
        <LaonMascot
          onClick={handleToggle}
          isOpen={isOpen}
          activeTodoCount={activeTodoCount}
        />
      </div>
      {isOpen && (
        <div className="todo-panel-wrapper" onMouseEnter={handleMouseEnterUI} onMouseLeave={handleMouseLeaveUI}>
          <TodoList
            todos={filteredTodos}
            filter={filter}
            onFilterChange={setFilter}
            onStatusChange={handleStatusChange}
            onOpenPage={handleOpenPage}
            onRefresh={fetchTodos}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

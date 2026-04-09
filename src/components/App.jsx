import React, { useState, useEffect, useCallback } from 'react';
import LaonMascot from './LaonMascot';
import TodoList from './TodoList';
import SetupScreen from './SetupScreen';
import { filterAndSort } from '../utils/filter';
import '../styles/app.css';

const STATUS_CYCLE = ['Not started', 'In progress', 'Done'];

export default function App() {
  const [authState, setAuthState] = useState('loading'); // loading | setup | ready
  const [todos, setTodos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  // Check auth status on mount
  useEffect(() => {
    (async () => {
      try {
        const status = await window.laonAPI.getAuthStatus();
        setAuthState(status.configured ? 'ready' : 'setup');
      } catch {
        setAuthState('setup');
      }
    })();
  }, []);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await window.laonAPI.getTodos();
      setTodos(data);
    } catch (err) {
      setError('Notion 연결 실패! 설정을 확인해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState === 'ready') fetchTodos();
  }, [authState, fetchTodos]);

  useEffect(() => {
    if (!window.laonAPI?.onWindowBlur) return;
    const cleanup = window.laonAPI.onWindowBlur(() => {});
    return cleanup;
  }, []);

  const handleSetupComplete = () => {
    setAuthState('ready');
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) fetchTodos();
  };

  const handleStatusChange = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const currentIndex = STATUS_CYCLE.indexOf(todo.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    const result = await window.laonAPI.updateStatus(id, nextStatus);
    if (!result.success) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: todo.status } : t))
      );
    }
  };

  const handleOpenPage = (url) => {
    window.laonAPI.openPage(url);
  };

  const handleDisconnect = async () => {
    await window.laonAPI.logout();
    setTodos([]);
    setIsOpen(false);
    setAuthState('setup');
  };

  const filteredTodos = filterAndSort(todos, filter);
  const activeTodoCount = todos.filter((t) => t.status !== 'Done').length;

  const handleMouseEnterUI = () => {
    window.laonAPI?.setIgnoreMouse(false);
  };
  const handleMouseLeaveUI = () => {
    window.laonAPI?.setIgnoreMouse(true);
  };

  if (authState === 'loading') return null;

  if (authState === 'setup') {
    return (
      <div className="app-container">
        <div onMouseEnter={handleMouseEnterUI} onMouseLeave={handleMouseLeaveUI}>
          <SetupScreen onComplete={handleSetupComplete} />
        </div>
      </div>
    );
  }

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
            onDisconnect={handleDisconnect}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

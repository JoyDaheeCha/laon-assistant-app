import React, { useState, useEffect } from 'react';
import '../styles/setup.css';

export default function SetupScreen({ onComplete }) {
  const [step, setStep] = useState('connect'); // connect | select-db
  const [isConnecting, setIsConnecting] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [isLoadingDbs, setIsLoadingDbs] = useState(false);
  const [error, setError] = useState(null);
  const [workspaceName, setWorkspaceName] = useState(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await window.laonAPI.startAuth();
      if (result.success) {
        setWorkspaceName(result.workspaceName);
        setStep('select-db');
        loadDatabases();
      } else {
        setError(result.error || '연결에 실패했습니다.');
      }
    } catch (err) {
      setError('연결 중 오류가 발생했습니다.');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadDatabases = async () => {
    setIsLoadingDbs(true);
    setError(null);
    try {
      const result = await window.laonAPI.listDatabases();
      if (result.success) {
        setDatabases(result.databases);
      } else {
        setError(result.error || '데이터베이스 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('데이터베이스 목록 로딩 실패');
    } finally {
      setIsLoadingDbs(false);
    }
  };

  // Check if already authenticated but needs DB selection
  useEffect(() => {
    (async () => {
      const status = await window.laonAPI.getAuthStatus();
      if (status.authenticated && !status.configured) {
        setWorkspaceName(status.workspaceName);
        setStep('select-db');
        loadDatabases();
      }
    })();
  }, []);

  const handleSelectDb = async (db) => {
    await window.laonAPI.selectDatabase(db.id, db.title);
    onComplete();
  };

  if (step === 'connect') {
    return (
      <div className="setup-container">
        <img
          className="setup-mascot"
          src="laon_floating_img.png"
          alt="Laon"
          draggable={false}
        />
        <h2 className="setup-title">반갑다냥!</h2>
        <p className="setup-desc">
          Notion과 연결하면<br />할 일을 함께 관리할 수 있다냥
        </p>

        {error && <div className="setup-error">{error}</div>}

        <button
          className="setup-connect-btn"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? '연결 중...' : 'Notion 연결하기'}
        </button>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <h2 className="setup-title">
        {workspaceName ? `${workspaceName}` : 'Notion'} 연결 완료!
      </h2>
      <p className="setup-desc">사용할 데이터베이스를 선택해달라냥</p>

      {error && <div className="setup-error">{error}</div>}

      {isLoadingDbs ? (
        <div className="setup-loading">
          <span className="loading-cat">🐱</span>
          <p>불러오는 중...</p>
        </div>
      ) : databases.length === 0 ? (
        <div className="setup-empty">
          <p>공유된 데이터베이스가 없다냥!</p>
          <p className="setup-hint">
            Notion에서 연결 시 데이터베이스가 포함된<br />
            페이지를 공유했는지 확인해달라냥
          </p>
          <button className="setup-retry-btn" onClick={loadDatabases}>
            다시 불러오기
          </button>
        </div>
      ) : (
        <ul className="setup-db-list">
          {databases.map((db) => (
            <li key={db.id}>
              <button
                className="setup-db-item"
                onClick={() => handleSelectDb(db)}
              >
                <span className="db-icon">{db.icon}</span>
                <span className="db-title">{db.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

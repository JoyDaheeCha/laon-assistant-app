import React, { useState, useEffect } from 'react';
import '../styles/setup.css';

export default function SetupScreen({ onComplete }) {
  const [step, setStep] = useState('connect'); // connect | setting-up
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await window.laonAPI.startAuth();
      if (result.success) {
        setStep('setting-up');
        await setupDatabase();
      } else {
        setError(result.error || '연결에 실패했습니다.');
      }
    } catch (err) {
      setError('연결 중 오류가 발생했습니다.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancel = async () => {
    await window.laonAPI.cancelAuth();
    setIsConnecting(false);
    setError(null);
  };

  const setupDatabase = async () => {
    setError(null);
    try {
      const result = await window.laonAPI.autoSetupDatabase();
      if (result.success) {
        onComplete();
      } else {
        setError(result.error || '데이터베이스 생성에 실패했습니다.');
        setStep('connect');
      }
    } catch (err) {
      setError('데이터베이스 설정 중 오류가 발생했습니다.');
      setStep('connect');
    }
  };

  // If already authenticated but DB not set up
  useEffect(() => {
    (async () => {
      const status = await window.laonAPI.getAuthStatus();
      if (status.authenticated && !status.configured) {
        setStep('setting-up');
        await setupDatabase();
      }
    })();
  }, []);

  if (step === 'setting-up') {
    return (
      <div className="setup-container">
        <img
          className="setup-mascot"
          src="laon_floating_img.png"
          alt="Laon"
          draggable={false}
        />
        <h2 className="setup-title">설정 중이다냥...</h2>
        <p className="setup-desc">Notion에 할 일 목록을 만들고 있다냥</p>
        <div className="setup-loading">
          <span className="loading-cat">🐱</span>
        </div>
      </div>
    );
  }

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
        onClick={isConnecting ? handleCancel : handleConnect}
      >
        {isConnecting ? '취소하기' : 'Notion 연결하기'}
      </button>
    </div>
  );
}

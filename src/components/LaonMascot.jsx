import React, { useState, useRef, useCallback } from 'react';
import '../styles/mascot.css';

export default function LaonMascot({ onClick, isOpen, activeTodoCount, position, onDrag }) {
  const [isHovered, setIsHovered] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posRef = useRef(position);
  posRef.current = position;

  const handleMouseDown = useCallback((e) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragStart.current.x;
      const dy = moveEvent.clientY - dragStart.current.y;
      if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isDragging.current = true;
      }
      if (isDragging.current) {
        onDrag({
          x: posRef.current.x + dx,
          y: posRef.current.y - dy,
        });
        dragStart.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onDrag]);

  const handleClick = (e) => {
    if (isDragging.current) {
      e.stopPropagation();
      return;
    }
    onClick();
  };

  return (
    <div
      className={`mascot-container ${isOpen ? 'mascot-active' : ''} ${isHovered ? 'mascot-hovered' : ''}`}
      style={{ left: position.x, bottom: position.y }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`할 일 ${activeTodoCount}개 남았다냥!`}
    >
      <img
        className="mascot-image"
        src="laon_floating_img.png"
        alt="Laon 고양이"
        draggable={false}
      />

      {/* Badge */}
      {activeTodoCount > 0 && (
        <div className="mascot-badge">{activeTodoCount}</div>
      )}

      {/* Speech bubble on hover */}
      {isHovered && !isOpen && (
        <div className="mascot-speech">
          {activeTodoCount === 0
            ? '다 끝냈다냥! 🎉'
            : `할 일 ${activeTodoCount}개 남았다냥!`}
        </div>
      )}
    </div>
  );
}

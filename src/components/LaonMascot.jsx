import React, { useState } from 'react';
import '../styles/mascot.css';

export default function LaonMascot({ onClick, isOpen, activeTodoCount }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`mascot-container ${isOpen ? 'mascot-active' : ''} ${isHovered ? 'mascot-hovered' : ''}`}
      onClick={onClick}
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

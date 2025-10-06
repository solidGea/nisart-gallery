import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  active, 
  duration = 3000, 
  pieceCount = 50 
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7ca18', '#e74c3c',
    '#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#1abc9c'
  ];

  useEffect(() => {
    if (active && !isActive) {
      setIsActive(true);
      
      // Create confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          speedX: (Math.random() - 0.5) * 4,
          speedY: Math.random() * 3 + 1,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }
      setPieces(newPieces);

      // Animation loop
      const animationId = setInterval(() => {
        setPieces(currentPieces => 
          currentPieces.map(piece => ({
            ...piece,
            x: piece.x + piece.speedX,
            y: piece.y + piece.speedY,
            rotation: piece.rotation + piece.rotationSpeed,
            speedY: piece.speedY + 0.1 // gravity
          })).filter(piece => piece.y < window.innerHeight + 10)
        );
      }, 16);

      // Clean up after duration
      const timeoutId = setTimeout(() => {
        clearInterval(animationId);
        setPieces([]);
        setIsActive(false);
      }, duration);

      return () => {
        clearInterval(animationId);
        clearTimeout(timeoutId);
      };
    }
  }, [active, isActive, duration, pieceCount, colors]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '2px'
          }}
        />
      ))}
    </div>
  );
};

// Success animation component
interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  show, 
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <>
      <Confetti active={show} duration={2000} pieceCount={60} />
      
      {/* Success message overlay */}
      <div
        className={`
          fixed inset-0 flex items-center justify-center z-50 pointer-events-none
          transition-opacity duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-green-400 animate-bounce">
          <div className="text-6xl text-green-500">🎉</div>
        </div>
      </div>
    </>
  );
};
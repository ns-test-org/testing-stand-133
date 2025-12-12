'use client';

import { useEffect, useRef, useState } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const pacmanRef = useRef<Position>({ x: 10, y: 10 });
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const dotsRef = useRef<boolean[][]>([]);
  const ghostsRef = useRef<Position[]>([
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 5, y: 15 },
    { x: 15, y: 15 }
  ]);

  useEffect(() => {
    // Initialize dots
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      // Update direction
      directionRef.current = nextDirectionRef.current;

      // Move Pac-Man
      const newPos = { ...pacmanRef.current };
      switch (directionRef.current) {
        case 'UP':
          newPos.y = (newPos.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          newPos.y = (newPos.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          newPos.x = (newPos.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          newPos.x = (newPos.x + 1) % GRID_SIZE;
          break;
      }
      pacmanRef.current = newPos;

      // Check collision with ghosts
      for (const ghost of ghostsRef.current) {
        if (ghost.x === newPos.x && ghost.y === newPos.y) {
          setGameOver(true);
          return;
        }
      }

      // Eat dot
      if (dotsRef.current[newPos.y][newPos.x]) {
        dotsRef.current[newPos.y][newPos.x] = false;
        setScore(prev => prev + 10);
      }

      // Move ghosts randomly
      ghostsRef.current = ghostsRef.current.map(ghost => {
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const newGhost = { ...ghost };
        
        switch (randomDir) {
          case 'UP':
            newGhost.y = (newGhost.y - 1 + GRID_SIZE) % GRID_SIZE;
            break;
          case 'DOWN':
            newGhost.y = (newGhost.y + 1) % GRID_SIZE;
            break;
          case 'LEFT':
            newGhost.x = (newGhost.x - 1 + GRID_SIZE) % GRID_SIZE;
            break;
          case 'RIGHT':
            newGhost.x = (newGhost.x + 1) % GRID_SIZE;
            break;
        }
        return newGhost;
      });

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dots
      ctx.fillStyle = '#fff';
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (dotsRef.current[y][x]) {
            ctx.beginPath();
            ctx.arc(
              x * CELL_SIZE + CELL_SIZE / 2,
              y * CELL_SIZE + CELL_SIZE / 2,
              2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }

      // Draw Pac-Man
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(
        pacmanRef.current.x * CELL_SIZE + CELL_SIZE / 2,
        pacmanRef.current.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0.2 * Math.PI,
        1.8 * Math.PI
      );
      ctx.lineTo(
        pacmanRef.current.x * CELL_SIZE + CELL_SIZE / 2,
        pacmanRef.current.y * CELL_SIZE + CELL_SIZE / 2
      );
      ctx.fill();

      // Draw ghosts
      ghostsRef.current.forEach((ghost, i) => {
        const colors = ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'];
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(
          ghost.x * CELL_SIZE + CELL_SIZE / 2,
          ghost.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2 - 2,
          Math.PI,
          0
        );
        ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 2, ghost.y * CELL_SIZE + CELL_SIZE - 2);
        ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 5, ghost.y * CELL_SIZE + CELL_SIZE / 2 + 3);
        ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE / 2, ghost.y * CELL_SIZE + CELL_SIZE - 2);
        ctx.lineTo(ghost.x * CELL_SIZE + 5, ghost.y * CELL_SIZE + CELL_SIZE / 2 + 3);
        ctx.lineTo(ghost.x * CELL_SIZE + 2, ghost.y * CELL_SIZE + CELL_SIZE - 2);
        ctx.closePath();
        ctx.fill();
      });

    }, INITIAL_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && !gameOver) {
        setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          nextDirectionRef.current = 'UP';
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
          nextDirectionRef.current = 'DOWN';
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
          nextDirectionRef.current = 'LEFT';
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
          nextDirectionRef.current = 'RIGHT';
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    pacmanRef.current = { x: 10, y: 10 };
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    ghostsRef.current = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 5, y: 15 },
      { x: 15, y: 15 }
    ];
    
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;
    
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">PAC-MAN</h1>
      <div className="mb-4 text-2xl">Score: {score}</div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-4 border-blue-500 bg-black"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-xl mb-2">Press any arrow key to start</p>
              <p className="text-sm text-gray-400">Use arrow keys or WASD to move</p>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-2xl mb-4">Game Over!</p>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Eat all the dots and avoid the ghosts!</p>
      </div>
    </div>
  );
}


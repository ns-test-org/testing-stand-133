'use client';

import { useEffect, useState } from 'react';

type Card = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  floatOffset: number;
  driftX: number;
  driftY: number;
};

const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹'];

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const cardPairs = [...emojis, ...emojis];
    const shuffled = cardPairs
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
        floatOffset: Math.random() * 20 - 10, // Random float offset
        driftX: Math.random() * 10 - 5, // Random horizontal drift
        driftY: Math.random() * 10 - 5, // Random vertical drift
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    setCards(cards.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    ));

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);
      
      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard?.value === secondCard?.value) {
        // Match found
        setTimeout(() => {
          setCards(cards.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isMatched: true } 
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
          
          // Check if game is won
          const allMatched = cards.every(c => 
            c.id === first || c.id === second || c.isMatched
          );
          if (allMatched) {
            setGameWon(true);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards(cards.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Memory Match v2</h1>
          <div className="flex justify-center gap-8 text-white text-xl">
            <div>Moves: <span className="font-bold">{moves}</span></div>
            <button 
              onClick={initializeGame}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              New Game
            </button>
          </div>
        </div>

        {gameWon && (
          <div className="text-center mb-6 text-white text-2xl font-bold animate-bounce">
            🎉 You Won in {moves} moves! 🎉
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isChecking || card.isMatched}
              style={{
                animation: `float-${card.id} ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${card.floatOffset / 10}s`,
                transform: `translate(${card.driftX}px, ${card.driftY}px)`,
              }}
              className={`aspect-square rounded-xl text-5xl flex items-center justify-center transition-all duration-300 transform shadow-2xl ${
                card.isFlipped || card.isMatched
                  ? 'bg-white rotate-0'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-110'
              } ${card.isMatched ? 'opacity-50' : ''}`}
            >
              {(card.isFlipped || card.isMatched) ? card.value : '?'}
            </button>
          ))}
        </div>
        
        <style jsx>{`
          ${cards.map((card) => `
            @keyframes float-${card.id} {
              0%, 100% {
                transform: translate(${card.driftX}px, ${card.driftY}px) translateY(0px) rotate(0deg);
              }
              25% {
                transform: translate(${card.driftX + 3}px, ${card.driftY - 5}px) translateY(-15px) rotate(2deg);
              }
              50% {
                transform: translate(${card.driftX - 2}px, ${card.driftY + 3}px) translateY(-8px) rotate(-1deg);
              }
              75% {
                transform: translate(${card.driftX + 4}px, ${card.driftY - 2}px) translateY(-12px) rotate(1deg);
              }
            }
          `).join('\n')}
        `}</style>

        <div className="mt-8 text-center text-white/80 text-sm">
          ✨ Cards float and drift in zero gravity! Match all pairs to win! ✨
        </div>
      </div>
    </div>
  );
}







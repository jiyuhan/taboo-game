'use client';

import { useState, useEffect, useCallback } from 'react';
import CategorySelection from '@/components/CategorySelection';
import GamePlay from '@/components/GamePlay';
import GameOver from '@/components/GameOver';

export type GameState = 'category-select' | 'playing' | 'game-over';

export interface GameStats {
  score: number;
  skips: number;
  correctGuesses: number;
  timeRemaining: number;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('category-select');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    skips: 0,
    correctGuesses: 0,
    timeRemaining: 300, // 5 minutes in seconds
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setGameState('playing');
    setStats({
      score: 0,
      skips: 0,
      correctGuesses: 0,
      timeRemaining: 300,
    });
  };

  const handleGameEnd = () => {
    setGameState('game-over');
  };

  const handlePlayAgain = () => {
    setGameState('category-select');
    setSelectedCategory('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        {gameState === 'category-select' && (
          <CategorySelection onSelectCategory={handleCategorySelect} />
        )}
        
        {gameState === 'playing' && (
          <GamePlay
            category={selectedCategory}
            stats={stats}
            setStats={setStats}
            onGameEnd={handleGameEnd}
          />
        )}
        
        {gameState === 'game-over' && (
          <GameOver stats={stats} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    </main>
  );
}
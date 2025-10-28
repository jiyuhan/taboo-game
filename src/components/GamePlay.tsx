'use client';

import { useState, useEffect, useRef } from 'react';
import { GameStats } from '@/app/page';

interface GamePlayProps {
  category: string;
  stats: GameStats;
  setStats: React.Dispatch<React.SetStateAction<GameStats>>;
  onGameEnd: () => void;
}

export default function GamePlay({ category, stats, setStats, onGameEnd }: GamePlayProps) {
  const [wordList, setWordList] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [clue, setClue] = useState<string>('');
  const [userGuess, setUserGuess] = useState<string>('');
  const [isLoadingWords, setIsLoadingWords] = useState<boolean>(true);
  const [isLoadingClue, setIsLoadingClue] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'skip' | null>(null);
  const [clueHistory, setClueHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    if (stats.timeRemaining <= 0) {
      onGameEnd();
      return;
    }

    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [stats.timeRemaining, onGameEnd, setStats]);

  // Fetch all words for the category on mount
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoadingWords(true);
      try {
        console.log(`get-words ${category}`);
        const response = await fetch('/api/get-words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, count: 30 }), // Get 30 words
        });
        
        const data = await response.json();
        console.log(`get-words response ${JSON.stringify(response, null, 2)}`);
        
        if (data.words && data.words.length > 0) {
          setWordList(data.words);
          setCurrentWordIndex(0);
        } else {
          console.error('No words received');
          setClue("Oops! Couldn't load words. Please try again.");
        }
      } catch (error) {
        console.error('Error fetching words:', error);
        setClue("Oops! My AI brain had a glitch loading words. Please refresh!");
      } finally {
        setIsLoadingWords(false);
      }
    };

    fetchWords();
  }, [category]);

  // Fetch clue when word changes
  useEffect(() => {
    if (wordList.length > 0 && currentWordIndex < wordList.length) {
      const word = wordList[currentWordIndex];
      setCurrentWord(word);
      fetchClueForWord(word);
    }
  }, [wordList, currentWordIndex]);

  // Fetch clue for a specific word
  const fetchClueForWord = async (word: string, previousClues: string[] = []) => {
    setIsLoadingClue(true);
    setClueHistory(previousClues);
    
    try {
      console.log(`get-clue with word ${word}`);
      const response = await fetch('/api/get-clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, previousClues }),
      });

      const data = await response.json();
      setClue(data.clue);
      setClueHistory([...previousClues, data.clue]);
    } catch (error) {
      console.error('Error fetching clue:', error);
      setClue("Oops! My AI brain had a glitch. Try another clue!");
    } finally {
      setIsLoadingClue(false);
    }
  };

  // Get additional clue for same word
  const getAnotherClue = async () => {
    if (currentWord) {
      await fetchClueForWord(currentWord, clueHistory);
    }
  };

  // Move to next word
  const moveToNextWord = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setClueHistory([]);
    } else {
      // No more words, end the game
      onGameEnd();
    }
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim() || isLoadingClue || isLoadingWords) return;

    const guess = userGuess.trim().toLowerCase();
    const target = currentWord.toLowerCase();

    if (guess === target) {
      // Correct guess!
      setShowFeedback('correct');
      setStats((prev) => ({
        ...prev,
        score: prev.score + 10,
        correctGuesses: prev.correctGuesses + 1,
      }));

      setTimeout(() => {
        setShowFeedback(null);
        setUserGuess('');
        moveToNextWord();
      }, 1500);
    } else {
      // Wrong guess - get another clue
      setUserGuess('');
      await getAnotherClue();
    }
  };

  const handleSkip = () => {
    setShowFeedback('skip');
    setStats((prev) => ({
      ...prev,
      skips: prev.skips + 1,
    }));

    setTimeout(() => {
      setShowFeedback(null);
      setUserGuess('');
      moveToNextWord();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (stats.timeRemaining / 300) * 100;
  const timeColor = 
    timePercentage > 50 ? 'bg-green-500' : 
    timePercentage > 20 ? 'bg-yellow-500' : 
    'bg-red-500';

  const isLoading = isLoadingWords || isLoadingClue;

  return (
    <div className="w-full max-w-4xl">
      {/* Header Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white">
            <p className="text-sm opacity-80">Category</p>
            <p className="text-2xl font-bold">{category}</p>
          </div>
          <div className="text-right text-white">
            <p className="text-sm opacity-80">Score</p>
            <p className="text-4xl font-bold">{stats.score}</p>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${timeColor} transition-all duration-1000 ease-linear`}
            style={{ width: `${timePercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow">
              {formatTime(stats.timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-white text-sm">
          <div>✅ Correct: <span className="font-bold">{stats.correctGuesses}</span></div>
          <div>⏭️ Skipped: <span className="font-bold">{stats.skips}</span></div>
          {!isLoadingWords && wordList.length > 0 && (
            <div>📝 Words Left: <span className="font-bold">{wordList.length - currentWordIndex}</span></div>
          )}
        </div>
      </div>

      {/* Clue Display */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 min-h-[250px] relative overflow-hidden">
        {showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 animate-fade-in">
            {showFeedback === 'correct' ? (
              <div className="text-center">
                <div className="text-8xl mb-4">🎉</div>
                <p className="text-4xl font-bold text-green-600">Correct!</p>
                <p className="text-xl text-gray-600 mt-2">+10 points</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-4">⏭️</div>
                <p className="text-4xl font-bold text-orange-600">Skipped!</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="text-5xl">🤖</div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">AI's Clue:</p>
            {isLoadingWords ? (
              <div className="flex items-center gap-2">
                <div className="animate-bounce">🎲</div>
                <p className="text-xl text-gray-400 italic">Loading words for this category...</p>
              </div>
            ) : isLoadingClue ? (
              <div className="flex items-center gap-2">
                <div className="animate-bounce">🤔</div>
                <p className="text-xl text-gray-400 italic">Thinking of a clever clue...</p>
              </div>
            ) : (
              <p className="text-2xl text-gray-800 leading-relaxed">{clue}</p>
            )}
            
            {clueHistory.length > 1 && !isLoadingClue && !isLoadingWords && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Previous clues:</p>
                {clueHistory.slice(0, -1).map((oldClue, idx) => (
                  <p key={idx} className="text-sm text-gray-600 italic">• {oldClue}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGuess} className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Type your guess here..."
            className="flex-1 px-6 py-4 text-xl rounded-xl border-2 border-gray-200 
                     focus:border-purple-500 focus:outline-none transition-colors"
            disabled={isLoading || showFeedback !== null}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !userGuess.trim() || showFeedback !== null}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white 
                     font-bold text-xl rounded-xl hover:shadow-lg hover:scale-105 
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:scale-100"
          >
            Guess
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading || showFeedback !== null}
            className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl 
                     hover:bg-orange-600 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            ⏭️ Skip Word
          </button>
          <button
            type="button"
            onClick={getAnotherClue}
            disabled={isLoading || showFeedback !== null}
            className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl 
                     hover:bg-blue-600 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            💡 Get Another Clue
          </button>
        </div>
      </form>

      <p className="text-center text-white/80 text-sm mt-4">
        Hint: Type the exact word the AI is describing!
      </p>
    </div>
  );
}
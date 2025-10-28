import { GameStats } from '@/app/page';

interface GameOverProps {
  stats: GameStats;
  onPlayAgain: () => void;
}

export default function GameOver({ stats, onPlayAgain }: GameOverProps) {
  const getPerformanceMessage = () => {
    if (stats.score >= 100) {
      return {
        emoji: '🏆',
        title: 'LEGENDARY!',
        message: 'You\'re a word-guessing genius! The AI is impressed!',
      };
    } else if (stats.score >= 70) {
      return {
        emoji: '🌟',
        title: 'AMAZING!',
        message: 'Wow! You crushed it! The AI had to work hard!',
      };
    } else if (stats.score >= 40) {
      return {
        emoji: '🎯',
        title: 'GREAT JOB!',
        message: 'Nice work! You\'ve got serious guessing skills!',
      };
    } else if (stats.score >= 20) {
      return {
        emoji: '👍',
        title: 'GOOD EFFORT!',
        message: 'Not bad! Keep practicing and you\'ll be a pro!',
      };
    } else {
      return {
        emoji: '💪',
        title: 'KEEP TRYING!',
        message: 'Every expert was once a beginner! Let\'s play again!',
      };
    }
  };

  const performance = getPerformanceMessage();
  const accuracy = stats.correctGuesses > 0 
    ? Math.round((stats.correctGuesses / (stats.correctGuesses + stats.skips)) * 100)
    : 0;

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div className="text-8xl mb-6">{performance.emoji}</div>
        
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          {performance.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          {performance.message}
        </p>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-8">
          <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            {stats.score}
          </div>
          <p className="text-gray-600 font-semibold">TOTAL POINTS</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">{stats.correctGuesses}</div>
            <p className="text-sm text-gray-600 mt-1">Correct Guesses</p>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-orange-600">{stats.skips}</div>
            <p className="text-sm text-gray-600 mt-1">Skipped Words</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
            <p className="text-sm text-gray-600 mt-1">Accuracy</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white font-bold text-xl rounded-xl hover:shadow-lg 
                     hover:scale-105 transition-all"
          >
            🎮 Play Again
          </button>
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'AI Taboo Game',
                  text: `I scored ${stats.score} points in AI Taboo! Can you beat my score?`,
                });
              }
            }}
            className="w-full py-4 px-8 bg-gray-100 text-gray-700 font-semibold 
                     text-lg rounded-xl hover:bg-gray-200 transition-colors"
          >
            📤 Share Your Score
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            💡 Tip: Try different categories to improve your skills!
          </p>
        </div>
      </div>
    </div>
  );
}
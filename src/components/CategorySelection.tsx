interface CategorySelectionProps {
  onSelectCategory: (category: string) => void;
}

const categories = [
  {
    name: 'Movies & TV',
    emoji: '🎬',
    description: 'Lights, camera, action!',
    color: 'from-red-400 to-pink-500',
  },
  {
    name: 'Technology',
    emoji: '💻',
    description: 'Beep boop, guess the tech!',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    name: 'Food & Drinks',
    emoji: '🍕',
    description: 'Yummy words ahead!',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    name: 'Animals',
    emoji: '🦁',
    description: 'Wild guesses welcome!',
    color: 'from-green-400 to-emerald-500',
  },
  {
    name: 'Sports',
    emoji: '⚽',
    description: 'Game on!',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    name: 'Famous People',
    emoji: '⭐',
    description: 'Spot the celebrity!',
    color: 'from-amber-400 to-yellow-500',
  },
];

export default function CategorySelection({ onSelectCategory }: CategorySelectionProps) {
  return (
    <div className="w-full max-w-6xl animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          🎯 AI Taboo Game
        </h1>
        <p className="text-xl text-white/90 mb-2">
          Can you guess the word from AI's witty clues?
        </p>
        <p className="text-lg text-white/80">
          Choose a category to start your 5-minute challenge!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm p-8 
                     hover:scale-105 hover:bg-white/20 transition-all duration-300 
                     border-2 border-white/20 hover:border-white/40 shadow-xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 
                          group-hover:opacity-20 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="text-6xl mb-4">{category.emoji}</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {category.name}
              </h3>
              <p className="text-white/80">{category.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block border border-white/20">
          <h3 className="text-white font-semibold text-lg mb-2">How to Play</h3>
          <p className="text-white/80 text-sm">
            🤖 AI gives you creative clues • 💭 Type your guess • ⏭️ Skip if stuck • 
            ⏱️ Beat the 5-minute timer!
          </p>
        </div>
      </div>
    </div>
  );
}
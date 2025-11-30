import React from 'react';

const GameBoard = ({ gameData, answeredIds, handleClueClick }) => {
  return (
    <div className="bg-blue-900 dark:bg-gray-800 p-2 rounded-xl shadow-2xl overflow-hidden max-w-7xl w-full border-4 border-blue-950 dark:border-gray-700">
      {/* GRID */}
      {/* We use inline styles for columns to support dynamic numbering safely */}
      <div 
        className="grid gap-2 min-w-[300px] md:min-w-[600px]"
        style={{ gridTemplateColumns: `repeat(${gameData.length}, minmax(0, 1fr))` }}
      > 
        
        {/* HEADERS */}
        {gameData.map((category, idx) => (
          <div
            key={idx}
            className="fade-in bg-indigo-800 dark:bg-gray-700 h-24 flex items-center justify-center p-2 text-center rounded shadow-inner"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <h2 className="text-white font-bold text-xs md:text-sm lg:text-base uppercase tracking-widest text-shadow line-clamp-3">
              {category.category}
            </h2>
          </div>
        ))}

        {/* CELLS (Transposed) */}
        {[0, 1, 2, 3, 4].map((rowIndex) =>
          gameData.map((cat, catIndex) => {
            const clue = cat.clues[rowIndex];
            if (!clue)
              return (
                <div
                  key={`${catIndex}-${rowIndex}`}
                  className="bg-blue-950/50"
                ></div>
              ); // Safety

            const isAnswered = answeredIds.has(clue.id);

            return (
              <button
                key={clue.id}
                disabled={isAnswered}
                onClick={() => handleClueClick(clue)}
                className={`
                    fade-in relative h-20 md:h-28 flex items-center justify-center rounded 
                    transition-all duration-300 transform border-b-4
                    ${
                      isAnswered
                        ? 'bg-blue-950 dark:bg-gray-900 border-transparent cursor-default'
                        : 'bg-blue-600 dark:bg-gray-600 border-blue-800 dark:border-gray-700 hover:bg-blue-500 dark:hover:bg-gray-500 hover:border-blue-700 dark:hover:border-gray-600 hover:-translate-y-1 active:translate-y-0'
                    }
                  `}
                style={{ animationDelay: `${rowIndex * 100 + catIndex * 40}ms` }}
              >
                {isAnswered ? (
                  <span className="opacity-0">-</span>
                ) : (
                  <span className="text-yellow-400 font-black text-3xl md:text-5xl text-shadow-sm drop-shadow-lg">
                    {clue.level}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;

"use client";

interface GameOverProps {
  score: number;
  highScore: number;
  onRetry: () => void;
  onChangeAvatar: () => void;
}

export default function GameOver({
  score,
  highScore,
  onRetry,
  onChangeAvatar,
}: GameOverProps) {
  const isNewHigh = score >= highScore && score > 0;

  return (
    <div className="fixed inset-0 w-[100vw] h-[100dvh] flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-red-600 p-1 rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="bg-gray-900 p-8 rounded-xl border-2 border-yellow-300 text-center">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 mb-6">
            GAME OVER!
          </h2>

          <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
            <p className="text-xl font-bold text-gray-300">
              Score: <span className="text-white">{score}</span>
            </p>
            <p className="text-lg font-bold text-yellow-400">
              High Score: {highScore} {isNewHigh && "🥇"}
            </p>
            {isNewHigh && (
              <p className="text-sm text-green-400 font-bold animate-bounce mt-2">
                New Record!
              </p>
            )}
          </div>

          <button
            onClick={onRetry}
            className="w-full py-3 mb-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold rounded-lg hover:from-green-500 hover:to-green-600 transition-all shadow-lg"
          >
            TRY AGAIN
          </button>
          <button
            onClick={onChangeAvatar}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg"
          >
            CHANGE AVATAR
          </button>
        </div>
      </div>
    </div>
  );
}

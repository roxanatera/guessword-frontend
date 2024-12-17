'use client';
import { useState } from "react";

interface GameResponse {
  status: string;
  progress: string;
  attempts_left: number;
  correct_word?: string;
  used_letters: string[];
}

export default function Home() {
  const [letter, setLetter] = useState<string>("");
  const [progress, setProgress] = useState<string>("_ _ _ _");
  const [attempts, setAttempts] = useState<number>(6);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // Usando la variable de entorno

  const guessLetter = async () => {
    if (letter.trim() === "") return;

    try {
      const response = await fetch(`${apiUrl}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter }),
      });

      if (!response.ok) throw new Error("Error al comunicarse con el servidor");

      const data: GameResponse = await response.json();

      setProgress(data.progress || "_ _ _ _");
      setAttempts(data.attempts_left ?? 0);
      setUsedLetters(data.used_letters);

      if (data.status === "ganaste") {
        setMessage("🎉 ¡Felicidades! Has adivinado la palabra.");
        setGameOver(true);
      } else if (data.status === "perdiste") {
        setMessage(`😢 ¡Has perdido! La palabra era: ${data.correct_word}.`);
        setGameOver(true);
      }

      setLetter("");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al conectarse al servidor.");
    }
  };

  const restartGame = async () => {
    try {
      await fetch(`${apiUrl}/reset`, { method: "POST" });
      setProgress("_ _ _ _");
      setAttempts(6);
      setUsedLetters([]);
      setMessage("");
      setGameOver(false);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al reiniciar el juego.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8 text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-800">🎮 Juego del Ahorcado</h1>
        <p className="text-3xl tracking-wide font-mono mt-2">
          {progress.split("").join(" ")}
        </p>
        <p className="text-sm mt-4 text-gray-500">
          Letras usadas: <span className="font-bold text-gray-700">
            {usedLetters.length > 0 ? usedLetters.join(", ") : "Ninguna"}
          </span>
        </p>
        <p className="text-lg text-gray-600 mt-2">
          Intentos restantes: <span className="font-bold text-red-500">{attempts}</span>
        </p>
        {message && <p className="text-xl font-semibold text-green-500 mt-2">{message}</p>}
        {!gameOver && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <input
              type="text"
              maxLength={1}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="_"
            />
            <button
              onClick={guessLetter}
              className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
            >
              Adivinar
            </button>
          </div>
        )}
        {gameOver && (
          <button
            onClick={restartGame}
            className="mt-4 px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
          >
            Reiniciar Juego
          </button>
        )}
      </div>
      <footer className="mt-8 text-gray-500">
        <p>Creado con ❤️ JR Natera</p>
      </footer>
    </div>
  );
}

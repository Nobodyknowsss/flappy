"use client";
import { useState, useEffect } from "react";
import AvatarSelect from "@/components/AvatarSelect";
import FlappyGame from "@/components/FlappyGame";
import GameOver from "@/components/GameOver";
import BackgroundMusic from "@/components/BackgroundMusic";

type Screen = "select" | "playing" | "gameover";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("select");
  const [avatar, setAvatar] = useState<string>("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // The 3 specific photos provided for the random jumpscare
  const jumpscareImages = [
    "https://z-cdn-media.chatglm.cn/files/b50c8fed-ad66-473b-879e-428e90bef01a.png?auth_key=1882019554-8c3f6afcea1c4e0a8d6b5b8716770500-0-55dbff2bb9087c9f8589bd71a3932e78",
    "https://z-cdn-media.chatglm.cn/files/dcaea00c-5c4b-4a2f-939c-47dad66e57c2.png?auth_key=1882019554-a2a978a9d8fc4c598410a181becaf978-0-de37904f80677540ca2c08b8fbc7b199",
    "https://z-cdn-media.chatglm.cn/files/d81e88a4-035f-4669-9d3a-8129a46f642f.png?auth_key=1882019554-99874acd48df4c1e929d4240d25bca50-0-53276fcec71cf32e7fcb1b83ce4e6487",
  ];

  useEffect(() => {
    const stored = localStorage.getItem("manilaBirdHighScore");
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("manilaBirdHighScore", finalScore.toString());
    }
    setScreen("gameover");
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <BackgroundMusic />

      {screen === "select" && (
        <AvatarSelect
          onSelect={(a) => {
            setAvatar(a.img);
            setScreen("playing");
          }}
        />
      )}

      {screen === "playing" && (
        <FlappyGame
          avatarImg={avatar}
          jumpscareImages={jumpscareImages}
          onGameOver={handleGameOver}
        />
      )}

      {screen === "gameover" && (
        <GameOver
          score={score}
          highScore={highScore}
          onRetry={() => setScreen("playing")}
          onChangeAvatar={() => setScreen("select")}
        />
      )}
    </main>
  );
}

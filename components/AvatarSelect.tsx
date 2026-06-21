"use client";
import { useState } from "react";

interface Avatar {
  name: string;
  img: string;
}

// Provided image URLs mapped to the requested order
const avatars: Avatar[] = [
  {
    name: "KaKa",
    img: "https://z-cdn-media.chatglm.cn/files/e34cb6c3-6aae-4a2d-b92e-2ba64d46d805.png?auth_key=1882017101-cab4060b05344f63a1d9d386a173d60a-0-72de7b9d07a2d24abe2ffb2f6cd8c1f5",
  },
  {
    name: "manoK",
    img: "https://z-cdn-media.chatglm.cn/files/393bfe23-f6e2-43eb-9662-e2699c845317.png?auth_key=1882017101-26fa3b093d6a4a89a81ec2dfeca121ec-0-71fce4987d753a4aa4455089b1eb8d00",
  },
  {
    name: "rexA",
    img: "https://z-cdn-media.chatglm.cn/files/0c7b146d-68d9-4f6d-8f20-5fc039c91615.png?auth_key=1882017101-3d9aac2058d1404e8961584735fceec8-0-46e36168c523dd66160320906f571fd3",
  },
  {
    name: "Tuttin",
    img: "https://z-cdn-media.chatglm.cn/files/b7f2a8ed-2a5f-42a2-8428-cd15ec3bc864.png?auth_key=1882017101-da2a9e18bc154295935ced4f11e7b159-0-5bd5cf7955ae99c07d85cf1cbdc9148d",
  },
];

export default function AvatarSelect({
  onSelect,
}: {
  onSelect: (avatar: Avatar) => void;
}) {
  const [selected, setSelected] = useState<Avatar | null>(null);

  return (
    <div
      className="fixed inset-0 w-[100vw] h-[100dvh] flex flex-col items-center justify-center p-4 bg-cover bg-center relative overflow-y-auto"
      style={{
        backgroundImage: `url('https://z-cdn-media.chatglm.cn/files/e3e7daa1-9251-4657-ab08-3fd50158dcbf.png?auth_key=1882017101-392d9345160441059ec641fca6b894d4-0-b328b7eb76ee46a8a46d22d25517b0a9')`,
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90"></div>

      <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-red-600 p-1 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gray-900 p-6 rounded-xl border-2 border-yellow-300">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-2 drop-shadow-lg">
            MANILA BIRD RUN
          </h1>
          <p className="text-center text-white mb-8 font-bold tracking-wider">
            Pili na ng tauhan! (Choose your character)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {avatars.map((avatar) => (
              <button
                key={avatar.name}
                onClick={() => setSelected(avatar)}
                className={`p-2 rounded-xl border-4 transition-all duration-300 transform hover:scale-105 ${
                  selected?.name === avatar.name
                    ? "border-green-400 scale-105 bg-green-900/50 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                    : "border-red-700 bg-black/60 hover:border-yellow-400"
                }`}
              >
                <div className="w-full h-28 overflow-hidden rounded-lg flex items-center justify-center bg-gradient-to-b from-blue-200 to-blue-400">
                  <img
                    src={avatar.img}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white text-center font-bold mt-2 text-lg">
                  {avatar.name}
                </p>
              </button>
            ))}
          </div>

          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className={`w-full py-4 text-xl font-bold rounded-xl transition-all duration-300 ${
              selected
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/50 animate-pulse"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selected ? "START GAME!" : "SELECT A CHARACTER"}
          </button>
        </div>
      </div>
    </div>
  );
}

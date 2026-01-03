"use client";

import React, { useState } from "react";
import Scene from "@/components/Scene";
import Overlay from "@/components/Overlay";
import { Activity } from "lucide-react";

export default function Home() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-50">
      {/* Navbar / Header */}
      <header className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AnatoAI</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health Assistant</p>
          </div>
        </div>

        {/* Gender Toggle */}
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/50 flex gap-1">
          <button
            onClick={() => setGender("male")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              gender === "male"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender("female")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              gender === "female"
                ? "bg-rose-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Female
          </button>
        </div>
      </header>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene onSelectPart={setSelectedPart} selectedPart={selectedPart} gender={gender} />
      </div>

      {/* Instructions / Hint */}
      {!selectedPart && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border border-white/50 text-slate-600 text-sm font-medium animate-bounce">
            Click on a body part to analyze
          </div>
        </div>
      )}

      {/* Overlay */}
      <Overlay selectedPart={selectedPart} onClose={() => setSelectedPart(null)} gender={gender} />
    </main>
  );
}

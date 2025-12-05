"use client";

import { useState } from "react";
import SpinnerWheel from "@/app/components/SpinnerWheel";
import { users as initialUsers, recentWinners as initialWinners } from "@/lib/data";

// --- Helper: Mask Email (us***@example.com) ---
const maskEmail = (email: string) => {
  const parts = email.split("@");
  if (parts.length < 2) return email;
  
  const name = parts[0];
  const domain = parts[1];
  
  // Take first 2 characters, add ***, then domain
  const maskedName = name.substring(0, 2) + "***";
  return `${maskedName}@${domain}`;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [winnersList, setWinnersList] = useState<any[]>(initialWinners);
  const [loginEmail, setLoginEmail] = useState("");

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = initialUsers.find(u => u.email === loginEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
    } else {
      alert("Email not found. Try: user1@example.com");
    }
  };

  // Called when wheel stops spinning
  const handleSpinUpdate = (data: any) => {
    // Update local user state
    setCurrentUser((prev: any) => ({ ...prev, spinsAvailable: data.spinsLeft }));
    
    // Update the Global Winners List from server response
    if (data.recentWinners) {
      setWinnersList(data.recentWinners);
    }
  };

  // --- LOGIN UI ---
  if (!currentUser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login to Play</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="user1@example.com" 
              className="p-3 border-2 border-gray-200 rounded-lg text-black focus:border-blue-500 outline-none"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
              Start Game
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">Copy a test email:</p>
            <div className="flex flex-wrap gap-2">
              {initialUsers.slice(0, 3).map(u => (
                <span key={u.id} className="bg-gray-100 px-2 py-1 rounded text-xs border">{u.email}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- GAME DASHBOARD ---
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* LEFT: Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center w-full max-w-xl">
          <div className="w-full flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <p className="text-gray-500 text-sm">Player</p>
              <p className="font-bold text-gray-800">{currentUser.email}</p>
            </div>
            <button onClick={() => setCurrentUser(null)} className="text-red-500 text-sm hover:underline">
              Logout
            </button>
          </div>

          <SpinnerWheel 
            userEmail={currentUser.email} 
            onSpinEnd={handleSpinUpdate} 
          />
          
          <div className="mt-8 bg-blue-50 px-6 py-3 rounded-full border border-blue-100">
            <p className="text-blue-800 font-bold">
              Spins Left: <span className="text-2xl ml-2">{currentUser.spinsAvailable}</span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Latest Winners Sidebar */}
      <div className="w-full md:w-80 bg-white border-l border-gray-200 h-screen overflow-hidden flex flex-col shadow-lg">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🏆 Recent Winners
          </h2>
          <p className="text-blue-100 text-xs mt-1">Real-time updates</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
          {winnersList.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p>No winners yet.</p>
              <p className="text-xs">Be the first!</p>
            </div>
          ) : (
            winnersList.map((winner) => (
              <div 
                key={winner.id} 
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xs border border-yellow-200">
                    ★
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {maskEmail(winner.email)}
                    </p>
                    <p className="text-[10px] text-gray-400">{winner.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-green-600 font-bold text-sm">
                    +{winner.prize} Birr
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </main>
  );
}
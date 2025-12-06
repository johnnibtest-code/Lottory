"use client";

import { useState } from "react";
import SpinnerWheel from "@/app/components/SpinnerWheel";
import { users as initialUsers, recentWinners as initialWinners } from "@/lib/data";

// --- Helper: Mask Email ---
const maskEmail = (email: string) => {
  const parts = email.split("@");
  if (parts.length < 2) return email;
  const name = parts[0];
  const domain = parts[1];
  return `${name.substring(0, 2)}***@${domain}`;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [winnersList, setWinnersList] = useState<any[]>(initialWinners);
  const [loginEmail, setLoginEmail] = useState("");
  const [showMobileWinners, setShowMobileWinners] = useState(false);

  // --- BACKGROUNDS ---
  const pageBg = "bg-gray-200";
  const hexCardStyle = {
    backgroundColor: "#ffffff",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23e5e7eb' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.05)" 
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = initialUsers.find(u => u.email === loginEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
    } else {
      alert("Email not found. Try: user1@example.com");
    }
  };

  const handleSpinUpdate = (data: any) => {
    setCurrentUser((prev: any) => ({ ...prev, spinsAvailable: data.spinsLeft }));
    if (data.recentWinners) {
      setWinnersList(data.recentWinners);
    }
  };

  // --- LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center p-4 ${pageBg}`}>
        <div className="p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-[#FFC107]" style={hexCardStyle}>
          <h1 className="text-3xl font-bold mb-6 text-center text-[#5A3912]">Login to Play</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="user1@example.com" 
              className="p-3 border-2 border-gray-200 rounded-lg text-black bg-white/80 focus:border-[#FFC107] outline-none transition shadow-inner"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <button type="submit" className="bg-[#5A3912] text-white p-3 rounded-lg font-bold hover:bg-[#422a0d] transition shadow-lg">
              Start Game
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">Copy a test email:</p>
            <div className="flex flex-wrap gap-2">
              {initialUsers.slice(0, 3).map(u => (
                <span key={u.id} className="bg-white px-2 py-1 rounded text-xs border border-gray-300 text-gray-600">{u.email}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- REUSABLE WINNER LIST ---
  const WinnerListContent = () => (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#f9fafb]">
      {winnersList.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          <p>No winners yet.</p>
        </div>
      ) : (
        winnersList.map((winner) => (
          <div 
            key={winner.id} 
            className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-[#FFC107] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5A3912] flex items-center justify-center text-[#FFC107] font-bold text-xs">
                ★
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{maskEmail(winner.email)}</p>
                <p className="text-[10px] text-gray-400">{winner.time}</p>
              </div>
            </div>
            <span className="text-[#5A3912] font-bold text-sm">+{winner.prize} Birr</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <main className={`h-screen w-screen overflow-hidden flex flex-col md:flex-row ${pageBg}`}>
      
      {/* --- GAME AREA --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        
        <div className="shadow-2xl rounded-3xl flex flex-col items-center w-full max-w-xl relative overflow-hidden" style={hexCardStyle}>
          
          <div className="w-full flex justify-between items-center p-5 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase">Player</p>
              <p className="font-bold text-[#5A3912]">{currentUser.email}</p>
            </div>
            <button onClick={() => setCurrentUser(null)} className="text-red-500 text-sm font-semibold hover:bg-red-50 px-3 py-1 rounded transition">
              Logout
            </button>
          </div>

          <div className="mt-4 mb-2 bg-[#5A3912] text-[#FFC107] px-8 py-2 rounded-full shadow-lg border-2 border-[#FFC107]">
            <p className="font-bold text-sm md:text-base flex items-center gap-2">
              <span>SPINS LEFT:</span> 
              <span className="text-xl md:text-2xl font-black">{currentUser.spinsAvailable}</span>
            </p>
          </div>

          <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[340px] p-4 relative z-10">
            
            <div className={`${showMobileWinners ? 'hidden md:block' : 'block'} w-full flex justify-center`}>
               {/* PASSING SPINS AVAILABLE HERE */}
               <SpinnerWheel 
                 userEmail={currentUser.email} 
                 spinsAvailable={currentUser.spinsAvailable} 
                 onSpinEnd={handleSpinUpdate} 
               />
            </div>

            <div className={`${showMobileWinners ? 'flex' : 'hidden'} md:hidden w-full h-[320px] flex-col bg-white/80 rounded-xl border border-gray-200`}>
               <h3 className="text-center font-bold text-[#5A3912] py-3 bg-[#FFC107] rounded-t-xl">🏆 Recent Winners</h3>
               <div className="flex-1 overflow-hidden flex flex-col">
                 <WinnerListContent />
               </div>
            </div>

          </div>

          <div className="w-full px-6 pb-6 md:hidden z-20">
            <button 
              onClick={() => setShowMobileWinners(!showMobileWinners)}
              className="w-full py-3 bg-[#5A3912] text-white rounded-xl font-bold shadow-lg hover:bg-[#422a0d] transition active:scale-95 flex justify-center items-center gap-2 border-b-4 border-[#301b05]"
            >
              {showMobileWinners ? "← Back to Game" : "🏆 See Winners"}
            </button>
          </div>

        </div>
      </div>

      <div className="hidden md:flex w-80 bg-white border-l border-gray-200 h-full flex-col shadow-2xl z-10">
        <div className="p-5 bg-[#5A3912] text-white shadow-md">
          <h2 className="text-lg font-bold flex items-center gap-2">🏆 Recent Winners</h2>
          <p className="text-[#FFC107] text-xs mt-1">Live from Nib Bank</p>
        </div>
        <WinnerListContent />
      </div>
      
    </main>
  );
}
"use client";

import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { WHEEL_SEGMENTS } from "@/lib/data";

// --- VIBRANT PALETTE ---
const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#8A4D1F", // Brown
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", x, y,
    "L", start.x.toFixed(4), start.y.toFixed(4),
    "A", radius, radius, 0, largeArcFlag, 0, end.x.toFixed(4), end.y.toFixed(4),
    "Z",
  ].join(" ");
}

interface SpinnerProps {
  userEmail: string;
  spinsAvailable: number;
  onSpinEnd: (allUsers: any[]) => void;
}

export default function SpinnerWheel({ userEmail, spinsAvailable, onSpinEnd }: SpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState(""); // Used for 0 spins AND API errors
  const wheelRef = useRef<SVGSVGElement>(null);
  const currentRotation = useRef(0);

  const radius = 150;
  const center = 150;
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  const handleSpin = async () => {
    // 1. Prevent double clicking
    if (isSpinning) return;

    // 2. Clear previous messages
    setResultMessage("");
    setWarningMessage("");

    // 3. CHECK: Client-side check for 0 spins
    if (spinsAvailable <= 0) {
      setWarningMessage("Make more transaction to get point");
      return; 
    }

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();

      // 4. CHECK: Server-side error handling (REPLACED ALERT)
      if (!res.ok) {
        setWarningMessage(data.error || "An unexpected error occurred");
        return;
      }

      // 5. Start Animation
      setIsSpinning(true);

      const prizeIndex = data.prizeIndex; 
      const extraSpins = 360 * (5 + Math.floor(Math.random() * 5)); 
      const targetAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2);
      
      const newRotation = currentRotation.current + extraSpins + (360 - targetAngle % 360);
      const adjustedRotation = newRotation + (360 - (newRotation % 360)) - targetAngle;

      if (wheelRef.current) {
        wheelRef.current.style.transition = "transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)";
        wheelRef.current.style.transform = `rotate(${adjustedRotation}deg)`;
      }

      currentRotation.current = adjustedRotation;

      setTimeout(() => {
        setIsSpinning(false);
        if (data.prize === "Thanks") {
          setResultMessage("Thanks! Better luck next time.");
        } else {
          setResultMessage(`BOOM! You won ${data.prize} Birr!`);
          confetti({ 
            particleCount: 150, 
            spread: 80, 
            origin: { y: 0.6 },
            colors: COLORS 
          });
        }
        if (onSpinEnd) onSpinEnd(data); 
      }, 4000);

    } catch (err) {
      console.error(err);
      setIsSpinning(false);
      setWarningMessage("Network connection failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-[300px] h-[300px] shrink-0">
        
        <svg ref={wheelRef} className="w-full h-full drop-shadow-2xl" viewBox="0 0 300 300">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" /> 
              <stop offset="50%" stopColor="#FFF7ED" /> 
              <stop offset="100%" stopColor="#B45309" /> 
            </linearGradient>
            
            <radialGradient id="coneLight" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="70%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* 1. OUTER GOLD RIM */}
          <circle cx="150" cy="150" r="150" fill="url(#goldGradient)" />
          
          {/* 2. INNER RIM */}
          <circle cx="150" cy="150" r="142" fill="#8A4D1F" />

          {/* 3. SEGMENTS */}
          {WHEEL_SEGMENTS.map((prize, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const path = describeArc(center, center, radius - 12, startAngle, endAngle);
            const midAngle = startAngle + segmentAngle / 2;
            const textPos = polarToCartesian(center, center, (radius - 25) * 0.65, midAngle);
            const bgColor = COLORS[i % COLORS.length];

            return (
              <g key={i}>
                <path d={path} fill={bgColor} stroke="#fff" strokeWidth="2" strokeOpacity="0.8" />
                <text
                  x={textPos.x.toFixed(4)} y={textPos.y.toFixed(4)}
                  fill="white" 
                  fontSize="14" 
                  fontWeight="900" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle}, ${textPos.x.toFixed(4)}, ${textPos.y.toFixed(4)})`}
                  style={{ textShadow: "0px 2px 2px rgba(0,0,0,0.5)" }}
                >
                  {prize}
                </text>
              </g>
            );
          })}

          {/* 4. 3D LIGHTING OVERLAY */}
          <circle cx="150" cy="150" r="138" fill="url(#coneLight)" pointerEvents="none" />
        </svg>

        {/* --- CENTER SPIN BUTTON --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`
              w-16 h-16 rounded-full font-black text-sm tracking-wider transition-all duration-150 flex items-center justify-center
              text-[#FFC107] hover:scale-105 active:translate-y-1
              ${isSpinning ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}
            `}
            style={{
               background: "radial-gradient(circle at 30% 30%, #a05a26, #8A4D1F, #5c3315)",
               border: "4px solid #FFC107", 
               boxShadow: "0 8px 15px rgba(138, 77, 31, 0.5), inset 0 2px 5px rgba(255,255,255,0.3)"
            }}
          >
            {isSpinning ? (
              <span className="animate-spin block">↻</span>
            ) : (
              "SPIN"
            )}
          </button>
        </div>

        {/* POINTER */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 z-30 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
           <div className="w-0 h-0 border-l-[17px] border-l-transparent border-r-[17px] border-r-transparent border-t-[37px] border-t-[#FFC107] absolute top-[-1px] left-[-2px]"></div>
           <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[35px] border-t-[#8A4D1F]"></div>
        </div>
      </div>

      {/* --- MESSAGE AREA --- */}
      <div className="text-center min-h-[50px] flex flex-col items-center justify-center gap-2">
        
        {/* 1. Spin Result (Win) */}
        {resultMessage && (
          <div className={`text-lg font-bold px-6 py-2 rounded-full bg-white shadow-md border-2 border-[#FFC107] ${resultMessage.includes("BOOM") ? "text-green-600 animate-bounce" : "text-[#8A4D1F]"}`}>
            {resultMessage}
          </div>
        )}

        {/* 2. WARNING MESSAGE (0 Spins or Server Error) */}
        {warningMessage && (
          <div className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 px-6 py-3 rounded-lg shadow-sm animate-pulse">
            {warningMessage}
          </div>
        )}
      </div>
    </div>
  );
}
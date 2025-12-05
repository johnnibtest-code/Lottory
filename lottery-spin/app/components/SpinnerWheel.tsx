"use client";

import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { WHEEL_SEGMENTS } from "@/lib/data"; // Import from data now

const COLORS = [
  "#FFB6C1", "#87CEFA", "#FFD700", "#90EE90",
  "#FFA07A", "#DA70D6", "#40E0D0", "#F08080",
];

// --- Math Helpers ---
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
  onSpinEnd: (allUsers: any[]) => void; // Callback to update parent
}

export default function SpinnerWheel({ userEmail, onSpinEnd }: SpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const wheelRef = useRef<SVGSVGElement>(null);
  const currentRotation = useRef(0);

  const radius = 150;
  const center = 150;
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  const triggerWinAnimation = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    setResultMessage("");

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

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
    triggerWinAnimation();
  }
  
  // PASS THE ENTIRE DATA OBJECT TO PARENT
  if (onSpinEnd) {
    onSpinEnd(data); 
  }
}, 4000);

    } catch (err) {
      console.error(err);
      setIsSpinning(false);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-[300px] h-[300px]">
        <svg ref={wheelRef} className="w-full h-full" viewBox="0 0 300 300">
          {WHEEL_SEGMENTS.map((prize, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const path = describeArc(center, center, radius, startAngle, endAngle);
            const midAngle = startAngle + segmentAngle / 2;
            const textPos = polarToCartesian(center, center, radius * 0.65, midAngle);
            return (
              <g key={i}>
                <path d={path} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="2" />
                <text
                  x={textPos.x.toFixed(4)} y={textPos.y.toFixed(4)}
                  fill="#000" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${midAngle}, ${textPos.x.toFixed(4)}, ${textPos.y.toFixed(4)})`}
                >
                  {prize}
                </text>
              </g>
            );
          })}
          <circle cx={center} cy={center} r={30} fill="white" stroke="#E5E7EB" strokeWidth="4" />
          <circle cx={center} cy={center} r={10} fill="#3B82F6" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-10">
           <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600"></div>
        </div>
      </div>

      <div className="text-center h-16">
        {resultMessage && (
          <div className={`text-xl font-bold ${resultMessage.includes("BOOM") ? "text-green-600 animate-bounce" : "text-gray-600"}`}>
            {resultMessage}
          </div>
        )}
      </div>
      
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="px-10 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
      >
        {isSpinning ? "Spinning..." : "SPIN NOW"}
      </button>
    </div>
  );
}

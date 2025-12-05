// app/api/spin/route.ts
import { NextResponse } from "next/server";
import { determinePrizeResult } from "@/lib/gameLogic";
import { users, recentWinners, WHEEL_SEGMENTS } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = users.find((u) => u.email === email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.spinsAvailable <= 0) return NextResponse.json({ error: "No spins left" }, { status: 400 });

    // 1. Game Logic
    const prize = determinePrizeResult(50); // 50 is a density factor

    // 2. Update User
    user.spinsAvailable -= 1;

    // 3. If they WON (Not "Thanks"), add to the Global Winners List
    if (prize !== "Thanks") {
      recentWinners.unshift({
        id: Date.now(),
        email: user.email,
        prize: prize,
        time: new Date().toLocaleTimeString(),
      });

      // Keep list short (Max 20 winners)
      if (recentWinners.length > 20) recentWinners.pop();
    }

    // 4. Calculate Index
    let prizeIndex = WHEEL_SEGMENTS.indexOf(prize);
    if (prizeIndex === -1) prizeIndex = WHEEL_SEGMENTS.length - 1; 

    return NextResponse.json({
      success: true,
      prize,
      prizeIndex,
      spinsLeft: user.spinsAvailable,
      recentWinners: recentWinners // Send the updated list to UI
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
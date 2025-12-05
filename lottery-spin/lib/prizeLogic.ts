export const WHEEL_SEGMENTS = [
  "100",
  "200",
  "500",
  "800",
  "1000",
  "others",
];

// 1. Create the Deck. 
// NOTICE: There is NO "others" inside this array. Only real money.
export let prizePool: string[] = [
  ...Array(10).fill("100"),  // 10x 100 cards
  ...Array(5).fill("200"),   // 5x 200 cards
  ...Array(3).fill("500"),   // 3x 500 cards
  ...Array(3).fill("800"),   // 3x 800 cards
  ...Array(2).fill("1000")   // 2x 1000 cards
];

// 2. Shuffle the Deck (So the 1000s are hidden somewhere in the middle/end)
// We run this ONCE when the server starts.
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Perform the shuffle immediately
shuffle(prizePool);

export function determinePrizeResult(totalUsers = 50000): string {
  // A. If the deck is empty, you physically cannot win.
  if (prizePool.length === 0) {
    console.log("Deck is empty. Returning 'others'.");
    return "others";
  }

  // B. Calculate your Luck
  // If 23 cards left and 50,000 users, chance is 0.046%
  const winProb = prizePool.length / totalUsers;
  const luckyNumber = Math.random();
  console.log("luckyNumber ..."+luckyNumber+" and winProb ..."+winProb+" and prizePool.length...."+prizePool.length);

  // C. The "Dice Roll"
  if (luckyNumber > winProb) {
    // YOU LOST. 
    // We do NOT touch the deck. The 1000 birr stays there.
    return "others";
  }

  // D. YOU WON!
  // We remove the top card from the deck.
  // Since the deck ONLY contains ["100", "200"..."1000"], this CANNOT be "others".
  const wonPrize = prizePool.pop(); 
  
  // If 'wonPrize' was "1000", then "1000" is removed from the array.
  // Logic guarantee: wonPrize is a string number.
  return wonPrize as string;
}
// lib/gameLogic.ts
import { prizePool } from "./data";

export function determinePrizeResult(totalUsers = 50): string {
  // 1. Empty Bag Check
  if (prizePool.length === 0) return "Thanks";

  // 2. Probability Check
  const winProb = prizePool.length / totalUsers;
  
  // If random number > probability, user loses (gets Thanks)
  if (Math.random() > winProb) {
    return "Thanks";
  }

  // 3. Pick a RANDOM index from the remaining prizes (The "Hand in Bag" method)
  const randomIndex = Math.floor(Math.random() * prizePool.length);

  // 4. Remove that specific item physically from the array
  const [wonPrize] = prizePool.splice(randomIndex, 1);

  return wonPrize;
}
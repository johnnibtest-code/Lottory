// lib/data.ts

export const WHEEL_SEGMENTS = ["100", "200","300", "500", "800", "1000","5000", "Thanks"];

// The Bag of Prizes
export let prizePool: string[] = [
  ...Array(10).fill("100"),
  ...Array(5).fill("200"),
  ...Array(4).fill("300"),
  ...Array(3).fill("500"),
  ...Array(3).fill("800"),
  ...Array(2).fill("1000"),
  ...Array(1).fill("5000")
];

// Users Data
export let users = [
  { id: "1", email: "user1@example.com", spinsAvailable: 30 },
  { id: "2", email: "user2@example.com", spinsAvailable: 10 },
  { id: "3", email: "user3@example.com", spinsAvailable: 3 },
  { id: "4", email: "user4@example.com", spinsAvailable: 1 },
  { id: "5", email: "user5@example.com", spinsAvailable: 0 },
];

// Global Winners History (Newest first)
export let recentWinners: { id: number; email: string; prize: string; time: string }[] = [];
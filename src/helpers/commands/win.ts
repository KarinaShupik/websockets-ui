import storage from "../storage";

export const win = (name: string) => {
    let winner = storage.winners.find((w) => (w.name = name));
    if (!winner) {
      winner = { name, wins: 0 };
    }
    winner.wins++;
  };
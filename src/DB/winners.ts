import { Winner } from '../types/DBTypes';

export class Winners {
  _winners: Winner[] = [];

  getWinners() {
    return this._winners;
  }

  setWinner(name: string) {
    const winner = this._winners.find((winner) => winner.name === name);
    if (winner) {
      winner.wins++;
    } else {
      this._winners.push({ name, wins: 1 });
    }
  }
}

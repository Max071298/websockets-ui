import { Game, Ship } from '../types/DBTypes';

export class Games {
  _games: Game[] = [];

  getGames(): Game[] {
    return this._games;
  }

  getGame(gameId: string): Game | undefined {
    return this._games.find((game) => game.gameId === gameId);
  }

  createGame(client1Login: string, client1Index: string, client2Login: string, client2Index: string) {
    const game: Game = {
      gameId: crypto.randomUUID(),
      players: [
        {
          login: client1Login,
          index: client1Index,
        },
        {
          login: client2Login,
          index: client2Index,
        },
      ],
    };

    this._games.push(game);
  }

  addShips(gameId: string, playerId: string, ships: Ship[]): void {
    const game = this.getGame(gameId);
    if (game) {
      const gamePlayers = game.players;
      const currentPlayer = gamePlayers.find((player) => player.index === playerId);
      if (currentPlayer) {
        currentPlayer.ships = ships;
      }
    }
  }
}

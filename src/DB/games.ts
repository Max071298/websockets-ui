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
        currentPlayer.killedShips = 0;
        currentPlayer.ships = ships;
        currentPlayer.shipsMatrix = this.addShipsMatrix(ships);
        currentPlayer.attackedFields = Array.from({ length: 10 }, (_) => {
          return Array.from({ length: 10 }, () => 'O');
        });
      }
    }
  }

  addShipsMatrix(ships: Ship[]): ('O' | 'X')[][] {
    const shipsMatrix: ('O' | 'X')[][] = Array.from({ length: 10 }, (_) => {
      return Array.from({ length: 10 }, () => 'O');
    });

    ships.forEach((ship) => {
      const x = ship.position.x;
      const y = ship.position.y;
      for (let i = 0; i < ship.length; i++) {
        if (ship.direction) {
          shipsMatrix[x][y + i] = 'X';
        } else {
          shipsMatrix[x + i][y] = 'X';
        }
      }
    });

    return shipsMatrix;
  }
}

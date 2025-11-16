import { Games } from '../DB/games';
import { Rooms } from '../DB/rooms';
import { extendedWS } from '../types/extendedWS';
import { IncomingData } from '../types/incomingMessageTypes';
import { OutgoingMessageType } from '../types/outgoingMessageTypes';
import { makeJSONRes } from '../utils';

export function createGame(
  websockets: extendedWS[],
  rooms: Rooms | undefined,
  games: Games | undefined,
  roomInfo: IncomingData,
) {
  if (rooms && games) {
    const indexRoom = roomInfo.indexRoom;
    const fullRoom = rooms.getRoom(indexRoom);
    if (fullRoom) {
      const player1 = { login: fullRoom.client1Login, index: fullRoom.client1Index };
      const player2 = {
        login: fullRoom.client2Login ? fullRoom.client2Login : '',
        index: fullRoom.client2Index ? fullRoom.client2Index : '',
      };
      games.createGame(player1.login, player1.index, player2.login, player2.index);

      const gameId = games.getGames().at(-1)?.gameId;

      if (gameId) {
        websockets.forEach((ws) => {
          if (ws.login === player1.login || ws.login === player2.login) {
            if (ws.login === player1.login) {
              ws.send(makeJSONRes(OutgoingMessageType.CreateGame, { idGame: gameId, idPlayer: player1.index }));
            } else if (ws.login === player2.login) {
              ws.send(makeJSONRes(OutgoingMessageType.CreateGame, { idGame: gameId, idPlayer: player2.index }));
            }
          }
        });
      }
    }
  }
}

export function addShips(requestData: IncomingData, games: Games | undefined) {
  if (games) {
    const gameId = requestData.gameId;
    const ships = requestData.ships;
    const playerId = requestData.indexPlayer;

    games.addShips(gameId, playerId, ships);
  }
}

export function startGame(requestData: IncomingData, games: Games | undefined, websockets: extendedWS[]): void {
  if (games) {
    const gameId = requestData.gameId;
    const gameInfo = games.getGame(gameId);
    if (gameInfo) {
      const playersInfo = gameInfo.players;

      if (playersInfo.every((playerInfo) => playerInfo.ships)) {
        playersInfo.forEach((playerInfo) => {
          if (playerInfo && playerInfo.ships) {
            const playerIdWs = websockets.find((ws) => {
              if (ws.index === playerInfo.index && ws.readyState === ws.OPEN) {
                return ws;
              }
            });
            if (playerIdWs) {
              playerIdWs.send(
                makeJSONRes(OutgoingMessageType.StartGame, {
                  ships: playerInfo.ships,
                  currentPlayerIndex: playerInfo.index,
                }),
              );
            }
          }
        });
      }
    }
  }
}

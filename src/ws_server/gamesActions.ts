import { Clients } from '../DB/clients';
import { Games } from '../DB/games';
import { Rooms } from '../DB/rooms';
import { Winners } from '../DB/winners';
import { Client, PlayerInfo, Ship } from '../types/DBTypes';
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

export function turn(requestData: IncomingData, games: Games | undefined, websockets: extendedWS[]) {
  if (games) {
    const gameId = requestData.gameId;
    const currentPlayer = requestData.indexPlayer;
    const game = games.getGame(gameId);

    if (game) {
      if (game.players.every((player) => player.ships)) {
        game.players.forEach((player) => {
          const playerWs = websockets.find((ws) => {
            if (ws.index === player.index && ws.readyState === ws.OPEN) {
              if (player.index === currentPlayer) {
                player.turn = true;
              } else {
                player.turn = false;
              }
              return ws;
            }
          });
          if (playerWs) {
            playerWs.send(makeJSONRes(OutgoingMessageType.Turn, { currentPlayer }));
          }
        });
      }
    }
  }
}

export function makeAttack(
  requestData: IncomingData,
  games: Games | undefined,
  websockets: extendedWS[],
  clients: Clients | undefined,
  winners: Winners | undefined,
) {
  if (games) {
    const gameId = requestData.gameId;
    const xShoot = requestData.x;
    const yShoot = requestData.y;
    const attackPlayerId = requestData.indexPlayer;

    let status: 'miss' | 'killed' | 'shot' = 'miss';

    const gameInfo = games.getGame(gameId);
    if (gameInfo) {
      const attackPlayerInfo = gameInfo.players.find((player) => player.index === attackPlayerId);
      const secondPlayerInfo = gameInfo.players.find((player) => player.index !== attackPlayerId);

      if (attackPlayerInfo && secondPlayerInfo) {
        if (attackPlayerInfo.turn === false) {
          return;
        }
        const attackedFields = attackPlayerInfo.attackedFields;
        const secondPlayerShips = secondPlayerInfo.ships;
        const secondPlayerShipsMatrix = secondPlayerInfo.shipsMatrix;
        const secondPlayerId = secondPlayerInfo.index;
        if (attackedFields && secondPlayerShipsMatrix && secondPlayerShips) {
          if (attackedFields[xShoot][yShoot] === 'X') {
            return;
          } else {
            attackedFields[xShoot][yShoot] = 'X';
            if (secondPlayerShipsMatrix[xShoot][yShoot] === 'O') {
              status = 'miss';
            } else {
              const allShipPositions = findShipInShips(secondPlayerShips, xShoot, yShoot);
              if (allShipPositions.length === 1) {
                status = 'killed';
                if (attackPlayerInfo.killedShips !== undefined) {
                  attackPlayerInfo.killedShips++;
                }
                killNeighbours(attackedFields, xShoot, yShoot, attackPlayerId, secondPlayerId, websockets);
              } else {
                const shipLength = allShipPositions.length;
                let killedPositions = 0;
                allShipPositions.forEach((shipPosition) => {
                  if (attackedFields[shipPosition.x][shipPosition.y] === 'X') {
                    killedPositions++;
                  }
                  if (shipLength === killedPositions) {
                    status = 'killed';
                    if (attackPlayerInfo.killedShips !== undefined) {
                      attackPlayerInfo.killedShips++;
                    }
                    allShipPositions.forEach((shipPosition) => {
                      killNeighbours(
                        attackedFields,
                        shipPosition.x,
                        shipPosition.y,
                        attackPlayerId,
                        secondPlayerId,
                        websockets,
                      );
                    });
                  } else {
                    status = 'shot';
                  }
                });
              }
            }
          }

          websockets.forEach((ws) => {
            if (ws.index === attackPlayerId && ws.readyState === ws.OPEN) {
              ws.send(
                makeJSONRes(OutgoingMessageType.Attack, {
                  position: { x: xShoot, y: yShoot },
                  currentPlayer: ws.index,
                  status,
                }),
              );
            }
          });

          if (attackPlayerInfo.killedShips) {
            if (attackPlayerInfo.killedShips === 10) {
              websockets.forEach((ws) => {
                if ((ws.index === attackPlayerId || ws.index === secondPlayerId) && ws.readyState === ws.OPEN) {
                  finishGame(attackPlayerId, ws, clients, winners);
                }
              });
            }
          }

          websockets.forEach((ws) => {
            if ((ws.index === attackPlayerId || ws.index === secondPlayerId) && ws.readyState === ws.OPEN) {
              if (status === 'miss') {
                setTurn(secondPlayerId, secondPlayerInfo, attackPlayerInfo, ws);
              } else {
                setTurn(attackPlayerId, attackPlayerInfo, secondPlayerInfo, ws);
              }
            }
          });
        }
      }
    }
  }
}

function killNeighbours(
  attackedFields: ('O' | 'X')[][],
  x: number,
  y: number,
  attackPlayerId: string,
  secondPlayerId: string,
  websockets: extendedWS[],
) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (attackedFields[x + i]) {
        if (attackedFields[x + i][y + j] === 'O') {
          attackedFields[x + i][y + j] = 'X';
          websockets.forEach((ws) => {
            if (ws.index === attackPlayerId && ws.readyState === ws.OPEN) {
              ws.send(
                makeJSONRes(OutgoingMessageType.Attack, {
                  position: { x: x + i, y: y + j },
                  currentPlayer: ws.index,
                  status: 'miss',
                }),
              );
            }
          });
        }
      }
    }
  }
}

function findShipInShips(secondPlayerShips: Ship[], xShoot: number, yShoot: number) {
  let positions: { x: number; y: number }[] = [];
  secondPlayerShips.forEach((ship) => {
    const xPos = ship.position.x;
    const yPos = ship.position.y;
    const direction = ship.direction;
    const shipLength = ship.length;
    const allShipPositions: { x: number; y: number }[] = [];
    for (let i = 0; i < shipLength; i++) {
      if (direction) {
        allShipPositions.push({ x: xPos, y: yPos + i });
      } else {
        allShipPositions.push({ x: xPos + i, y: yPos });
      }
    }

    allShipPositions.forEach((shipPosition) => {
      if (shipPosition.x === xShoot && shipPosition.y === yShoot) {
        positions = allShipPositions;
      }
    });
  });

  return positions;
}

function setTurn(playerIdTurn: string, playerInfoTurn: PlayerInfo, secondPlayerInfo: PlayerInfo, ws: extendedWS) {
  playerInfoTurn.turn = true;
  secondPlayerInfo.turn = false;
  ws.send(makeJSONRes(OutgoingMessageType.Turn, { currentPlayer: playerIdTurn }));
}

function finishGame(playerId: string, ws: extendedWS, clients: Clients | undefined, winners: Winners | undefined) {
  ws.send(makeJSONRes(OutgoingMessageType.Finish, { winPlayer: playerId }));
  if (clients && winners) {
    const playerInClients = clients.getClientById(playerId);
    if (playerInClients) {
      winners.setWinner(playerInClients.login);
    }
  }
}

export function sendWinners(websockets: extendedWS[], winners: Winners | undefined) {
  if (winners) {
    websockets.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(makeJSONRes(OutgoingMessageType.UpdateWinners, winners.getWinners()));
      }
    });
  }
}

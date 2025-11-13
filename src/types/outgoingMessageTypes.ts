export enum OutgoingMessageType {
  Registration = 'reg',
  UpdateWinners = 'update_winners',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  StartGame = 'start_game',
  Attack = 'attack',
  Turn = 'turn',
  Finish = 'finish',
}

type LoginPlayer = {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
};

type UpdateWinners = {
  name: string;
  wins: number;
}[];

type CreateGame = {
  idGame: number | string;
  idPlayer: number | string;
};

type UpdateRoom = {
  roomId: number | string;
  roomUsers: {
    name: string;
    index: number | string;
  }[];
}[];

type StartGame = {
  ships: {
    position: {
      x: number;
      y: number;
    };
    direction: boolean;
    length: number;
    type: 'small' | 'medium' | 'large' | 'huge';
  }[];
  currentPlayerIndex: number | string;
};

type Attack = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number | string;
  status: 'miss' | 'killed' | 'shot';
};

type Turn = {
  currentPlayer: number | string;
};

type FinishGame = {
  winPlayer: number | string;
};

export type OutgoingData =
  | LoginPlayer
  | UpdateWinners
  | CreateGame
  | UpdateRoom
  | StartGame
  | Attack
  | Turn
  | FinishGame;

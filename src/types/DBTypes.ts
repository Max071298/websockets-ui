export type Client = {
  login: string;
  password: string;
  isLogged: boolean;
  index: string;
};

export type Room = {
  client1Login: string;
  client1Index: string;
  client2Login: string | null;
  client2Index: string | null;
  indexRoom: string;
  status: 'open' | 'closed';
};

export type PlayerInfo = {
  login: string;
  index: string;
  ships?: Ship[];
  shipsMatrix?: ('O' | 'X')[][];
  attackedFields?: ('O' | 'X')[][];
  turn?: boolean;
  killedShips?: number;
};

export type Game = {
  gameId: string;
  players: [PlayerInfo, PlayerInfo];
};

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean; // horizontal - false; vertical - true
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export type Winner = {
  name: string;
  wins: number;
};

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

export type Game = {
  gameId: string;
  players: [
    {
      login: string;
      index: string;
      ships?: Ship[];
    },
    {
      login: string;
      index: string;
      ships?: Ship[];
    },
  ];
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

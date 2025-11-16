export enum IncomingMessageType {
  Registration = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
}

type LoginPlayer = {
  name: string;
  password: string;
};

type AddUserToRoom = {
  indexRoom: string;
};

type AddShips = {
  gameId: string;
  ships: [
    {
      position: {
        x: number;
        y: number;
      };
      direction: boolean;
      length: number;
      type: 'small' | 'medium' | 'large' | 'huge';
    },
  ];
  indexPlayer: string;
};

type Attack = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
};

type RandomAttack = {
  gameId: string;
  indexPlayer: string;
};

export type IncomingData = '' & LoginPlayer & AddUserToRoom & AddShips & Attack & RandomAttack;

export type IncomingDataMessage = {
  type: IncomingMessageType;
  data: IncomingData;
  id: 0;
};

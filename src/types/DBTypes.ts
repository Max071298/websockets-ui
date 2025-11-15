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

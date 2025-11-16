import WebSocket from 'ws';
export interface extendedWS extends WebSocket {
  login?: string;
  index?: string;
}

import WebSocket, { WebSocketServer } from 'ws';
import { IncomingData, IncomingDataMessage, IncomingMessageType } from '../types/incomingMessageTypes';
import { Clients } from '../DB/clients';
import { loginClient } from './loginClient';
import { extendedWS } from '../types/extendedWS';
import { Rooms } from '../DB/rooms';
import { addSecondUserToRoom, createRoom, updateRooms } from './roomsActions';

export class MyWebSocketServer {
  _wss: WebSocketServer | undefined;
  _websockets: extendedWS[];
  _clients: Clients | undefined;
  _rooms: Rooms | undefined;
  port: number;

  constructor(port: number) {
    this.port = port;
    this._websockets = [];
  }

  start() {
    this._wss = new WebSocketServer({ port: this.port });
    this._clients = new Clients();
    this._rooms = new Rooms();
    this._wss.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(ws: extendedWS): void {
    ws.on('error', console.error);

    console.log(`Connected to the port ${this.port} successfully!`);

    this._websockets.push(ws);

    ws.on('message', (data) => {
      const parsedRequest: IncomingDataMessage = JSON.parse(data.toString());
      const parsedBody: IncomingData =
        parsedRequest.data.toString() === ''
          ? parsedRequest.data.toString()
          : JSON.parse(parsedRequest.data.toString());

      switch (parsedRequest.type) {
        case IncomingMessageType.Registration:
          loginClient(parsedBody, ws, this._clients as Clients);
          updateRooms(this._websockets, this._rooms);
          break;

        case IncomingMessageType.CreateRoom:
          createRoom(ws, this._rooms);
          updateRooms(this._websockets, this._rooms);
          break;

        case IncomingMessageType.AddUserToRoom:
          addSecondUserToRoom(ws, this._rooms, parsedBody);
          updateRooms(this._websockets, this._rooms);
      }
    });
  }
}

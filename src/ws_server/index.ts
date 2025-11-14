import WebSocket, { WebSocketServer } from 'ws';
import { IncomingData, IncomingDataMessage, IncomingMessageType } from '../types/incomingMessageTypes';
import { Clients } from '../DB/clients';
import { loginClient } from './loginClient';

export class MyWebSocketServer {
  _wss: WebSocketServer | undefined;
  _clients: Clients | undefined;
  port: number;

  constructor(port: number) {
    this.port = port;
  }

  start() {
    this._wss = new WebSocketServer({ port: this.port });
    this._clients = new Clients();
    this._wss.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(ws: WebSocket): void {
    ws.on('error', console.error);

    console.log(`Connected to the port ${this.port} successfully!`);

    ws.on('message', (data) => {
      const parsedRequest: IncomingDataMessage = JSON.parse(data.toString());
      const parsedBody: IncomingData = JSON.parse(parsedRequest.data.toString());

      switch (parsedRequest.type) {
        case IncomingMessageType.Registration:
          loginClient(parsedBody, ws, this._clients as Clients);
          break;
      }
    });
  }
}

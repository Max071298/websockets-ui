import { WebSocketServer } from 'ws';
import { WsMessageType } from '../types/wsMessageType';
import { IncomingDataMessage, IncomingMessageType } from '../types/incomingMessageTypes';

export const startWss = (port: number): void => {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    ws.on('error', console.error);

    console.log(`Connected to the port ${port} successfully!`);

    ws.on('message', (data) => {
      const parsedData: IncomingDataMessage = JSON.parse(data.toString());

      switch (parsedData.type) {
        case IncomingMessageType.Registration:
      }
    });
  });
};

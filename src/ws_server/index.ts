import { WebSocketServer } from 'ws';

export const startWss = (port: number): void => {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    ws.on('error', console.error);

    console.log(`Connected to the port ${port} successfully!`);

    ws.on('message', (data) => {
      const parsedData = JSON.parse(data.toString());
      console.log(parsedData);
    });
  });
};

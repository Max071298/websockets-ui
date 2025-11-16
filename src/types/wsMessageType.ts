import { IncomingData, IncomingMessageType } from './incomingMessageTypes';
import { OutgoingData, OutgoingMessageType } from './outgoingMessageTypes';

export type WsMessageType = {
  type: IncomingMessageType | OutgoingMessageType;
  data: IncomingData | OutgoingData;
  id: 0;
};

import { OutgoingData, OutgoingMessageType } from '../types/outgoingMessageTypes';

export function makeJSONRes(type: OutgoingMessageType, data: OutgoingData): string {
  return JSON.stringify({ type, data: JSON.stringify(data), id: 0 });
}

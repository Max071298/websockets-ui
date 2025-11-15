import { Rooms } from '../DB/rooms';
import { extendedWS } from '../types/extendedWS';
import { IncomingData } from '../types/incomingMessageTypes';
import { OutgoingMessageType } from '../types/outgoingMessageTypes';
import { makeJSONRes } from '../utils';

export function updateRooms(websockets: extendedWS[], rooms: Rooms | undefined) {
  if (rooms) {
    const type = OutgoingMessageType.UpdateRoom;
    const openedRooms = rooms.getRooms('open');

    const openedRoomsData = openedRooms.map((room) => {
      return { roomId: room.indexRoom, roomUsers: [{ name: room.client1Login, index: room.client1Index }] };
    });

    websockets.forEach((ws) => {
      if (ws.readyState === ws.OPEN && ws.login) {
        ws.send(makeJSONRes(type, openedRoomsData));
      }
    });
  }
}

export function createRoom(ws: extendedWS, rooms: Rooms | undefined) {
  if (ws.login && ws.index && rooms) rooms.createRoom(ws.login, ws.index);
}

export function addSecondUserToRoom(ws: extendedWS, rooms: Rooms | undefined, roomInfo: IncomingData) {
  if (rooms && ws.login && ws.index) {
    const indexRoom = roomInfo.indexRoom;
    rooms.addUserToRoom(ws.login, ws.index, indexRoom);
  }
}

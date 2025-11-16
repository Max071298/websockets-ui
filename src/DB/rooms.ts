import { Room } from '../types/DBTypes';

export class Rooms {
  _rooms: Room[] = [];

  getRooms(status?: 'open' | 'closed'): Room[] {
    return status ? this._rooms.filter((item) => item.status === status) : this._rooms;
  }

  getRoom(indexRoom: string): Room | undefined {
    return this._rooms.find((item) => item.indexRoom === indexRoom);
  }

  createRoom(client1Login: string, client1Index: string): void {
    const newRoom: Room = {
      client1Login,
      client1Index,
      client2Login: null,
      client2Index: null,
      indexRoom: crypto.randomUUID(),
      status: 'open',
    };

    this._rooms.push(newRoom);
  }

  addUserToRoom(client2Login: string, client2Index: string, indexRoom: string): void {
    const room = this.getRoom(indexRoom);
    if (room) {
      room.client2Login = client2Login;
      room.client2Index = client2Index;
      room.status = 'closed';
    }
  }
}

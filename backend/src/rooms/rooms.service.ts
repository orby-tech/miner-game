import { Injectable } from '@nestjs/common';

export type Room = {
  lastStep: string;
  lastStepFoundStatus: boolean;
  stats: Record<string, number>;
};

@Injectable()
export class RoomsService {
  rooms = new Map<string, Room>();

  getRoom(roomId: string): Room {
    console.log('Rooms:', this.rooms);
    return (
      this.rooms.get(roomId) || {
        lastStep: '',
        lastStepFoundStatus: false,
        stats: {},
      }
    );
  }

  addStats(roomId: string, name: string): void {
    const room = this.getRoom(roomId);

    if (!room.stats[name]) {
      room.stats[name] = 0;
    }

    room.stats[name]++;

    this.setRoom(roomId, room);
  }

  getStats(roomId: string): Record<string, number> {
    const room = this.getRoom(roomId);
    return room.stats;
  }

  setRoom(roomId: string, room: Room): void {
    this.rooms.set(roomId, room);
  }

  removeRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  setLastStep(
    roomId: string,
    lastStep: string,
    lastStepFoundStatus: boolean,
  ): void {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    room.lastStep = lastStep;
    room.lastStepFoundStatus = lastStepFoundStatus;
    this.setRoom(roomId, room);
  }
}

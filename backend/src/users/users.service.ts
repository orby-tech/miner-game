import { Injectable } from '@nestjs/common';
import e from 'express';

export type User = {
  name: string;
  client: any;
  roomId?: string;
};

@Injectable()
export class UsersService {
  users = [] as User[];

  addUser(name: string, client: any, roomId?: string) {
    this.users.push({ name, client, roomId });
  }

  getUserByClient(client: any) {
    return this.users.find((user) => user.client === client);
  }

  getUsersByRoom(roomId: string) {
    return this.users
      .filter((user) => user.roomId === roomId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  setUserRoom(client: any, roomId: string, userName?: string) {
    const user = this.getUserByClient(client);
    if (!user) {
      if (!userName) {
        throw new Error('User not found');
      } else {
        console.log('User not found, adding user');
        this.addUser(userName, client, roomId);
      }
    } else {
      user.roomId = roomId;
    }
  }

  removeUser(client: any) {
    this.users = this.users.filter((user) => user.client !== client);
  }
}

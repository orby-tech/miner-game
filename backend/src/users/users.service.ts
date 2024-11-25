import { Injectable } from '@nestjs/common';

export type User = {
  name: string;
  client: any;
  roomId?: string;
};

@Injectable()
export class UsersService {
  users = [] as User[];

  addUser(name: string, client: any) {
    this.users.push({ name, client });
  }

  getUserByClient(client: any) {
    return this.users.find((user) => user.client === client);
  }

  getUsersByRoom(roomId: string) {
    return this.users
      .filter((user) => user.roomId === roomId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  setUserRoom(client: any, roomId: string) {
    const user = this.getUserByClient(client);
    if (!user) {
      throw new Error('User not found');
    }
    user.roomId = roomId;
  }

  removeUser(client: any) {
    this.users = this.users.filter((user) => user.client !== client);
  }
}

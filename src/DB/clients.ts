import { Client } from '../types/DBTypes';

export class Clients {
  _clients: Client[] = [];

  getClients(): Client[] {
    return this._clients;
  }

  addClient(login: string, password: string): void {
    const newClient = {
      login,
      password,
      isLogged: true,
      index: crypto.randomUUID(),
    };
    this._clients.push(newClient);
  }

  getClient(login: string): Client | undefined {
    return this._clients.find((item) => item.login === login);
  }

  checkPassword(login: string, basePassword: string): boolean {
    const client = this.getClient(login);
    if (client) {
      return client.password === basePassword ? true : false;
    } else {
      return false;
    }
  }

  isLogged(login: string): boolean {
    const client = this.getClient(login);
    return client ? client.isLogged : false;
  }
}

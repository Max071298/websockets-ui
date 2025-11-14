class Clients {
  _clients: Client[] = [];

  getClients(): Client[] {
    return this._clients;
  }

  addClient(login: string, password: string): void {
    const newClient = {
      login,
      password,
      isLogged: true,
      index: '123',
    };
    this._clients.push(newClient);
  }

  getClient(login: string): Client | undefined {
    return this._clients.find((item) => item.login === login);
  }
}

export const clientsDB = new Clients();

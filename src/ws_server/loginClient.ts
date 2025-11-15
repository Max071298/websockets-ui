import { IncomingData } from '../types/incomingMessageTypes';
import { Clients } from '../DB/clients';
import { makeJSONRes } from '../utils';
import { OutgoingMessageType } from '../types/outgoingMessageTypes';
import { extendedWS } from '../types/extendedWS';

export function loginClient(userInfo: IncomingData, ws: extendedWS, clientsDB: Clients): void {
  const login = userInfo.name;
  const password = userInfo.password;
  let error = false;
  let errorText = '';
  let clientIndex = '';

  const isExists = clientsDB.getClient(login) ? true : false;

  if (isExists) {
    clientIndex = clientsDB.getClient(login)?.index as string;
    if (clientsDB.checkPassword(login, password)) {
      if (clientsDB.isLogged(login)) {
        error = true;
        errorText = `User ${login} is already logged in`;
      } else {
        ws.login = login;
        ws.index = clientIndex;
      }
    } else {
      error = true;
      errorText = 'Incorrect password';
    }
  } else {
    clientsDB.addClient(login, password);
    const newClient = clientsDB.getClient(login);
    if (newClient) clientIndex = newClient.index;
    ws.login = login;
    ws.index = clientIndex;
  }

  ws.send(makeJSONRes(OutgoingMessageType.Registration, { name: login, index: clientIndex, error, errorText }));
  return;
}

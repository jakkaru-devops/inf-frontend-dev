import io from 'socket.io-client';
import { API_SERVER_URL, ENV } from 'config/env';

class SocketService {
  public socket: SocketIOClient.Socket = io(API_SERVER_URL, {
    // key: Math.random().toString(),
    // forceNew: true,
    // reconnection: true,
    // reconnectionDelay: 500,
    // reconnectionAttempts: Infinity,
    // secure: true,
    // timeout: 500,
    // autoConnect: false,
    forceNew: true,
    autoConnect: true,
    reconnection: true,
    rememberUpgrade: true,
    transports: ['websocket', 'polling'],
    rejectUnauthorized: false,
  });

  async connect(userId: string) {
    this.socket.connect().emit('CLIENT:USER_CONNECTED', userId);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

const socketService = new SocketService();

export default socketService;

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado via WebSocket na LAN: [${socket.id}]`);

    // Monitores de TV entram na sala especifica
    socket.on('join:monitor', () => {
      socket.join('monitor-room');
      console.log(`📺 Monitor TV ingressou na sala [monitor-room]: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: [${socket.id}]`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO ainda não foi inicializado no servidor.');
  }
  return io;
}

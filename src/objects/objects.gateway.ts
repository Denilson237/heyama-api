import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ObjectsGateway {
  @WebSocketServer()
  server: Server;

  notifyObjectCreated(object: any) {
    this.server.emit('objectCreated', object);
  }

  notifyObjectDeleted(id: string) {
    this.server.emit('objectDeleted', id);
  }

  notifyObjectLiked(data: { id: string; likesCount: number }) {
    this.server.emit('objectLiked', data);
  }
  
}
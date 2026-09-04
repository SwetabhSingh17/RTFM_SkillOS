import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

// Map of userId to their active socket instances
const connectedUsers = new Map<number, Set<string>>();

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: \${socket.id}`);

    // In a real app, userId should be extracted from auth tokens
    socket.on("authenticate", (userId: number) => {
      console.log(`[WebSocket] User \${userId} authenticated on socket \${socket.id}`);
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)!.add(socket.id);
      
      // Join a room specific to this user to make broadcasting easier
      socket.join(`user_\${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: \${socket.id}`);
      // Remove from tracking map
      for (const [userId, sockets] of connectedUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            connectedUsers.delete(userId);
          }
          break;
        }
      }
    });
  });

  console.log("🟢 WebSocket Server initialized.");
  return io;
}

/**
 * Emit an event to a specific user (using their private room).
 */
export function emitToUser(userId: number, event: string, data: any) {
  if (io) {
    io.to(`user_\${userId}`).emit(event, data);
  } else {
    console.warn(`[WebSocket] Cannot emit event '\${event}' to user \${userId} because IO is not initialized.`);
  }
}

/**
 * Broadcast an event to all connected clients.
 */
export function broadcastEvent(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

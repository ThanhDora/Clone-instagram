import { io, Socket } from "socket.io-client";

type SocketEventMap = {
  [key: string]: (...args: unknown[]) => void;
};

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private options: Record<string, unknown>;
  private eventHandlers: Map<string, Set<(...args: unknown[]) => void>> =
    new Map();

  constructor(url?: string, options?: Record<string, unknown>) {
    this.url = url || import.meta.env.VITE_WS_URL || "http://localhost:3000";
    this.options = {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      ...options,
    };
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.url, this.options);

    this.socket.on("connect", () => {
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason) => {
      this.emit("disconnect", reason);
    });

    this.socket.on("connect_error", (error) => {
      this.emit("connect_error", error);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      this.emit("reconnect", attemptNumber);
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      this.emit("reconnect_attempt", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      this.emit("reconnect_error", error);
    });

    this.socket.on("reconnect_failed", () => {
      this.emit("reconnect_failed");
    });

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });

    this.socket.connect();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T extends keyof SocketEventMap>(
    event: string,
    handler: SocketEventMap[T]
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off<T extends keyof SocketEventMap>(
    event: string,
    handler?: SocketEventMap[T]
  ): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
      this.socket?.off(event, handler);
    } else {
      this.eventHandlers.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getId(): string | undefined {
    return this.socket?.id;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

const websocketService = new WebSocketService();

export default websocketService;
export { WebSocketService };

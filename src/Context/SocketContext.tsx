import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      console.log("No token found, cannot connect socket");
      return;
    }

    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    if (socketRef.current) {
      console.log("Disconnecting existing socket");
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
    }

    console.log("Connecting to socket server...");

    const socketUrl =
      import.meta.env.VITE_WS_URL;
    console.log("Socket URL:", socketUrl);
    console.log("Token available:", !!token);
    console.log("Token length:", token?.length || 0);

    if (!socketUrl) {
      console.error("❌ Socket URL is not configured");
      return;
    }

    const newSocket = io(socketUrl, {
      path: "/socket.io/",
      auth: {
        token: token,
      },
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 2000,
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
    });

    newSocket.io.on("error", (error) => {
      console.error("❌ Socket.IO engine error:", error);
    });

    newSocket.io.on("open", () => {
      console.log("🔓 Socket.IO engine opened");
    });

    newSocket.io.on("close", (reason) => {
      console.log("🔒 Socket.IO engine closed:", reason);
    });

    newSocket.io.on("reconnect_attempt", () => {
      console.log("🔄 Socket.IO engine reconnect attempt");
    });

    newSocket.io.on("reconnect", () => {
      console.log("✅ Socket.IO engine reconnected");
    });

    newSocket.io.on("reconnect_error", (error) => {
      console.error("❌ Socket.IO engine reconnect error:", error);
    });

    newSocket.io.on("reconnect_failed", () => {
      console.error("❌ Socket.IO engine reconnect failed");
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to chat server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from chat server:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      console.error("Error message:", error.message);
      if (error instanceof Error) {
        console.error("Error stack:", error.stack);
      }
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(
        "✅ Reconnected to chat server after",
        attemptNumber,
        "attempts"
      );
      setIsConnected(true);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnect attempt", attemptNumber);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Reconnect error:", error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAndConnect = () => {
      if (!mounted) return;

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      console.log("🔍 Checking token for socket connection:", !!token);

      if (token) {
        const shouldConnect =
          !socketRef.current || !socketRef.current.connected;
        if (shouldConnect) {
          console.log("🔌 Token found, connecting socket...");
          connect();
        } else {
          console.log("✅ Socket already connected");
        }
      } else {
        if (socketRef.current) {
          console.log("🔌 No token, disconnecting socket...");
          disconnect();
        }
      }
    };

    const initializeSocket = () => {
      if (mounted) {
        checkAndConnect();
      }
    };

    initializeSocket();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "access_token") {
        console.log("📦 Storage changed, rechecking socket connection");
        if (mounted) {
          checkAndConnect();
        }
      }
    };

    const handleFocus = () => {
      console.log("👁️ Window focused, rechecking socket connection");
      if (mounted) {
        checkAndConnect();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    const intervalId = setInterval(() => {
      if (mounted) {
        const token =
          localStorage.getItem("token") || localStorage.getItem("access_token");
        if (token && (!socketRef.current || !socketRef.current.connected)) {
          console.log("🔄 Interval check: reconnecting socket...");
          checkAndConnect();
        }
      }
    }, 5000);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, connect, disconnect }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketInstance = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "https://hackathon-l8py.onrender.com");

      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        if (user.orgId) {
          socketInstance.emit("join_org", { orgId: user.orgId });
        }
      });

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

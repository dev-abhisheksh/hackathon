import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";

const useSocket = (eventName, callback) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);

  return socket;
};

export default useSocket;

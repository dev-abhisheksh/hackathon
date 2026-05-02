let ioInstance;

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_org", ({ orgId }) => {
      if (orgId) {
        socket.join(orgId);
        console.log(`Socket ${socket.id} joined org ${orgId}`);
      }
    });

    socket.on("join_ticket", ({ ticketId }) => {
      if (ticketId) {
        socket.join(ticketId);
        console.log(`Socket ${socket.id} joined ticket ${ticketId}`);
      }
    });

    socket.on("customer_typing", ({ ticketId, text }) => {
      if (ticketId) {
        socket.to(ticketId).emit("customer_is_typing", { text });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIo = () => {
  return ioInstance;
};

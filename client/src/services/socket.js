import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
});

export const joinBranchRoom = (branchId) => {
  socket.emit("join:branch", branchId);
};

export default socket;
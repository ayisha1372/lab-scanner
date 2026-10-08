import { io } from 'socket.io-client';

// Same origin in dev (Vite proxy) and in production (Express serves the build).
export const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, { autoConnect: true });

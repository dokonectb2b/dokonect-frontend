import { io } from 'socket.io-client';

// Productionda Vercel proxy orqali (same origin) — Mixed Content xatosini oldini olish
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const socket = io(SOCKET_URL, {
  auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
  autoConnect: false,
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 3,
  reconnectionDelay: 3000,
  timeout: 10000,
});

socket.on('connect_error', () => {
  // Backend mavjud bo'lmaganda silent fail
});
socket.on('error', () => {});

export default socket;
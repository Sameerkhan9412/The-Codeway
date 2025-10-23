import { io } from 'socket.io-client';

let socket;

// Initialize Socket.IO connection
export const initializeSocket = (token) => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new connection with authentication token
  socket = io("http://localhost:8000", {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling']
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initializeSocket first.');
    return null;
  }
  return socket;
};

// Join a discussion room
export const joinDiscussion = (discussionId) => {
  if (!socket) return;
  socket.emit('join-discussion', discussionId);
};

// Leave a discussion room
export const leaveDiscussion = (discussionId) => {
  if (!socket) return;
  socket.emit('leave-discussion', discussionId);
};

// Emit typing indicator
export const emitTyping = (discussionId, user) => {
  if (!socket) return;
  socket.emit('typing', { discussionId, user });
};

// Emit stop typing indicator
export const emitStopTyping = (discussionId) => {
  if (!socket) return;
  socket.emit('stop-typing', { discussionId });
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

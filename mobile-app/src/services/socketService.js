import io from 'socket.io-client';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { SOCKET_URL } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  async connect() {
    try {
      // Get the token for authentication
      const token = await storage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        console.log('No token found, skipping socket connection');
        return;
      }

      // Connect to the backend socket server using the configured SOCKET_URL
      console.log('🔌 Connecting to socket server:', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.setupDefaultListeners();
      
      console.log('Socket service initialized');
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Attempting to reconnect...', attemptNumber);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    // Store the listener
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Add the listener to socket
    this.socket.on(event, callback);

    console.log(`📡 Subscribed to event: ${event}`);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }

    console.log(`📡 Unsubscribed from event: ${event}`);
  }

  // Emit an event
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.emit(event, data);
    console.log(`📤 Emitted event: ${event}`, data);
  }

  // Join a room
  joinRoom(room) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.emit('join_room', room);
    console.log(`🚪 Joined room: ${room}`);
  }

  // Leave a room
  leaveRoom(room) {
    if (!this.socket) return;

    this.socket.emit('leave_room', room);
    console.log(`🚪 Left room: ${room}`);
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;


import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext({});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect socket when user is authenticated
      connectSocket();
    } else {
      // Disconnect when user logs out
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const connectSocket = async () => {
    try {
      await socketService.connect();
      
      // Setup connection status listeners
      socketService.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Socket connected in context');
        
        // Join user-specific room
        if (user?._id) {
          socketService.joinRoom(`user:${user._id}`);
        }
        
        // Join role-specific room
        if (user?.role) {
          socketService.joinRoom(`role:${user.role}`);
        }
      });

      socketService.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket disconnected in context');
      });
    } catch (error) {
      console.error('Error connecting socket:', error);
    }
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  const value = {
    socket: socketService.getSocket(),
    isConnected,
    connect: connectSocket,
    disconnect: disconnectSocket,
    on: (event, callback) => socketService.on(event, callback),
    off: (event, callback) => socketService.off(event, callback),
    emit: (event, data) => socketService.emit(event, data),
    joinRoom: (room) => socketService.joinRoom(room),
    leaveRoom: (room) => socketService.leaveRoom(room),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;


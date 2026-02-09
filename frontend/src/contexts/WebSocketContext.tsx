import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { useAuth } from './AuthContext'

interface WebSocketContextType {
  socket: Socket | null
  connected: boolean
  notificationCount: number
  emit: (event: string, data: any) => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
  markNotificationsAsRead: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Conectar ao WebSocket apenas se o usuário estiver autenticado
    if (!user) return

    // Obter URL da API da variável de ambiente ou usar localhost como fallback
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3333';

    const newSocket = io(apiUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado')
      setConnected(true)
      // Registrar usuário no servidor
      newSocket.emit('register', { userId: user.id, userType: user.tipo })
    })

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado')
      setConnected(false)
    })

    // Eventos de notificação
    newSocket.on('nova-nota', (data: any) => {
      console.log('📝 Nova nota recebida:', data)
      toast.success(`Nova nota lançada: ${data.disciplina}`, {
        duration: 5000,
        icon: '📝',
      })
      setNotificationCount(prev => prev + 1)
    })

    newSocket.on('nova-frequencia', (data: any) => {
      console.log('📋 Nova frequência recebida:', data)
      toast(`Frequência registrada: ${data.disciplina}`, {
        duration: 5000,
        icon: '📋',
      })
      setNotificationCount(prev => prev + 1)
    })

    newSocket.on('aviso-geral', (data: any) => {
      console.log('📢 Aviso geral recebido:', data)
      toast(data.mensagem, {
        duration: 6000,
        icon: '📢',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      })
      setNotificationCount(prev => prev + 1)
    })

    newSocket.on('lembrete-evento', (data: any) => {
      console.log('🔔 Lembrete de evento:', data)
      toast(data.mensagem, {
        duration: 5000,
        icon: '🔔',
      })
      setNotificationCount(prev => prev + 1)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  const emit = useCallback((event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data)
    }
  }, [socket, connected])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }, [socket])

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }, [socket])

  const markNotificationsAsRead = useCallback(() => {
    setNotificationCount(0)
  }, [])

  const value: WebSocketContextType = {
    socket,
    connected,
    notificationCount,
    emit,
    on,
    off,
    markNotificationsAsRead,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

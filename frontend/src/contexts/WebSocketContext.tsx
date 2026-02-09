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
  // Retornar valores padrão se o contexto não estiver disponível
  // Isso evita crashes em componentes que tentam usar o WebSocket
  if (!context) {
    console.warn('useWebSocket called outside WebSocketProvider, returning default values')
    return {
      socket: null,
      connected: false,
      notificationCount: 0,
      emit: () => {},
      on: () => {},
      off: () => {},
      markNotificationsAsRead: () => {}
    }
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  
  // Tentar obter o contexto de autenticação de forma segura
  let user: any = null
  let authAvailable = false
  
  try {
    const auth = useAuth()
    user = auth?.user
    authAvailable = true
  } catch (error) {
    // Se o AuthContext não estiver disponível, não conectar ao WebSocket
    console.warn('WebSocketProvider: AuthContext não disponível, WebSocket desabilitado', error)
    authAvailable = false
  }

  useEffect(() => {
    // Não fazer nada se Auth não estiver disponível
    if (!authAvailable) {
      console.log('WebSocket: AuthContext não disponível, aguardando...')
      return
    }
    
    // Conectar ao WebSocket apenas se o usuário estiver autenticado
    if (!user) {
      console.log('WebSocket: Usuário não autenticado, conexão não iniciada')
      return
    }

    try {
      // Obter URL da API da variável de ambiente ou usar localhost como fallback
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3333';
      
      console.log('WebSocket: Tentando conectar em:', apiUrl);

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

      newSocket.on('connect_error', (error: any) => {
        console.warn('⚠️ WebSocket erro de conexão:', error.message)
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
        console.log('WebSocket: Limpando conexão')
        newSocket.close()
      }
    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error)
      return () => {}
    }
  }, [user, authAvailable])

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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../lib/api';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Limpar valores corrompidos
      if (storedToken === 'undefined' || storedToken === 'null') {
        localStorage.removeItem('token');
        setIsLoading(false);
        return;
      }
      if (storedUser === 'undefined' || storedUser === 'null') {
        localStorage.removeItem('user');
        setIsLoading(false);
        return;
      }

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log('✅ AuthProvider: Sessão restaurada do localStorage', { user: parsedUser.nome });
        } catch (parseError) {
          console.error('❌ Erro ao parsear usuário do localStorage:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('ℹ️ AuthProvider: Nenhuma sessão anterior encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao acessar localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: Usuario) => {
    try {
      console.log('🔐 Login iniciado:', { user: newUser.nome, hasToken: !!newToken });
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('✅ Login: Sessão salva com sucesso', {
        tokenSaved: !!localStorage.getItem('token'),
        userSaved: !!localStorage.getItem('user'),
        isAuthenticated: !!newToken
      });
    } catch (error) {
      console.error('❌ Erro ao salvar sessão no localStorage:', error);
    }
  };

  const logout = () => {
    try {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Logout: Sessão removida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover sessão do localStorage:', error);
    }
  };

  // Renderizar apenas quando terminar de carregar
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🎓
          </div>
          <div style={{
            fontSize: '1.2rem',
            color: '#6b7280',
            fontWeight: '600'
          }}>
            Carregando Sistema de Gestão Escolar...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth called outside AuthProvider, returning default values');
    return {
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      isAuthenticated: false
    };
  }
  return context;
};

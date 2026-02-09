import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary: getDerivedStateFromError', error);
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
  }

  private handleReload = () => {
    window.location.href = '/login'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f3f4f6'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px'
          }}>
            <h1 style={{ 
              fontSize: '2rem', 
              marginBottom: '1rem', 
              color: '#ef4444' 
            }}>
              ⚠️ Ops! Algo deu errado
            </h1>
            <p style={{ 
              marginBottom: '1.5rem', 
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              Ocorreu um erro inesperado. Por favor, tente fazer login novamente.
            </p>
            {this.state.error && (
              <details style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.875rem'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  color: '#dc2626',
                  marginBottom: '0.5rem'
                }}>
                  Detalhes do erro (clique para ver)
                </summary>
                <pre style={{ 
                  overflow: 'auto', 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#991b1b'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Ir para Login
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

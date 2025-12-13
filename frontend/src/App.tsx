import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import UserManagement from './pages/UserManagement'
import Dashboard from './pages/Dashboard'
import EquipeDiretivaPage from './pages/EquipeDiretiva'
import FuncionariosPage from './pages/Funcionarios'
import Alunos from './pages/Alunos'
import Professores from './pages/Professores'
import Turmas from './pages/Turmas'
import Disciplinas from './pages/Disciplinas'
import Notas from './pages/Notas'
import Frequencia from './pages/Frequencia'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/user-management" element={<UserManagement />} />

            {/* Rotas privadas */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="equipe-diretiva" element={<EquipeDiretivaPage />} />
              <Route path="funcionarios" element={<FuncionariosPage />} />
              <Route path="alunos" element={<Alunos />} />
              <Route path="professores" element={<Professores />} />
              <Route path="turmas" element={<Turmas />} />
              <Route path="disciplinas" element={<Disciplinas />} />
              <Route path="notas" element={<Notas />} />
              <Route path="frequencia" element={<Frequencia />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

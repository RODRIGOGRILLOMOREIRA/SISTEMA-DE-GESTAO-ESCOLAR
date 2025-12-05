import { useEffect, useState } from 'react'
import { Users, GraduationCap, School, BookOpen } from 'lucide-react'
import { alunosAPI, professoresAPI, turmasAPI, disciplinasAPI } from '../lib/api'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    alunos: 0,
    professores: 0,
    turmas: 0,
    disciplinas: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [alunos, professores, turmas, disciplinas] = await Promise.all([
        alunosAPI.getAll(),
        professoresAPI.getAll(),
        turmasAPI.getAll(),
        disciplinasAPI.getAll(),
      ])

      setStats({
        alunos: alunos.data.length,
        professores: professores.data.length,
        turmas: turmas.data.length,
        disciplinas: disciplinas.data.length,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const cards = [
    { title: 'Disciplinas', value: stats.disciplinas, icon: BookOpen, color: '#f59e0b' },
    { title: 'Professores', value: stats.professores, icon: GraduationCap, color: '#8b5cf6' },
    { title: 'Turmas', value: stats.turmas, icon: School, color: '#10b981' },
    { title: 'Alunos', value: stats.alunos, icon: Users, color: '#3b82f6' },
  ]

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${card.color}20` }}>
                <Icon size={24} color={card.color} />
              </div>
              <div className="stat-info">
                <h3>{card.title}</h3>
                <p className="stat-value">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard

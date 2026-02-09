import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './BackButton.css'

const BackButton = () => {
  const navigate = useNavigate()

  return (
    <button className="back-button-component" onClick={() => navigate(-1)}>
      <ArrowLeft className="back-arrow-desktop" size={24} />
      <span className="back-text-mobile">Voltar</span>
    </button>
  )
}

export default BackButton

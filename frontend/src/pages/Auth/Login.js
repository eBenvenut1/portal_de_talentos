import "./Auth.css"

//components
import { Link } from "react-router-dom"
import Message from "../../components/Message"

//hooks
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

//Redux
import { login, resetAuth } from '../../slices/AuthSlice'
import { Profile, resetUser } from '../../slices/UserSlice'

const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const dispatch = useDispatch()

  const { loading, error, message, success } = useSelector((state) => state.auth)

  const handleSubmit = (e) => {
    e.preventDefault()

    const user = {
      email,
      password
    }

    dispatch(login(user))
  }

  //clean all auth states
  useEffect(() => {
    dispatch(resetAuth())
  }, [dispatch])

  // Após login bem-sucedido, limpe o perfil antigo e busque o novo perfil
  useEffect(() => {
    if (success) {
      dispatch(resetUser());
      dispatch(Profile());
    }
  }, [success, dispatch]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Portal de Talentos</h2>
        <p className="auth-subtitle">Faça login para acessar o portal.</p>
        
        {error && (
          <div className="error-message">
            {message || 'Erro ao fazer login'}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="Digite seu email" 
              onChange={(e) => setEmail(e.target.value)} 
              value={email || ''} 
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input 
              id="password"
              type="password" 
              placeholder="Digite sua senha" 
              onChange={(e) => setPassword(e.target.value)} 
              value={password || ''} 
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Não tem uma conta? <Link to="/users/register">Cadastre-se como candidato</Link>
          </p>
          <p>
            É um gestor? <Link to="/gestor/register">Cadastre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
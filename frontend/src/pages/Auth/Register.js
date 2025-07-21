import "./Auth.css";

// Components
import { Link } from "react-router-dom";
import Message from "../../components/Message";

// Hooks
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// Redux
import { register, resetAuth } from "../../slices/AuthSlice";

const Register = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao_senha, setConfirmacaoSenha] = useState("");
  const [nome_empresa, setNomeEmpresa] = useState("");

  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar se todos os campos obrigatórios estão preenchidos
    if (!nome || !email || !senha || !confirmacao_senha || !nome_empresa) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar se as senhas coincidem
    if (senha !== confirmacao_senha) {
      alert('As senhas não coincidem');
      return;
    }

    const user = {
      nome,
      email,
      senha,
      senha_confirmation: confirmacao_senha, // Corrigido para alinhar com o backend
      nome_empresa,
      tipo_usuario: 'gestor'
    };

    console.log('Dados sendo enviados:', user);
    dispatch(register(user));
  };

  // Clean all auth states
  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registro Gestor</h2>
        <p className="auth-subtitle">Cadastre-se para gerenciar candidatos e oportunidades.</p>
        
        {error && (
          <div className="error-message">
            {typeof error === 'string' ? error : 'Erro ao realizar cadastro'}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome Completo *</label>
            <input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              onChange={(e) => setNome(e.target.value)}
              value={nome}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nome_empresa">Nome da Empresa *</label>
            <input
              id="nome_empresa"
              type="text"
              placeholder="Digite o nome da empresa"
              onChange={(e) => setNomeEmpresa(e.target.value)}
              value={nome_empresa}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha *</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                onChange={(e) => setSenha(e.target.value)}
                value={senha}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmacao_senha">Confirmar Senha *</label>
              <input
                id="confirmacao_senha"
                type="password"
                placeholder="Confirme sua senha"
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                value={confirmacao_senha}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Gestor'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
          <p>
            É um candidato? <Link to="/users/register">Cadastre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
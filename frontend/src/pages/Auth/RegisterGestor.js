import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerGestor } from '../../slices/AuthSlice';
import './Auth.css';

const RegisterGestor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    senha_confirmation: '',
    nome_empresa: '',
    cnpj: '',
    tipo_usuario: 'gestor'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.senha_confirmation) {
      newErrors.senha_confirmation = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.senha_confirmation) {
      newErrors.senha_confirmation = 'Senhas não coincidem';
    }

    if (!formData.nome_empresa.trim()) {
      newErrors.nome_empresa = 'Nome da empresa é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{14}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ deve conter 14 dígitos numéricos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(registerGestor(formData)).unwrap();
      console.log('Gestor registrado com sucesso:', result);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar gestor:', error);
      
      // Handle validation errors from backend
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Cadastro de Gestor</h2>
        <p className="auth-subtitle">
          Crie sua conta como gestor para gerenciar talentos e oportunidades
        </p>

        {error && (
          <div className="error-message">
            {typeof error === 'string' ? error : 'Erro ao realizar cadastro'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : ''}
              placeholder="Digite seu nome completo"
              required
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Digite seu email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha *</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={errors.senha ? 'error' : ''}
                placeholder="Digite sua senha"
                required
              />
              {errors.senha && <span className="error-text">{errors.senha}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="senha_confirmation">Confirmar Senha *</label>
              <input
                type="password"
                id="senha_confirmation"
                name="senha_confirmation"
                value={formData.senha_confirmation}
                onChange={handleChange}
                className={errors.senha_confirmation ? 'error' : ''}
                placeholder="Confirme sua senha"
                required
              />
              {errors.senha_confirmation && (
                <span className="error-text">{errors.senha_confirmation}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nome_empresa">Nome da Empresa *</label>
            <input
              type="text"
              id="nome_empresa"
              name="nome_empresa"
              value={formData.nome_empresa}
              onChange={handleChange}
              className={errors.nome_empresa ? 'error' : ''}
              placeholder="Digite o nome da empresa"
              required
            />
            {errors.nome_empresa && <span className="error-text">{errors.nome_empresa}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cnpj">CNPJ *</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={e => handleChange({ target: { name: 'cnpj', value: e.target.value.replace(/\D/g, '') } })}
              className={errors.cnpj ? 'error' : ''}
              placeholder="Digite o CNPJ (apenas números)"
              maxLength={14}
              required
            />
            {errors.cnpj && <span className="error-text">{errors.cnpj}</span>}
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
            Já tem uma conta? <a href="/login">Faça login</a>
          </p>
          <p>
            É um candidato? <a href="/users/register">Cadastre-se aqui</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterGestor; 
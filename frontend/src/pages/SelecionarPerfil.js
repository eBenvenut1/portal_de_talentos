import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { criarPerfilGestor, criarPerfilCandidato, updateRole, Profile, deleteUser } from '../slices/UserSlice';
import { getHabilidades, resetHabilidades } from '../slices/HabilidadesSlice';
import Select from "react-select";
import './SelecionarPerfil.css';

const SelecionarPerfil = () => {
  const dispatch = useDispatch();
  const { profile, loading, message, error } = useSelector((state) => state.user);
  const { habilidades: habilidadesList, loading: loadingHabilidades } = useSelector((state) => state.habilidades);
  const [showGestorForm, setShowGestorForm] = useState(false);
  const [showCandidatoForm, setShowCandidatoForm] = useState(false);
  const [gestorData, setGestorData] = useState({ nome_empresa: '', cnpj: '' });
  const [candidatoData, setCandidatoData] = useState({ 
    cep: '', 
    endereco: '', 
    telefone: '', 
    dnasc: '',
    habilidades: [],
    formacoes: [{
      curso: "",
      instituicao: "",
      conclusao: "",
      data_inicio: ""
    }]
  });

  // Converter habilidades do backend para formato do react-select
  const habilidadesOptions = Array.isArray(habilidadesList) 
    ? habilidadesList.map(habilidade => ({
        value: habilidade.id,
        label: habilidade.nome
      }))
    : [];

  //Style da caixa de seleção
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "var(--bg-white)",
      color: "var(--text-dark)",
      border: "1px solid var(--border-color)",
      borderRadius: "0.5rem",
      padding: "2px",
      marginBottom: "0.6em",
      boxShadow: "none",
      fontFamily: "inherit"
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 5,
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "var(--primary-color)",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--text-light)",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--text-dark)",
    }),
  };

  // Carregar perfil e habilidades ao montar o componente
  useEffect(() => {
    dispatch(Profile());
    dispatch(resetHabilidades());
    dispatch(getHabilidades());
  }, [dispatch]);

  // Busca endereço ao preencher o CEP
  useEffect(() => {
    const fetchEndereco = async () => {
      if (candidatoData.cep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${candidatoData.cep}/json/`);
          const data = await res.json();

          if (data.erro) {
            setCandidatoData(prev => ({ ...prev, endereco: "CEP não encontrado" }));
          } else {
            setCandidatoData(prev => ({ 
              ...prev, 
              endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}` 
            }));
          }
        } catch (err) {
          setCandidatoData(prev => ({ ...prev, endereco: "Erro ao buscar endereço" }));
          console.error("Erro ViaCEP:", err);
        }
      }
    };

    fetchEndereco();
  }, [candidatoData.cep]);

  // Dados do usuário
  const roleAtual = profile?.user?.role_atual;
  const temGestor = !!profile?.user?.gestor;
  const temCandidato = !!profile?.user?.candidato;
  const nomeUsuario = profile?.user?.nome || 'Usuário';

  // Trocar role usando Redux
  const trocarRole = async (role) => {
    console.log('🔍 trocarRole chamado com:', role);
    console.log('🔍 roleAtual atual:', roleAtual);
    
    if (role === roleAtual) {
      console.log('🔍 Role já está ativo, não fazendo nada');
      return;
    }
    
    console.log('🔍 Dispachando updateRole...');
    dispatch(updateRole({ role_atual: role })).then((action) => {
      console.log('🔍 updateRole result:', action);
      if (!action.error) {
        console.log('🔍 Role atualizado com sucesso, recarregando profile...');
        dispatch(Profile());
      } else {
        console.log('🔍 Erro ao atualizar role:', action.error);
      }
    });
  };

  // Handlers para criar perfis
  const handleCriarGestor = (e) => {
    e.preventDefault();
    dispatch(criarPerfilGestor(gestorData)).then((action) => {
      if (!action.error) {
        setShowGestorForm(false);
        setGestorData({ nome_empresa: '', cnpj: '' });
        dispatch(Profile());
      }
    });
  };

  const addFormacao = () => {
    setCandidatoData(prev => ({
      ...prev,
      formacoes: [...prev.formacoes, {
        curso: "",
        instituicao: "",
        conclusao: "",
        data_inicio: ""
      }]
    }));
  };

  const removeFormacao = (index) => {
    setCandidatoData(prev => ({
      ...prev,
      formacoes: prev.formacoes.filter((_, i) => i !== index)
    }));
  };

  const updateFormacao = (index, field, value) => {
    setCandidatoData(prev => {
      const newFormacoes = [...prev.formacoes];
      newFormacoes[index][field] = value;
      return { ...prev, formacoes: newFormacoes };
    });
  };

  const handleCriarCandidato = (e) => {
    e.preventDefault();

    // Validar se todos os campos obrigatórios estão preenchidos
    if (!candidatoData.cep || !candidatoData.telefone || !candidatoData.dnasc) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar se pelo menos uma habilidade foi selecionada
    if (!candidatoData.habilidades || candidatoData.habilidades.length === 0) {
      alert('Por favor, selecione pelo menos uma habilidade');
      return;
    }

    // Validar tamanho do endereço
    if (candidatoData.endereco && candidatoData.endereco.length > 70) {
      alert('O endereço deve ter no máximo 70 caracteres');
      return;
    }

    const habilidadesIds = candidatoData.habilidades.map((item) => item.value);

    // Formatar a data para o formato ISO
    const dataFormatada = candidatoData.dnasc ? new Date(candidatoData.dnasc).toISOString().split('T')[0] : null;

    const dadosParaEnviar = {
      cep: candidatoData.cep.replace(/\D/g, ""), // Remover caracteres não numéricos
      endereco: candidatoData.endereco,
      telefone: candidatoData.telefone.replace(/\D/g, ""), // Remover caracteres não numéricos
      dnasc: dataFormatada,
      habilidades: habilidadesIds,
      formacoes: candidatoData.formacoes.filter(f => f.curso && f.instituicao).map(f => ({
        ...f,
        conclusao: f.conclusao ? new Date(f.conclusao).toISOString().split('T')[0] : null,
        data_inicio: f.data_inicio ? new Date(f.data_inicio).toISOString().split('T')[0] : null
      }))
    };

    console.log('Dados sendo enviados:', dadosParaEnviar);
    dispatch(criarPerfilCandidato(dadosParaEnviar)).then((action) => {
      if (!action.error) {
        setShowCandidatoForm(false);
        setCandidatoData({ 
          cep: '', 
          endereco: '', 
          telefone: '', 
          dnasc: '',
          habilidades: [],
          formacoes: [{
            curso: "",
            instituicao: "",
            conclusao: "",
            data_inicio: ""
          }]
        });
        dispatch(Profile());
      }
    });
  };

  // Função para formatar o role atual
  const formatRoleAtual = (role) => {
    if (!role) return 'Nenhum perfil ativo';
    return role === 'gestor' ? 'Gestor' : 'Candidato';
  };

  // Handler para excluir usuário
  const handleDeleteUser = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      dispatch(deleteUser()).then((action) => {
        if (!action.error) {
          // Limpar localStorage e redirecionar para login após exclusão
          localStorage.clear();
          window.location.href = '/login';
        }
      });
    }
  };

  return (
    <div className="selecionar-perfil-container">
      <div className="selecionar-perfil-card">
        {/* Header */}
        <div className="perfil-header">
          <h1>Selecionar Perfil</h1>
          <p className="welcome-text">Olá, {nomeUsuario}!</p>
          <div className="current-role">
            <span className="role-label">Perfil atual:</span>
            <span className={`role-value ${roleAtual ? 'active' : 'inactive'}`}>
              {formatRoleAtual(roleAtual)}
            </span>
          </div>
        </div>

        {/* Status dos perfis */}
        <div className="perfis-status">
          <div className={`perfil-status ${temGestor ? 'disponivel' : 'indisponivel'}`}>
            <div className="status-icon">
              {temGestor ? '✓' : '○'}
            </div>
            <div className="status-text">
              <span className="status-title">Perfil Gestor</span>
              <span className="status-desc">
                {temGestor ? 'Disponível' : 'Não criado'}
              </span>
            </div>
          </div>

          <div className={`perfil-status ${temCandidato ? 'disponivel' : 'indisponivel'}`}>
            <div className="status-icon">
              {temCandidato ? '✓' : '○'}
            </div>
            <div className="status-text">
              <span className="status-title">Perfil Candidato</span>
              <span className="status-desc">
                {temCandidato ? 'Disponível' : 'Não criado'}
              </span>
            </div>
          </div>
      </div>

        {/* Botões de ação */}
        <div className="acoes-container">
          {/* Botão Gestor */}
          <div className="acao-item">
      <button
              className={`acao-btn gestor ${roleAtual === 'gestor' ? 'ativo' : ''} ${loading ? 'loading' : ''}`}
        onClick={() => {
          if (temGestor) {
            trocarRole('gestor');
          } else {
            setShowGestorForm(true);
          }
        }}
              disabled={loading}
            >
              <div className="btn-content">
                <div className="btn-icon">🏢</div>
                <div className="btn-text">
                  <span className="btn-title">
                    {temGestor ? 'Acessar Perfil Gestor' : 'Criar Perfil Gestor'}
                  </span>
                  <span className="btn-desc">
                    {temGestor ? 'Gerenciar empresa e reuniões' : 'Cadastrar dados da empresa'}
                  </span>
                </div>
              </div>
      </button>
          </div>

          {/* Botão Candidato */}
          <div className="acao-item">
      <button
              className={`acao-btn candidato ${roleAtual === 'candidato' ? 'ativo' : ''} ${loading ? 'loading' : ''}`}
        onClick={() => {
          if (temCandidato) {
            trocarRole('candidato');
          } else {
            setShowCandidatoForm(true);
          }
        }}
              disabled={loading}
            >
              <div className="btn-content">
                <div className="btn-icon">👤</div>
                <div className="btn-text">
                  <span className="btn-title">
                    {temCandidato ? 'Acessar Perfil Candidato' : 'Criar Perfil Candidato'}
                  </span>
                  <span className="btn-desc">
                    {temCandidato ? 'Gerenciar perfil e candidaturas' : 'Cadastrar dados pessoais'}
                  </span>
                </div>
              </div>
      </button>
          </div>
        </div>

        {/* Loading e mensagens */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processando...</p>
          </div>
        )}

        {message && (
          <div className={`message ${error ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Botão de excluir usuário */}
        <div className="delete-user-section">
          <button 
            className="delete-user-btn"
            onClick={handleDeleteUser}
            disabled={loading}
          >
            🗑️ Excluir Conta
          </button>
          <p className="delete-warning">
            Atenção: Esta ação excluirá permanentemente sua conta e todos os dados associados.
          </p>
        </div>

      {/* Formulário para criar perfil de gestor */}
      {showGestorForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Criar Perfil de Gestor</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowGestorForm(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCriarGestor} className="form">
                <div className="form-group">
                  <label htmlFor="nome_empresa">Nome da Empresa *</label>
          <input
                    id="nome_empresa"
            type="text"
                    placeholder="Digite o nome da empresa"
            value={gestorData.nome_empresa}
            onChange={e => setGestorData({ ...gestorData, nome_empresa: e.target.value })}
            required
          />
                </div>
                <div className="form-group">
                  <label htmlFor="cnpj">CNPJ *</label>
          <input
                    id="cnpj"
            type="text"
                    placeholder="00.000.000/0000-00"
            value={gestorData.cnpj}
            onChange={e => setGestorData({ ...gestorData, cnpj: e.target.value })}
            required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowGestorForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Perfil'}
                  </button>
                </div>
        </form>
            </div>
          </div>
      )}

      {/* Formulário para criar perfil de candidato */}
      {showCandidatoForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Criar Perfil de Candidato</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCandidatoForm(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCriarCandidato} className="form">
                <div className="form-group">
                  <label htmlFor="cep">CEP *</label>
          <input
                    id="cep"
            type="text"
                    placeholder="00000-000"
            value={candidatoData.cep}
            onChange={e => setCandidatoData({ ...candidatoData, cep: e.target.value })}
            required
          />
                </div>
                <div className="form-group">
                  <label htmlFor="endereco">Endereço *</label>
          <input
                    id="endereco"
            type="text"
                    placeholder="Rua, número, bairro, cidade"
            value={candidatoData.endereco}
            onChange={e => setCandidatoData({ ...candidatoData, endereco: e.target.value })}
            required
          />
                </div>
                <div className="form-group">
                  <label htmlFor="telefone">Telefone *</label>
          <input
                    id="telefone"
            type="text"
                    placeholder="(00) 00000-0000"
            value={candidatoData.telefone}
            onChange={e => setCandidatoData({ ...candidatoData, telefone: e.target.value })}
            required
          />
                </div>
                <div className="form-group">
                  <label htmlFor="dnasc">Data de Nascimento *</label>
          <input
                    id="dnasc"
            type="date"
            value={candidatoData.dnasc}
            onChange={e => setCandidatoData({ ...candidatoData, dnasc: e.target.value })}
            required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="habilidades">Habilidades *</label>
                  {loadingHabilidades ? (
                    <div className="loading">
                      <div className="loading-spinner"></div>
                      <p>Carregando habilidades...</p>
                    </div>
                  ) : (
                    <Select
                      options={habilidadesOptions}
                      isMulti
                      value={candidatoData.habilidades}
                      onChange={(selected) => setCandidatoData(prev => ({ ...prev, habilidades: selected }))}
                      placeholder="Selecione suas habilidades"
                      styles={customStyles}
                      noOptionsMessage={() => "Nenhuma habilidade encontrada"}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Formações</label>
                  {candidatoData.formacoes.map((formacao, index) => (
                    <div key={index} className="formacao-item">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Curso *</label>
                          <input
                            type="text"
                            placeholder="Nome do curso"
                            value={formacao.curso}
                            onChange={(e) => updateFormacao(index, 'curso', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Instituição *</label>
                          <input
                            type="text"
                            placeholder="Nome da instituição"
                            value={formacao.instituicao}
                            onChange={(e) => updateFormacao(index, 'instituicao', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Data de Início</label>
                          <input
                            type="date"
                            value={formacao.data_inicio}
                            onChange={(e) => updateFormacao(index, 'data_inicio', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Data de Conclusão</label>
                          <input
                            type="date"
                            value={formacao.conclusao}
                            onChange={(e) => updateFormacao(index, 'conclusao', e.target.value)}
                          />
                        </div>
                      </div>
                      {candidatoData.formacoes.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeFormacao(index)}
                          style={{
                            background: 'var(--error-color)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            width: 'auto',
                            marginTop: '0.5rem'
                          }}
                        >
                          Remover Formação
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addFormacao}
                    style={{
                      background: 'var(--secondary-color)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      width: 'auto',
                      marginTop: '1rem'
                    }}
                  >
                    + Adicionar Formação
                  </button>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCandidatoForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Perfil'}
                  </button>
                </div>
        </form>
            </div>
          </div>
      )}
      </div>
    </div>
  );
};

export default SelecionarPerfil; 
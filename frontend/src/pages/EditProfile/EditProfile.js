// Página de edição de perfil do candidato. Para gestor, use EditGestorProfile.js
import './EditProfile.css';

// hooks
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from "react-select"
import useRequireRole from '../../hooks/useRequireRole';

// redux
import { Profile, resetUser, updateCandidato, deleteCandidato } from '../../slices/UserSlice';
import { getHabilidades, resetHabilidades } from '../../slices/HabilidadesSlice';

// components
import Message from '../../components/Message';

const EditProfile = () => {
    useRequireRole();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [endereco, setEndereco] = useState('');
    const [cep, setCep] = useState('');
    const [habilidadeSelecionadas, setHabilidadeSelecionadas] = useState([]);
    const [formacao, setFormacao] = useState('');
    const [telefone, setTelefone] = useState('');
    const [password, setPassword] = useState('');
    const [formacoes, setFormacoes] = useState([
        { curso: '', instituicao: '', conclusao: '' }
    ]);

    const dispatch = useDispatch();

    const { profile, message, error, loading } = useSelector((state) => state.user);
    console.log('Profile no EditProfile:', profile);
    const { habilidades: habilidadesList, loading: loadingHabilidades } = useSelector((state) => state.habilidades);

    // Converter habilidades do backend para formato do react-select
    const habilidadesOptions = useMemo(() => (
        Array.isArray(habilidadesList) 
            ? habilidadesList.map(habilidade => ({
                value: habilidade.id,
                label: habilidade.nome
            }))
            : []
    ), [habilidadesList]);

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

    useEffect(() => {
        dispatch(Profile());
        dispatch(resetHabilidades());
        dispatch(getHabilidades());
    }, [dispatch]);

    // Ajustar o preenchimento dos campos para usar profile.user e profile.user.candidato
    useEffect(() => {
        if (profile && profile.user) {
            setFullName(profile.user.nome || '');
            setEmail(profile.user.email || '');
            
            // Se for candidato, carregar dados do candidato
            if (profile.user.candidato) {
                setEndereco(profile.user.candidato.endereco || '');
                setCep(profile.user.candidato.cep || '');
                setTelefone(profile.user.candidato.telefone || '');
            }
        }
    }, [profile]);

    // Preencher as formações do perfil ao carregar
    useEffect(() => {
        if (profile && profile.user && profile.user.candidato && Array.isArray(profile.user.candidato.formacoes)) {
            if (profile.user.candidato.formacoes.length > 0) {
                setFormacoes(profile.user.candidato.formacoes.map(f => ({
                    curso: f.curso || '',
                    instituicao: f.instituicao || '',
                    conclusao: f.conclusao ? new Date(f.conclusao).toISOString().split('T')[0] : '',
                    data_inicio: f.data_inicio ? new Date(f.data_inicio).toISOString().split('T')[0] : ''
                })));
            } else {
                setFormacoes([{ curso: '', instituicao: '', conclusao: '', data_inicio: '' }]);
            }
        }
    }, [profile]);

    const addFormacao = () => {
        setFormacoes([...formacoes, { curso: '', instituicao: '', conclusao: '', data_inicio: '' }]);
    };

    const removeFormacao = (index) => {
        const newFormacoes = formacoes.filter((_, i) => i !== index);
        setFormacoes(newFormacoes.length > 0 ? newFormacoes : [{ curso: '', instituicao: '', conclusao: '' }]);
    };

    const updateFormacao = (index, field, value) => {
        const newFormacoes = [...formacoes];
        newFormacoes[index][field] = value;
        setFormacoes(newFormacoes);
    };

    // Ajustar o preenchimento das habilidades para usar profile.user.candidato.habilidades
    useEffect(() => {
        console.log('🔍 Debug habilidades - profile:', profile);
        console.log('🔍 Debug habilidades - profile.user:', profile?.user);
        console.log('🔍 Debug habilidades - profile.user.candidato:', profile?.user?.candidato);
        console.log('🔍 Debug habilidades - profile.user.candidato.habilidades:', profile?.user?.candidato?.habilidades);
        console.log('🔍 Debug habilidades - habilidadesOptions:', habilidadesOptions);
        
        if (
            profile &&
            profile.user &&
            profile.user.candidato &&
            profile.user.candidato.habilidades &&
            Array.isArray(profile.user.candidato.habilidades) &&
            habilidadesOptions.length > 0
        ) {
            console.log('🔍 Debug habilidades - Carregando habilidades do candidato');
            // Mapear habilidades do backend para opções do select
            const habilidadesArray = profile.user.candidato.habilidades.map(hab => {
                const opcao = habilidadesOptions.find(opt =>
                    opt.label.toLowerCase() === hab.nome.toLowerCase()
                );
                return opcao || { value: hab.id, label: hab.nome };
            });
            console.log('🔍 Debug habilidades - habilidadesArray:', habilidadesArray);
            setHabilidadeSelecionadas(habilidadesArray);
        } else {
            console.log('🔍 Debug habilidades - Condições não atendidas para carregar habilidades');
        }
    }, [profile, habilidadesOptions]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificação segura para evitar erro de .map()
        const habilidadesString = Array.isArray(habilidadeSelecionadas)
            ? habilidadeSelecionadas.map((item) => item.value).join(", ")
            : '';

        const userData = {
            fullName,
            email,
            endereco,
            cep,
            habilidade: habilidadesString,
            formacoes: formacoes.filter(f => f.curso && f.instituicao).map(f => ({
                ...f,
                conclusao: f.conclusao ? new Date(f.conclusao).toISOString().split('T')[0] : null,
                data_inicio: f.data_inicio ? new Date(f.data_inicio).toISOString().split('T')[0] : null
            })),
            telefone
        };

        if (password) {
            userData.password = password;
        }

        try {
           const result = await dispatch(updateCandidato(userData)).unwrap();

            // Opcional: recarregar o perfil para mostrar dados atualizados
            if(result){}

            setTimeout(() => {
                dispatch(resetUser());
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        }
    };

    // Handler para excluir candidatura
    const handleDeleteCandidato = () => {
        if (window.confirm('Tem certeza que deseja excluir seu perfil de candidato? Esta ação não pode ser desfeita.')) {
            dispatch(deleteCandidato()).then((action) => {
                if (!action.error) {
                    // Redirecionar para selecionar perfil após exclusão
                    window.location.href = '/selecionar-perfil';
                }
            });
        }
    };

    // Busca endereço ao preencher o CEP
    useEffect(() => {
        const fetchEndereco = async () => {
            if (cep.length === 8) {
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();

                    if (data.erro) {
                        setEndereco("CEP não encontrado");
                    } else {
                        setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
                    }
                } catch (err) {
                    setEndereco("Erro ao buscar endereço");
                    console.error("Erro ViaCEP:", err);
                }
            }
        };

        fetchEndereco();
    }, [cep]);

    if (loading && !profile) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>Carregando perfil...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Editar Perfil</h2>
                <p className="auth-subtitle">Atualize suas informações pessoais</p>
                
                {error && !profile.user?.candidato && (
                    <div className="error-message">
                        {message || 'Erro ao buscar perfil'}
                    </div>
                )}

                {message && !error && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nome Completo</label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="Digite seu nome completo"
                            value={fullName}
                            disabled
                            required
                        />
                        <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                            O nome não pode ser alterado
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Seu email"
                            disabled
                            value={email || ''}
                        />
                        <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                            O email não pode ser alterado
                        </small>
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
                                id="habilidades"
                                options={habilidadesOptions}
                                isMulti
                                value={habilidadeSelecionadas}
                                onChange={setHabilidadeSelecionadas}
                                placeholder="Selecione suas habilidades"
                                styles={customStyles}
                            />
                        )}
                    </div>

                    

                    {/* Formulário dinâmico de novas formações */}
                    <div className="form-group">
                      <label>Adicionar/Editar Formações</label>
                      {formacoes.map((formacao, index) => (
                        <div key={index} className="formacao-item">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Curso</label>
                              <input
                                type="text"
                                placeholder="Nome do curso"
                                value={formacao.curso}
                                onChange={(e) => updateFormacao(index, 'curso', e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Instituição</label>
                              <input
                                type="text"
                                placeholder="Nome da instituição"
                                value={formacao.instituicao}
                                onChange={(e) => updateFormacao(index, 'instituicao', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Data de Conclusão</label>
                            <input
                              type="date"
                              value={formacao.conclusao}
                              onChange={(e) => updateFormacao(index, 'conclusao', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Data de Início</label>
                            <input
                              type="date"
                              value={formacao.data_inicio}
                              onChange={(e) => updateFormacao(index, 'data_inicio', e.target.value)}
                            />
                          </div>
                          {formacoes.length > 1 && (
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
                                width: 'auto'
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
                          width: 'auto'
                        }}
                      >
                        + Adicionar Formação
                      </button>
                    </div>

                    

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefone">Telefone</label>
                            <input
                                id="telefone"
                                type="tel"
                                placeholder="(11) 99999-9999"
                                onChange={(e) => setTelefone(e.target.value)}
                                value={telefone}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cep">CEP</label>
                            <input
                                id="cep"
                                type="text"
                                placeholder="00000-000"
                                onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                                value={cep}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="endereco">Endereço</label>
                        <input
                            id="endereco"
                            type="text"
                            placeholder="Digite seu endereço completo"
                            onChange={(e) => setEndereco(e.target.value)}
                            value={endereco}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Nova Senha (opcional)</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Deixe em branco para manter a senha atual"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                        <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                            Preencha apenas se quiser alterar sua senha
                        </small>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Atualizando...' : 'Atualizar Perfil'}
                    </button>
                </form>

                {/* Seção de excluir candidatura */}
                <div className="delete-candidato-section">
                    <button 
                        type="button"
                        className="delete-candidato-btn"
                        onClick={handleDeleteCandidato}
                        disabled={loading}
                    >
                        🗑️ Excluir Candidatura
                    </button>
                    <p className="delete-candidato-warning">
                        Atenção: Esta ação excluirá permanentemente seu perfil de candidato, mas manterá sua conta de usuário.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
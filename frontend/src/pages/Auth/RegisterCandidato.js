import "./Auth.css";

// Components
import { Link } from "react-router-dom";
import Message from "../../components/Message";
import Select from "react-select"

// Hooks
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// Redux
import { registerUser, resetAuth } from "../../slices/AuthSlice";
import { getHabilidades, resetHabilidades } from "../../slices/HabilidadesSlice";

const RegisterUser = () => {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacao_senha, setConfirmacaoSenha] = useState("");
    const [cep, setCep] = useState("");
    const [endereco, setEndereco] = useState("");
    const [habilidades, setHabilidades] = useState([]);
    const [formacoes, setFormacoes] = useState([{
        curso: "",
        instituicao: "",
        conclusao: "",
        data_inicio: ""
    }]);
    const [telefone, setTelefone] = useState("");
    const [dnasc, setDnasc] = useState("");

    const dispatch = useDispatch();

    const { loading, error } = useSelector((state) => state.auth);
    const { habilidades: habilidadesList, loading: loadingHabilidades } = useSelector((state) => state.habilidades);

    // Converter habilidades do backend para formato do react-select
    const habilidadesOptions = Array.isArray(habilidadesList) 
        ? habilidadesList.map(habilidade => ({
            value: habilidade.id,
            label: habilidade.nome
        }))
        : [];

    // Debug: verificar se as habilidades estão sendo carregadas
    console.log('Debug habilidades:', {
        habilidadesList,
        habilidadesOptions,
        loadingHabilidades,
        isArray: Array.isArray(habilidadesList)
    });

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

    const addFormacao = () => {
        setFormacoes([...formacoes, {
            curso: "",
            instituicao: "",
            conclusao: "",
            data_inicio: ""
        }]);
    };

    const removeFormacao = (index) => {
        const newFormacoes = formacoes.filter((_, i) => i !== index);
        setFormacoes(newFormacoes);
    };

    const updateFormacao = (index, field, value) => {
        const newFormacoes = [...formacoes];
        newFormacoes[index][field] = value;
        setFormacoes(newFormacoes);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar se todos os campos obrigatórios estão preenchidos
        if (!nome || !email || !senha || !confirmacao_senha || !cep || !telefone || !dnasc) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Validar se as senhas coincidem
        if (senha !== confirmacao_senha) {
            alert('As senhas não coincidem');
            return;
        }

        // Validar se pelo menos uma habilidade foi selecionada
        if (!habilidades || habilidades.length === 0) {
            alert('Por favor, selecione pelo menos uma habilidade');
            return;
        }

        // Validar tamanho do endereço
        if (endereco && endereco.length > 70) {
            alert('O endereço deve ter no máximo 70 caracteres');
            return;
        }

        const habilidadesIds = habilidades.map((item) => item.value);

        // Formatar a data para o formato ISO
        const dataFormatada = dnasc ? new Date(dnasc).toISOString().split('T')[0] : null;

        const user = {
            nome,
            email,
            senha,
            senha_confirmation: confirmacao_senha, // Corrigido para alinhar com o backend
            cep: cep.replace(/\D/g, ""), // Remover caracteres não numéricos
            endereco,
            telefone: telefone.replace(/\D/g, ""), // Remover caracteres não numéricos
            dnasc: dataFormatada,
            habilidades: habilidadesIds,
            formacoes: formacoes.filter(f => f.curso && f.instituicao).map(f => ({
                ...f,
                conclusao: f.conclusao ? new Date(f.conclusao).toISOString().split('T')[0] : null,
                data_inicio: f.data_inicio ? new Date(f.data_inicio).toISOString().split('T')[0] : null
            })), // Formatar datas das formações também
            tipo_usuario: 'candidato'
        };

        console.log('Dados sendo enviados:', user);
        dispatch(registerUser(user));
    };

    // Limpa estado do auth ao montar
    useEffect(() => {
        dispatch(resetAuth());
        dispatch(resetHabilidades());
        // Buscar habilidades do backend
        dispatch(getHabilidades());
    }, [dispatch]);

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

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Registro Candidato</h2>
                <p className="auth-subtitle">Cadastre-se para ver as vagas e oportunidades.</p>
                
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

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefone">Telefone *</label>
                            <input
                                id="telefone"
                                type="tel"
                                placeholder="(11) 99999-9999"
                                onChange={(e) => setTelefone(e.target.value)}
                                value={telefone}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dnasc">Data de Nascimento *</label>
                            <input
                                id="dnasc"
                                type="date"
                                onChange={(e) => setDnasc(e.target.value)}
                                value={dnasc}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cep">CEP *</label>
                            <input
                                id="cep"
                                type="text"
                                placeholder="00000-000"
                                onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                                value={cep}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endereco">Endereço</label>
                            <input
                                id="endereco"
                                type="text"
                                placeholder="Digite seu endereço"
                                onChange={(e) => setEndereco(e.target.value)}
                                value={endereco}
                            />
                        </div>
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
                                value={habilidades}
                                onChange={setHabilidades}
                                placeholder="Selecione suas habilidades"
                                styles={customStyles}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label>Formações</label>
                        {formacoes.map((formacao, index) => (
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
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar Candidato'}
                    </button>
                </form>

                <div className="auth-links">
                    <p>
                        Já tem uma conta? <Link to="/login">Faça login</Link>
                    </p>
                    <p>
                        É um gestor? <Link to="/gestor/register">Cadastre-se aqui</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;

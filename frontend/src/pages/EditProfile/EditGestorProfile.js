import './EditProfile.css';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Profile, resetUser, updateGestor, deleteGestor } from '../../slices/UserSlice';
import { logout } from '../../slices/AuthSlice';
import { useNavigate } from 'react-router-dom';
import Message from '../../components/Message';

const EditGestorProfile = () => {
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { profile, message, error, loading } = useSelector((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(Profile());
    }, [dispatch]);

    useEffect(() => {
        if (profile && profile.user) {
            setNome(profile.user.nome || '');
            setEmail(profile.user.email || '');
            
            // Se for gestor, carregar dados do gestor
            if (profile.user.gestor) {
                setNomeEmpresa(profile.user.gestor.nome_empresa || '');
                setCnpj(profile.user.gestor.cnpj || '');
            }
        }
    }, [profile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { nome_empresa: nomeEmpresa, cnpj };
        if (password) payload.password = password;
        try {
            const result = await dispatch(updateGestor(payload)).unwrap();
            if (result) { }
            setTimeout(() => {
                dispatch(resetUser());
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar nome da empresa:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir sua conta de gestor? Esta ação é irreversível.')) {
            try {
                await dispatch(deleteGestor()).unwrap();
                await dispatch(logout());
                navigate('/login');
            } catch (error) {
                alert('Erro ao excluir gestor: ' + (error?.message || 'Erro desconhecido'));
            }
        }
    };

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
                <h2>Editar Perfil do Gestor</h2>
                <p className="auth-subtitle">Atualize o nome da sua empresa</p>
                {error && (
                    <div className="error-message">
                        {message || 'Erro ao atualizar nome da empresa'}
                    </div>
                )}
                {message && !error && (
                    <div className="success-message">
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            disabled
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
                            value={email}
                            disabled
                        />
                        <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                            O email não pode ser alterado
                        </small>
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
                    <div className="form-group">
                        <label htmlFor="nomeEmpresa">Nome da Empresa</label>
                        <input
                            id="nomeEmpresa"
                            type="text"
                            placeholder="Digite o nome da empresa"
                            value={nomeEmpresa}
                            onChange={(e) => setNomeEmpresa(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            id="cnpj"
                            type="text"
                            placeholder="Digite o CNPJ (apenas números)"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                            maxLength={14}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Atualizando...' : 'Atualizar Nome da Empresa'}
                    </button>
                    <button
                        className="auth-button delete-button"
                        onClick={handleDelete}
                        type="button"
                        disabled={loading}
                    >
                        Excluir Conta de Gestor
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditGestorProfile; 
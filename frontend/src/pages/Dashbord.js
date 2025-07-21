import './Dashboard.css'

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCandidatos } from "../slices/UserSlice";
import { createReuniao } from "../slices/UserSlice";
import React from "react";
import Message from "../components/Message";
import useRequireRole from '../hooks/useRequireRole';


const Dashboard = () => {
    useRequireRole();
    const dispatch = useDispatch();

    const { candidatos, loading, error, message } = useSelector((state) => state.user);
    const [notifyStatus, setNotifyStatus] = React.useState({});
    const [gestorId, setGestorId] = React.useState(null);


    React.useEffect(() => {
        dispatch(getCandidatos());
        // Buscar o id do gestor ao montar
        const token = localStorage.getItem("token");
        import("../services/UserService").then(({ default: userService }) => {
            userService.profile(null, token).then((profile) => {
                // O id do gestor pode estar em profile.user.gestor.id ou profile.user.id dependendo do backend
                let id = null;
                if (profile.user && profile.user.gestor && profile.user.gestor.id) {
                    id = profile.user.gestor.id;
                } else if (profile.user && profile.user.id) {
                    id = profile.user.id;
                }
                setGestorId(id);
            });
        });
    }, [dispatch]);


    const handleCreateReuniao = (candidato, candidatoId) => {
        if (!gestorId) {
            setNotifyStatus((prev) => ({ ...prev, [candidatoId]: { message: 'Gestor não identificado.', error: true } }));
            setTimeout(() => {
                setNotifyStatus((prev) => {
                    const newStatus = { ...prev };
                    delete newStatus[candidatoId];
                    return newStatus;
                });
            }, 3000);
            return;
        }
        const reuniaoData = {
            gestor_id: gestorId,
            candidato_id: candidatoId,
        };
        dispatch(createReuniao(reuniaoData))
            .then((action) => {
                if (action.type.endsWith('fulfilled')) {
                    setNotifyStatus((prev) => ({ ...prev, [candidatoId]: { message: action.payload?.message || 'Reunião marcada com sucesso!', error: false } }));
                } else {
                    setNotifyStatus((prev) => ({ ...prev, [candidatoId]: { message: action.error?.message || 'Erro ao marcar reunião.', error: true } }));
                }
                setTimeout(() => {
                    setNotifyStatus((prev) => {
                        const newStatus = { ...prev };
                        delete newStatus[candidatoId];
                        return newStatus;
                    });
                }, 3000);
            });
    };





    return (
        <div className="dashboard">
            <h2>Lista de Candidatos</h2>

            {loading && <p>Carregando candidatos...</p>}
            {error && (
                <div style={{
                    margin: '1rem 0',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    textAlign: 'center',
                    fontWeight: 600
                }}>
                    Erro ao carregar candidatos.
                </div>
            )}

            {!loading && candidatos?.candidatos && (
                <ul>
                    {candidatos.candidatos.map((candidato) => (
                        <li key={candidato.id}>
                            <div className='candidato-card'>
                            <strong>{candidato.user?.nome || '-'}</strong> - {candidato.user?.email || '-'}
                            <br />
                            Código: {candidato.id}
                            <br />
                            Habilidades: {candidato.habilidades && candidato.habilidades.length > 0 ? candidato.habilidades.join(', ') : '-'}
                            <br />
                            Formação: {candidato.formacoes && candidato.formacoes.length > 0 ? candidato.formacoes.map(f => f.curso).join(', ') : '-'}
                            <br />
                            Telefone: {candidato.telefone || '-'}
                            <br />
                            Endereço: {candidato.endereco || '-'} | CEP: {candidato.cep || '-'}
                            <hr />
                            <button className="btn" onClick={() => handleCreateReuniao(candidato, candidato.id)}>
                                Marcar reunião
                            </button>
                            </div>
                            {notifyStatus[candidato.id]?.message && (
                                <Message
                                    msg={notifyStatus[candidato.id].message}
                                    type={notifyStatus[candidato.id].error ? 'error' : 'success'}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dashboard;

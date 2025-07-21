import "./Search.css";

// hooks
import { useQuery } from "../../hooks/useQuery";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createReuniao } from "../../slices/UserSlice";
import React from "react";
import Message from "../../components/Message";
import useRequireRole from '../../hooks/useRequireRole';

// Redux
import { searchCandidatos } from "../../slices/UserSlice";

const SearchCandidatos = () => {
    useRequireRole();
    const query = useQuery();
    const search = query.get("q");

    const dispatch = useDispatch();

    const { candidatos, loading } = useSelector((state) => state.user);

    const [notifyStatus, setNotifyStatus] = React.useState({});
    const [gestorId, setGestorId] = React.useState(null);

    React.useEffect(() => {
        // Buscar o id do gestor ao montar
        const token = localStorage.getItem("token");
        import("../../services/UserService").then(({ default: userService }) => {
            userService.profile(null, token).then((profile) => {
                let id = null;
                if (profile.user && profile.user.gestor && profile.user.gestor.id) {
                    id = profile.user.gestor.id;
                } else if (profile.user && profile.user.id) {
                    id = profile.user.id;
                }
                setGestorId(id);
            });
        });
    }, []);

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


    useEffect(() => {
        if (search) {
            dispatch(searchCandidatos(search));
        }
    }, [dispatch, search]);

    return (
        <div className="search-candidatos">
            <h2>Buscando por: "{search}"</h2>
            {loading && <p>Carregando candidatos...</p>}

            {Array.isArray(candidatos?.candidatos) && candidatos.candidatos.length > 0 ? (
                candidatos.candidatos.map((candidato) => (
                    <div key={candidato.id} className="candidato-card">
                        <strong>{candidato.user?.nome || '-'}</strong> - {candidato.user?.email || '-' }
                        <br />
                        Habilidades: {candidato.habilidades && candidato.habilidades.length > 0 ? candidato.habilidades.join(', ') : '-'}
                        <br />
                        Formação: {candidato.formacoes && candidato.formacoes.length > 0 ? candidato.formacoes.map(f => f.curso).join(', ') : '-'}
                        <br/>
                        Telefone: {candidato.telefone || '-'}
                        <br/>
                        Endereço: {candidato.endereco || '-'} | CEP: {candidato.cep || '-'}
                        <br />
                        <button className="btn" onClick={() => handleCreateReuniao(candidato, candidato.id)}>
                            Marcar reunião
                        </button>
                        {notifyStatus[candidato.id]?.message && (
                            <Message
                                msg={notifyStatus[candidato.id].message}
                                type={notifyStatus[candidato.id].error ? 'error' : 'success'}
                            />
                        )}
                    </div>
                ))
            ) : (
                !loading && <p>Nenhum candidato encontrado...</p>
            )}

        </div>
    );
};

export default SearchCandidatos;

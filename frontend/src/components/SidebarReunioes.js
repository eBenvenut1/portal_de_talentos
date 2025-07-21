import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReunioes, getReunioesGestor, reagendarReuniao } from "../slices/UserSlice";
import "./SidebarReunioes.css";
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from "react-router-dom";

const SidebarReunioes = () => {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { reunioes, loading, error, profile } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Detectar tipo de usuário (Redux ou localStorage)
  let tipoUsuario = profile?.user?.role_atual;
  if (!tipoUsuario) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      tipoUsuario = user?.user?.role_atual || user?.role_atual;
    } catch {}
  }

  useEffect(() => {
    if (open) {
      if (tipoUsuario === "gestor") {
        dispatch(getReunioesGestor());
      } else {
        dispatch(getReunioes());
      }
    }
  }, [open, dispatch, tipoUsuario]);

  const handleReagendar = async (id) => {
    const novaData = window.prompt('Digite a nova data e hora (formato ISO: YYYY-MM-DDTHH:mm):');
    if (!novaData) return;
    try {
      await dispatch(reagendarReuniao({ id, novaData })).unwrap();
      alert('Reunião reagendada com sucesso!');
      // Atualiza lista
      if (tipoUsuario === "gestor") {
        dispatch(getReunioesGestor());
      } else {
        dispatch(getReunioes());
      }
    } catch (error) {
      alert('Erro ao reagendar: ' + (error?.message || 'Erro desconhecido'));
    }
  };

  if (!auth) return null;

  return (
    <>
      <button
        className="sidebar-reunioes-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar lista de reuniões" : "Abrir lista de reuniões"}
      >
        {open ? "←" : "📅 Reuniões"}
      </button>
      <div className={`sidebar-reunioes${open ? " open" : ""}`}>
        <h3>Minhas Reuniões</h3>
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: "red" }}>Erro ao buscar reuniões</p>}
        {!loading && reunioes.length === 0 && <p><br /> <br /> Nenhuma reunião encontrada.</p>}
        <ul>
          {reunioes.map((reuniao) => (
            <li key={reuniao.id} className="reuniao-item">
              <strong>{reuniao.data ? new Date(reuniao.data).toLocaleString() : "(sem data)"}</strong>
              <br />
              Gestor: {reuniao.gestor?.user?.nome || "-"}
              <br />
              Empresa: {reuniao.gestor?.nome_empresa || "-"}
              <br />
              Candidato: {reuniao.candidato?.user?.nome || "-"}
              <br />
              Status: <span style={{ color: reuniao.status === 'Pendente' ? 'orange' : reuniao.status === 'Concluido' ? 'green' : reuniao.status === 'Cancelado' ? 'red' : 'inherit' }}></span>{reuniao.status || "-"}
              <br />
              <button className="detalhes-btn" onClick={() => navigate(`/reunioes/${reuniao.id}`)}>
                Detalhes
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SidebarReunioes; 
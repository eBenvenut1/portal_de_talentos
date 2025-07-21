import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/UserService';
import './DetalhesReuniao.css';
import useRequireRole from '../hooks/useRequireRole';

const DetalhesReuniao = () => {
  useRequireRole();
  const { id } = useParams();
  const { auth } = useAuth();
  const [reuniao, setReuniao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profile = useSelector((state) => state.user.profile);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [showReagendar, setShowReagendar] = useState(false);
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [reagendando, setReagendando] = useState(false);
  const [msgReagendar, setMsgReagendar] = useState('');

  // Gera horários de 8:00 até 17:00 de 30 em 30 min
  const horarios = [];
  for (let h = 8; h <= 16; h++) {
    horarios.push(`${h.toString().padStart(2, '0')}:00`);
    horarios.push(`${h.toString().padStart(2, '0')}:30`);
  }
  horarios.push('17:00');

  let tipoUsuario = profile?.user?.role_atual;
  if (!tipoUsuario) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      tipoUsuario = user?.user?.role_atual || user?.role_atual;
    } catch {}
  }

  useEffect(() => {
    const fetchReuniao = async () => {
      setLoading(true);
      setError(null);
      try {
        // Busca reunião pelo id
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3333/api/reunioes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setReuniao(data.reuniao);
        } else {
          setError(data.message || 'Erro ao buscar reunião');
        }
      } catch (err) {
        setError('Erro ao buscar reunião');
      } finally {
        setLoading(false);
      }
    };
    fetchReuniao();
  }, [id]);

  const handleChangeStatus = async (novoStatus) => {
    setLoadingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3333/api/reunioes/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setReuniao((prev) => ({ ...prev, status: novoStatus }));
      } else {
        alert(data.message || 'Erro ao atualizar status');
      }
    } catch (err) {
      alert('Erro ao atualizar status');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleReagendar = async () => {
    setMsgReagendar('');
    if (!novaData || !novoHorario) {
      setMsgReagendar('Selecione data e horário.');
      return;
    }
    setReagendando(true);
    try {
      // Monta data/hora ISO
      const [ano, mes, dia] = novaData.split('-');
      const [hora, minuto] = novoHorario.split(':');
      const novaDataHora = new Date(ano, mes - 1, dia, hora, minuto);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3333/api/reunioes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: novaDataHora.toISOString() }),
      });
      const data = await res.json();
      if (res.ok) {
        setReuniao((prev) => ({ ...prev, data: novaDataHora.toISOString() }));
        setShowReagendar(false);
        setMsgReagendar('Reunião reagendada com sucesso!');
      } else {
        setMsgReagendar(data.message || 'Erro ao reagendar.');
      }
    } catch (err) {
      setMsgReagendar('Erro ao reagendar.');
    } finally {
      setReagendando(false);
    }
  };

  if (loading) return <p>Carregando detalhes da reunião...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!reuniao) return <p>Reunião não encontrada.</p>;

  return (
    
    <div className="detalhes-reuniao-container">
      {console.log("reuniao",reuniao)}
      <h2 className="detalhes-reuniao-title">Detalhes da Reunião</h2>
      <div className="detalhes-reuniao-info">
        {console.log(reuniao.data)}
        <p><span className="detalhes-label">Data:</span> {reuniao.data ? new Date(reuniao.data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '(sem data)'}</p>
        <p><span className="detalhes-label">Horário:</span> {reuniao.data ? new Date(reuniao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : '(sem horário)'}</p>
        <p><span className="detalhes-label">Status:</span> <span style={{ color: reuniao.status === 'Pendente' ? 'orange' : reuniao.status === 'Concluido' ? 'green' : reuniao.status === 'Cancelado' ? 'red' : 'inherit' }}>{reuniao.status || '-'}</span></p>
      </div>
      <div className="detalhes-reuniao-section">
        {tipoUsuario === 'gestor' ? (
          <>
            {console.log(reuniao.candidato)}
            <h3 className="detalhes-section-title">Informações do Candidato</h3>
            <p><span className="detalhes-label">Nome:</span> {reuniao.candidato?.user?.nome || '-'}</p>
            <p><span className="detalhes-label">Email:</span> {reuniao.candidato?.user?.email || '-'}</p>
            <p><span className="detalhes-label">Telefone:</span> {reuniao.candidato?.telefone || '-'}</p>
            {(tipoUsuario === 'gestor' && reuniao.status !== 'Cancelado' && reuniao.status !== 'Concluido') && (
              <div style={{ marginTop: '18px' }}>
                <button
                  className="detalhes-btn"
                  onClick={() => handleChangeStatus('Concluido')}
                  disabled={loadingStatus}
                >
                  Marcar como Concluída
                </button>
                <button
                  className="detalhes-btn"
                  style={{ background: '#d32f2f', marginLeft: '10px' }}
                  onClick={() => handleChangeStatus('Cancelado')}
                  disabled={loadingStatus}
                >
                  Cancelar Reunião
                </button>
                <button
                  className="detalhes-btn"
                  style={{ background: '#1976d2', marginLeft: '10px' }}
                  onClick={() => setShowReagendar(true)}
                  disabled={loadingStatus}
                >
                  Reagendar
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {console.log(reuniao.gestor)}
            <h3 className="detalhes-section-title">Informações do Gestor</h3>
            <p><span className="detalhes-label">Nome:</span> {reuniao.gestor?.user?.nome || '-'}</p>
            <p><span className="detalhes-label">Email:</span> {reuniao.gestor?.user?.email || '-'}</p>
            <p><span className="detalhes-label">Empresa:</span> {reuniao.gestor?.nome_empresa || '-'}</p>
            <p><span className="detalhes-label">CNPJ:</span> {reuniao.gestor?.cnpj || '-'}</p>
          </>
        )}
      </div>
      {/* Modal de reagendamento */}
      {showReagendar && (
        <div className="modal-reagendar-bg">
          <div className="modal-reagendar">
            <h3>Reagendar Reunião</h3>
            <label>Data:
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={novaData}
                onChange={e => setNovaData(e.target.value)}
              />
            </label>
            <label>Horário:
              <select value={novoHorario} onChange={e => setNovoHorario(e.target.value)}>
                <option value="">Selecione</option>
                {horarios.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
            <div style={{ marginTop: 12 }}>
              <button className="detalhes-btn" onClick={handleReagendar} disabled={reagendando}>
                Confirmar
              </button>
              <button className="detalhes-btn" style={{ marginLeft: 8 }} onClick={() => setShowReagendar(false)}>
                Cancelar
              </button>
            </div>
            {msgReagendar && <p style={{ color: msgReagendar.includes('sucesso') ? 'green' : 'red' }}>{msgReagendar}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesReuniao; 
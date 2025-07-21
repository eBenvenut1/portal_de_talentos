import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function useRequireRole() {
  const navigate = useNavigate();
  const roleAtual = useSelector((state) => state.user?.profile?.user?.role_atual);

  useEffect(() => {
    if (!roleAtual) {
      navigate('/selecionar-perfil', { replace: true });
    }
  }, [roleAtual, navigate]);
} 
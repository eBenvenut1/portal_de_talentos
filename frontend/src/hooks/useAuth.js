import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export const useAuth = () => {
    const { user } = useSelector((state) => state.auth);
    const { profile } = useSelector((state) => state.user);

    const [auth, setAuth] = useState(false)
    const [isGestor, setIsGestor] = useState(false)
    const [isCandidato, setIsCandidato] = useState(false)
    const [hasRole, setHasRole] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            setAuth(true)
            
            const roleAtual = profile.user?.role_atual;
            const hasGestorProfile = !!profile?.user?.gestor;
            const hasCandidatoProfile = !!profile?.user?.candidato;
            
            // Verificar se o role_atual é 'gestor' E se existe o perfil de gestor
            const isGestorUser = roleAtual === 'gestor' && hasGestorProfile;
            setIsGestor(isGestorUser);
            
            // Verificar se o role_atual é 'candidato' E se existe o perfil de candidato
            const isCandidatoUser = roleAtual === 'candidato' && hasCandidatoProfile;
            setIsCandidato(isCandidatoUser);
            
            // Verificar se tem algum role ativo
            setHasRole(!!roleAtual);
        } else {
            setAuth(false)
            setIsGestor(false)
            setIsCandidato(false)
            setHasRole(false)
        }

        setLoading(false)

    }, [user, profile])

    return { auth, isGestor, isCandidato, hasRole, loading }
}
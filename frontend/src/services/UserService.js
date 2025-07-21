import { api, requestConfig } from "../utils/config";

const profile = async (data, token) => {
  const config = requestConfig("GET", data, token); 

  console.log('Token sendo usado:', token);
  console.log('Config da requisição:', config);

  try {
    // Sempre buscar apenas o /me para ter formato consistente
    const userRes = await fetch(api + "/me", config)
      .then((res) => res.json())
      .catch((err) => err)

    console.log('User response:', userRes);

    if (userRes.message === 'Token inválido ou expirado') {
      throw new Error('Token inválido ou expirado');
    }

    // Retornar sempre o mesmo formato do /me
    return userRes;
  } catch (error) {
    console.log(error)
    throw error; 
  }
};

//Search Candidatos
const searchCandidatos = async(query, token) =>{
    const config = requestConfig("GET", null, token)

    try {
        const res = await fetch(api + "/user/search?q=" + query, config)
        .then((res) => res.json())
        .catch((err) => err)

        return res;
        
    } catch (error) {
        console.log(error)
    }
}



// Criar reunião
const createReuniao = async (reuniaoData, token) => {
    const config = requestConfig("POST", reuniaoData, token);
    try {
        const res = await fetch(api + "/reunioes", config);
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { error: "Response não é JSON válido", raw: responseText };
        }
        return data;
    } catch (error) {
        throw error;
    }
};


const updateCandidato = async (userData, token) => {
    // Converter os dados para o formato que o backend espera
    const payload = {
        nome: userData.fullName,
        email: userData.email,
        cep: userData.cep,
        endereco: userData.endereco,
        telefone: userData.telefone,
        // Converter string de habilidades para array de IDs
        habilidades: userData.habilidade ? 
            userData.habilidade.split(', ').map(h => parseInt(h)) : []
    };
    
    const config = requestConfig("POST", payload, token); 

    try {
        const res = await fetch(api + "/candidato/edit", config)
        .then((res) => res.json())
        .catch((err) => err)

        return res;
    } catch (error) {
        console.log(error)
        throw error; 
    }
}


//Get all candidatos
const getCandidatos = async (token) => {
    const config = requestConfig("GET", null, token);

    try {
        const res = await fetch(api + "/candidatos", config)
            .then((res) => res.json())
            .catch((err) => err);

        return res;
    } catch (error) {
        console.log(error);
    }
};

// Buscar reuniões do usuário logado
const getReunioes = async (token) => {
    const config = requestConfig("GET", null, token);
    try {
        const res = await fetch(api + "/reunioes", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
    }
};

// Buscar reuniões do gestor logado
const getReunioesGestor = async (token) => {
    const config = requestConfig("GET", null, token);
    try {
        const res = await fetch(api + "/reunioes/gestor", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
    }
};

// Atualizar nome da empresa e CNPJ do gestor
const updateGestor = async (gestorData, token) => {
    const payload = {
        nome_empresa: gestorData.nome_empresa,
        cnpj: gestorData.cnpj
    };
    const config = requestConfig("POST", payload, token);
    try {
        const res = await fetch(api + "/gestor/edit", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Deletar gestor
const deleteGestor = async (token) => {
    const config = requestConfig("DELETE", null, token);
    try {
        const res = await fetch(api + "/gestor/delete", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Reagendar reunião
const reagendarReuniao = async (id, novaData, token) => {
    const config = requestConfig("PUT", { data: novaData }, token);
    try {
        const res = await fetch(api + `/reunioes/${id}`, config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Criar perfil de gestor
const criarPerfilGestor = async (gestorData, token) => {
    const config = requestConfig("POST", gestorData, token);
    try {
        const res = await fetch(api + "/profile/gestor", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Criar perfil de candidato
const criarPerfilCandidato = async (candidatoData, token) => {
    const config = requestConfig("POST", candidatoData, token);
    try {
        const res = await fetch(api + "/profile/candidato", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Atualizar role do usuário
const updateRole = async (roleData, token) => {
    console.log('🔍 UserService.updateRole - token recebido:', token);
    console.log('🔍 UserService.updateRole - roleData:', roleData);
    
    // Fallback para token do localStorage se não fornecido
    const finalToken = token || localStorage.getItem('token');
    console.log('🔍 UserService.updateRole - finalToken:', finalToken);
    
    const config = requestConfig("PUT", roleData, finalToken);
    
    try {
        const res = await fetch(api + "/profile/role", config)
            .then((res) => {
                console.log('🔍 UserService.updateRole - response status:', res.status);
                return res.json();
            })
            .catch((err) => {
                console.log('🔍 UserService.updateRole - error:', err);
                return err;
            });
        console.log('🔍 UserService.updateRole - response:', res);
        return res;
    } catch (error) {
        console.log('🔍 UserService.updateRole - catch error:', error);
        throw error;
    }
}

// Excluir usuário
const deleteUser = async (token) => {
    const config = requestConfig("DELETE", null, token);
    try {
        const res = await fetch(api + "/user", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Excluir candidato
const deleteCandidato = async (token) => {
    const config = requestConfig("DELETE", null, token);
    try {
        const res = await fetch(api + "/candidato", config)
            .then((res) => res.json())
            .catch((err) => err);
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


const userService = {
  profile,
  getCandidatos,
  createReuniao,
  searchCandidatos,
  updateCandidato,
  updateGestor,
  getReunioes,
  getReunioesGestor,
  deleteGestor,
  reagendarReuniao,
  criarPerfilGestor,
  criarPerfilCandidato,
  updateRole,
  deleteUser,
  deleteCandidato,
};

export default userService;

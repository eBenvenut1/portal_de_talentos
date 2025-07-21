import { api, requestConfig } from "../utils/config";

const getHabilidades = async () => {
  const config = requestConfig("GET");
  
  const res = await fetch(api + "/habilidades", config);
  
  if (!res.ok) {
    const data = await res.json();
    console.error('Erro ao buscar habilidades:', data);
    throw new Error(data.message || "Erro ao buscar habilidades");
  }

  const data = await res.json();
  
  // O backend retorna { habilidades: [...] }, então extraímos o array
  const habilidades = data.habilidades || [];
  
  return habilidades;
};

const habilidadesService = {
  getHabilidades
};

export default habilidadesService; 
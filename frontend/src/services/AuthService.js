import { api, requestConfig } from "../utils/config";

// Trata resposta de erro genérica e de validação
const handleErrors = async (res) => {
  const data = await res.json();

  console.error('Erro na requisição:', {
    status: res.status,
    statusText: res.statusText,
    data: data
  });

  // Se for erro de validação, mostrar detalhes
  if (res.status === 422 && data.errors) {
    console.error('Erros de validação:');
    data.errors.forEach((error, index) => {
      console.error(`Erro ${index + 1}:`, error);
    });
    
    // Retornar a primeira mensagem de erro
    const firstError = data.errors[0];
    if (firstError && firstError.message) {
      throw new Error(firstError.message);
    }
  }

  // Mensagem padrão do backend
  throw new Error(data.message || "Erro inesperado");
};

const register = async (userData) => {
  const config = requestConfig("POST", userData);

  const res = await fetch(api + "/register", config);
  if (!res.ok) return handleErrors(res);

  const data = await res.json();
  return data;
};

const registerUser = async (userData) => {
  const config = requestConfig("POST", userData);

  const res = await fetch(api + "/register", config);
  if (!res.ok) return handleErrors(res);

  const data = await res.json();
  return data;
};

const login = async (userData) => {
  // Converter password para senha para alinhar com o backend
  const loginData = {
    email: userData.email,
    senha: userData.password
  };
  
  const config = requestConfig("POST", loginData);

  const res = await fetch(api + "/login", config);
  if (!res.ok) return handleErrors(res);

  const data = await res.json();
  return data;
};

const logout = async () => {
  localStorage.removeItem("user");
};

const authService = {
  login,
  logout,
  register,
  registerUser
};

export default authService;

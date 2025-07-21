export const api = "http://localhost:3333/api";

export const requestConfig = (method, data = null, token = null, multipart = false) => {
  let config = {
    method,
    headers: {},
  };

  // Autenticação - usar token do localStorage se não fornecido
  const authToken = token || localStorage.getItem("token");
  if (authToken) {
    config.headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (method === "DELETE" || data === null) {
    // nada além do método e headers
  } else {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(data);
  }

  return config;
};
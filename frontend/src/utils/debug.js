// Utilitário para debug de validação
export const logValidationError = (error) => {
  console.error('=== ERRO DE VALIDAÇÃO ===');
  console.error('Status:', error.status);
  console.error('Mensagem:', error.message);
  
  if (error.response) {
    console.error('Resposta do servidor:', error.response);
  }
  
  if (error.data) {
    console.error('Dados do erro:', error.data);
  }
};

export const logRequestData = (data) => {
  console.log('=== DADOS ENVIADOS ===');
  console.log(JSON.stringify(data, null, 2));
}; 
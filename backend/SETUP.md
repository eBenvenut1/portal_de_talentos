# Configuração do Backend

## 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do backend com o seguinte conteúdo:

```env
HOST=0.0.0.0
PORT=3333
APP_KEY=your-app-key-here
APP_NAME=Portal de Talentos
DRIVE_DISK=local
NODE_ENV=development
DB_CONNECTION=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_aqui
MYSQL_DB_NAME=portal_talentos
```

## 2. Gerar APP_KEY

Execute o comando para gerar uma APP_KEY:

```bash
node ace generate:key
```

Copie a chave gerada e substitua `your-app-key-here` no arquivo .env

## 3. Configurar Banco de Dados

1. Crie um banco MySQL chamado `portal_talentos`
2. Configure as credenciais no arquivo .env
3. Execute as migrations:

```bash
node ace migration:run
```

## 4. Popular Habilidades

Execute o seeder de habilidades:

```bash
node ace seed:habilidades
```

## 5. Iniciar o Servidor

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3333`

## 6. Testar a API

Você pode testar se a API está funcionando acessando:
- `http://localhost:3333/api/habilidades` - Lista de habilidades
- `http://localhost:3333/` - Hello World

## Problemas Comuns

### CORS Error
- O CORS já está habilitado no arquivo `config/cors.ts`
- Se ainda der erro, verifique se o backend está rodando na porta 3333

### Database Connection Error
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo .env
- Certifique-se de que o banco `portal_talentos` existe 
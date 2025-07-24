# Portal de Talentos

Portal de Talentos é uma plataforma para conectar candidatos talentosos com empresas inovadoras. O projeto é dividido em duas partes: **backend** (API em AdonisJS) e **frontend** (aplicação React).

---

##  Tecnologias

- **Backend:** [AdonisJS](https://adonisjs.com/) (Node.js)
- **Frontend:** [React](https://react.dev/)
- **Banco de Dados:** MySQL

---

##  Pré-requisitos

- [Node.js](https://nodejs.org/) (recomendado: 18+)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [MySQL](https://www.mysql.com/) (instalado e rodando)
- [Git](https://git-scm.com/)

---

##  Como clonar e rodar o projeto

```bash
git clone https://github.com/eBenvenut1/portal_de_talentos.git
cd SEU_REPOSITORIO
```

---

## 🖥 Backend (AdonisJS)

```bash
cd backend
npm install
```

1. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente, principalmente as de conexão com o MySQL:
   ```
   DB_CONNECTION=mysql
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=seu_usuario
   MYSQL_PASSWORD=sua_senha
   MYSQL_DB_NAME=nome_do_banco
   ```
2. Rode as migrations:
   ```bash
   node ace migration:run
   ```
3. (Opcional) Popule o banco com dados de exemplo:
   ```bash
   node ace db:seed
   ```
4. Inicie o servidor:
   ```bash
   node ace serve --watch
   ```
   O backend estará disponível em [http://localhost:3333](http://localhost:3333)

---

##  Frontend (React)

```bash
cd ../frontend
npm install
npm start
```
O frontend estará disponível em [http://localhost:3000](http://localhost:3000)

---

##  Comandos úteis

### Backend

- Rodar migrations: `node ace migration:run`
- Reverter migrations: `node ace migration:rollback`
- Rodar seeds: `node ace db:seed`
- Iniciar servidor: `node ace serve --watch`

### Frontend

- Iniciar em modo desenvolvimento: `npm start`
- Rodar testes: `npm test`
- Build de produção: `npm run build`

---

##  Observações

- Certifique-se de que o backend está rodando antes de acessar o frontend.
- Configure corretamente as variáveis de ambiente, principalmente as URLs de API e banco de dados.
- Para dúvidas ou problemas, abra uma issue neste repositório.

---

##  Licença

Este projeto está sob a licença MIT.

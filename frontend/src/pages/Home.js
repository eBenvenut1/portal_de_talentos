import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home minimal-home">
      {/* Header Simples */}
      <header className="minimal-header">
        <h1>Portal de Talentos</h1>
        <nav>
          <Link to="/users/register" className="btn btn-primary flat-btn">Candidato</Link>
          <Link to="/gestor/register" className="btn btn-secondary flat-btn">Gestor</Link>
          <Link to="/login" className="btn btn-outline flat-btn">Entrar</Link>
        </nav>
      </header>

      {/* Seção de Destaque */}
      <section className="minimal-hero">
        <h2>Conecte-se ao seu futuro</h2>
        <p className="minimal-desc">Encontre oportunidades ou talentos de forma simples, rápida e segura.</p>
      </section>

      {/* Grid de Benefícios */}
      <section className="minimal-benefits">
        <div className="benefit-card">
          <span className="benefit-icon">🎯</span>
          <h3>Match Inteligente</h3>
          <p>Conexão eficiente entre candidatos e empresas.</p>
        </div>
        <div className="benefit-card">
          <span className="benefit-icon">🔒</span>
          <h3>Segurança</h3>
          <p>Seus dados protegidos com tecnologia de ponta.</p>
        </div>
        <div className="benefit-card">
          <span className="benefit-icon">⚡</span>
          <h3>Agilidade</h3>
          <p>Processos rápidos e interface intuitiva.</p>
        </div>
        <div className="benefit-card">
          <span className="benefit-icon">📈</span>
          <h3>Resultados</h3>
          <p>Milhares de conexões bem-sucedidas.</p>
        </div>
      </section>

      {/* Passos Simples */}
      <section className="minimal-steps">
        <h2>Como funciona</h2>
        <ol>
          <li><strong>Cadastre-se</strong> como candidato ou gestor</li>
          <li><strong>Complete seu perfil</strong> com informações relevantes</li>
          <li><strong>Conecte-se</strong> com empresas ou talentos</li>
        </ol>
      </section>

      {/* Rodapé Minimalista */}
      <footer className="minimal-footer">
        <p>&copy; 2024 Portal de Talentos</p>
        <p className="footer-contact">contato@portaltalentos.com | +55 (11) 99999-9999</p>
      </footer>
    </div>
  );
};

export default Home;
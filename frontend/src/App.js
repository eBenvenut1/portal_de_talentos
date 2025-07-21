import './App.css';
//Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SidebarReunioes from "./components/SidebarReunioes";

//hooks
import { useAuth } from './hooks/useAuth'


//pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RegisterUser from './pages/Auth/RegisterCandidato';
import RegisterGestor from './pages/Auth/RegisterGestor';
import Dashboard from './pages/Dashbord';
import Search from './pages/Search/Search'
import EditProfile from './pages/EditProfile/EditProfile';
import EditGestorProfile from './pages/EditProfile/EditGestorProfile';
import DetalhesReuniao from './pages/DetalhesReuniao';
import SelecionarPerfil from './pages/SelecionarPerfil';


function App() {


  const { auth, loading, isGestor } = useAuth()
  if (loading) {
    return <p>Carregando...</p>
  }

  return (
    <div className="App">
      <BrowserRouter>
        <SidebarReunioes />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />}></Route>
            <Route path='/gestor/register' element={
              <div className="container">
                {!auth ? <RegisterGestor /> : <Navigate to="/dashboard" />}
              </div>
            }></Route>
            <Route path='/users/register' element={
              <div className="container">
                {!auth ? <RegisterUser /> : <Navigate to="/profile" />}
              </div>
            }></Route>
            <Route
              path='/login'
              element={
                <div className="container">
                  {!auth ? <Login /> :
                    !isGestor ? <Navigate to="/profile" /> :
                      <Navigate to="/dashboard" />
                  }
                </div>
              }
            />
            <Route path='/profile' element={
              <div className="container">
                {!auth ? <Navigate to="/login"/> : !isGestor ? <EditProfile/> : <Navigate to="/dashboard" /> }
              </div>
            }></Route>
            <Route path='/gestor/profile' element={
              <div className="container">
                {!auth ? <Navigate to="/login"/> : isGestor ? <EditGestorProfile/> : <Navigate to="/profile" /> }
              </div>
            }></Route>
            <Route path='/dashboard' element={
              <div className="container">
                {!isGestor ? <Navigate to="/profile" /> : <Dashboard />}
              </div>
            }></Route>
            <Route path='/search' element={
              <div className="container">
                {!auth ? <Navigate to="/login" /> : <Search />}
              </div>
            }></Route>
            <Route path='/reunioes/:id' element={
              <div className="container">
                {!auth ? <Navigate to="/login" /> : <DetalhesReuniao />}
              </div>
            }></Route>
            <Route path='/selecionar-perfil' element={
              <div className="container">
                {!auth ? <Navigate to="/login" /> : <SelecionarPerfil />}
              </div>
            }></Route>
          </Routes>

          {/* Footer não aparece na home pois ela tem seu próprio footer */}
          {window.location.pathname !== '/' && <Footer />}
        </BrowserRouter>
      </div>
  );
}

export default App;

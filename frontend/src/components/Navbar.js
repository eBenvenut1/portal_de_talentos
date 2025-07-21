import "./Navbar.css"

//components
import { NavLink, Link } from "react-router-dom"
import { BsSearch, BsHouseDoorFill, BsFillPersonFill, BsPersonBadge } from 'react-icons/bs'

//hooks

import { useAuth } from "../hooks/useAuth"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"


//Redux
import {logout, resetAuth} from '../slices/AuthSlice'
import { useState } from "react"



const Navbar = () => {

    const { auth, isGestor, isCandidato, hasRole } = useAuth()
    

    const [query, setQuery] = useState("")

    const navigate = useNavigate()

    const dispatch = useDispatch()

    const handleLogout = () => {
        dispatch(logout())
        dispatch(resetAuth())

        navigate("/login")
    }

    const handleSearch = (e) => {
        e.preventDefault()

        if(query){
            return navigate(`/search?q=${query}`)
        }
    }

    return (
        <nav id="nav">
            <Link to="/">Portal<span>Talentos</span></Link>
            {auth && hasRole && (
                <form id="search-form" onSubmit={handleSearch}>
                    <BsSearch />
                    <input type="text" placeholder="Pesquisar" onChange={(e) => setQuery(e.target.value)}/>
                </form>
            )}
            <ul id="nav-links">
                {auth ? (
                    <>
                        {/* Dashboard - apenas para gestores */}
                        {isGestor && (
                            <li>
                                <NavLink to="/dashboard">
                                    <BsHouseDoorFill />
                                    Dashboard
                                </NavLink>
                            </li>
                        )}

                        {/* Selecionar Perfil - sempre visível para usuários autenticados */}
                        <li>
                            <NavLink to="/selecionar-perfil">
                                <BsPersonBadge />
                                Selecionar Perfil
                            </NavLink>
                        </li>

                        {/* Perfil - apenas para candidatos */}
                        {isCandidato && (
                            <li>
                                <NavLink to="/profile">
                                    <BsFillPersonFill/>
                                    Perfil
                                </NavLink>
                            </li>
                        )}

                        {/* Editar Empresa - apenas para gestores */}
                        {isGestor && (
                            <li>
                                <NavLink to="/gestor/profile">
                                    Editar Empresa
                                </NavLink>
                            </li>
                        )}

                        <li>
                            <span onClick={handleLogout}>
                                Sair
                            </span>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink to="/login">
                                Entrar
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/users/register">
                                Sou Candidato
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/gestor/register">
                                Sou Gestor
                            </NavLink>
                        </li>
                    </>
                )}


            </ul>
        </nav>
    )
}

export default Navbar
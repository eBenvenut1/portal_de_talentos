import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/AuthSlice'
import userReducer from './slices/UserSlice'
import habilidadesReducer from './slices/HabilidadesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    habilidades: habilidadesReducer,
  },
}) 
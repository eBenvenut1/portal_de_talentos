import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/UserService";


// Adicionar no topo do arquivo:
const getTokenString = (state) => {
  const tokenObj = state.auth.user.token;
  return typeof tokenObj === 'object' && tokenObj.token ? tokenObj.token : tokenObj;
};

//get all candidatos
export const getCandidatos = createAsyncThunk("dashboard", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.getCandidatos(token)
  return data
})

//send a notify by email
export const handleNotify = createAsyncThunk("dashboard/notify", async ({ email }, thunkAPI) => {


  const token = getTokenString(thunkAPI.getState());


  return await userService.handleNotify(email, token);
});

//search candidatos
export const searchCandidatos = createAsyncThunk("users/search", async (query, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.searchCandidatos(query, token)

  return data
})

//update candidato - copiando estrutura do searchCandidatos
export const updateCandidato = createAsyncThunk("user/updateCandidato", async (userData, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());

  const data = await userService.updateCandidato(userData, token)

  return data;
})

//update gestor - atualizar nome da empresa
export const updateGestor = createAsyncThunk("user/updateGestor", async (gestorData, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.updateGestor(gestorData, token);
  return data;
})

// Criar reunião
export const createReuniao = createAsyncThunk("dashboard/createReuniao", async (reuniaoData, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  return await userService.createReuniao(reuniaoData, token);
});

// reagendar reunião
export const reagendarReuniao = createAsyncThunk("user/reagendarReuniao", async ({ id, novaData }, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.reagendarReuniao(id, novaData, token);
  return data;
});


// perfil
export const Profile = createAsyncThunk("users/profile", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  
  console.log('Token do state:', token);
  console.log('Auth state:', thunkAPI.getState().auth);

  const data = await userService.profile(null, token)

  return data;
});

export const getReunioes = createAsyncThunk("user/getReunioes", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  return await userService.getReunioes(token);
});

export const getReunioesGestor = createAsyncThunk("user/getReunioesGestor", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  return await userService.getReunioesGestor(token);
});

export const deleteGestor = createAsyncThunk("user/deleteGestor", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.deleteGestor(token);
  return data;
});

// Criar perfil de gestor
export const criarPerfilGestor = createAsyncThunk("user/criarPerfilGestor", async (gestorData, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.criarPerfilGestor(gestorData, token);
  return data;
});

// Criar perfil de candidato
export const criarPerfilCandidato = createAsyncThunk("user/criarPerfilCandidato", async (candidatoData, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.criarPerfilCandidato(candidatoData, token);
  return data;
});

// Atualizar role do usuário
export const updateRole = createAsyncThunk("user/updateRole", async (roleData, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  console.log('🔍 updateRole - Token obtido:', token);
  console.log('🔍 updateRole - roleData:', roleData);
  
  const data = await userService.updateRole(roleData, token);
  return data;
});

// Excluir usuário
export const deleteUser = createAsyncThunk("user/deleteUser", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.deleteUser(token);
  return data;
});

// Excluir candidato
export const deleteCandidato = createAsyncThunk("user/deleteCandidato", async (_, thunkAPI) => {
  const token = getTokenString(thunkAPI.getState());
  const data = await userService.deleteCandidato(token);
  return data;
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: {},
    loading: false,
    error: false,
    success: false,
    message: "",
    reunioes: [],
  },
  reducers: {
    resetUser: (state) => {
      state.profile = {};
      state.loading = false;
      state.success = false;
      state.error = false;
      state.message = "";
      state.reunioes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(Profile.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(Profile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        // Sempre usar o payload como vem do backend
        state.profile = action.payload || {};
      })
      .addCase(Profile.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.payload?.message || "Erro ao buscar perfil";
      })
      .addCase(getCandidatos.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.candidatos = action.payload;
      })
      .addCase(getCandidatos.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(searchCandidatos.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.candidatos = action.payload;
      })
      .addCase(searchCandidatos.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(updateCandidato.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCandidato.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(updateCandidato.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(handleNotify.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(handleNotify.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Reunião marcada com sucesso!';
      })
      .addCase(handleNotify.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao marcar reunião.';
      })
      .addCase(createReuniao.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(createReuniao.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Reunião marcada com sucesso!';
      })
      .addCase(createReuniao.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao marcar reunião.';
      })
      .addCase(updateGestor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGestor.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.error = null;
        state.message = action.payload.message || 'Nome da empresa atualizado com sucesso';
      })
      .addCase(updateGestor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getReunioes.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getReunioes.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.reunioes = action.payload.reunioes || [];
      })
      .addCase(getReunioes.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.reunioes = [];
      })
      .addCase(getReunioesGestor.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getReunioesGestor.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.reunioes = action.payload.reunioes || [];
      })
      .addCase(getReunioesGestor.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.reunioes = [];
      })
      .addCase(deleteGestor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGestor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Gestor excluído com sucesso';
      })
      .addCase(deleteGestor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(reagendarReuniao.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reagendarReuniao.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Reunião reagendada com sucesso';
      })
      .addCase(reagendarReuniao.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(criarPerfilGestor.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(criarPerfilGestor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Perfil de gestor criado com sucesso!';
        // Atualize o profile se necessário
      })
      .addCase(criarPerfilGestor.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao criar perfil de gestor.';
      })
      .addCase(criarPerfilCandidato.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(criarPerfilCandidato.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Perfil de candidato criado com sucesso!';
        // Atualize o profile se necessário
      })
      .addCase(criarPerfilCandidato.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao criar perfil de candidato.';
      })
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Role atualizado com sucesso!';
        
        // Atualizar o profile com o novo role e tipo_usuario
        if (state.profile?.user && action.payload?.user) {
          state.profile.user.role_atual = action.payload.user.role_atual;
          state.profile.user.tipo_usuario = action.payload.user.tipo_usuario;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao atualizar role.';
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Usuário excluído com sucesso';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao excluir usuário';
      })
      .addCase(deleteCandidato.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(deleteCandidato.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = action.payload?.message || 'Candidato excluído com sucesso';
        // Recarregar o perfil após excluir candidato
        state.profile = {};
      })
      .addCase(deleteCandidato.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.error?.message || 'Erro ao excluir candidato';
      });


  },
});

export const { resetUser } = userSlice.actions;
export default userSlice.reducer;

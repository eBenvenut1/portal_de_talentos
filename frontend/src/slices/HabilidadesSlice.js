import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import habilidadesService from "../services/HabilidadesService";

export const getHabilidades = createAsyncThunk(
  "habilidades/getAll",
  async (_, thunkAPI) => {
    try {
      return await habilidadesService.getHabilidades();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const habilidadesSlice = createSlice({
  name: "habilidades",
  initialState: {
    habilidades: [],
    loading: false,
    error: false,
    message: "",
  },
  reducers: {
    resetHabilidades: (state) => {
      state.loading = false;
      state.error = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHabilidades.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getHabilidades.fulfilled, (state, action) => {
        state.loading = false;
        state.habilidades = action.payload;
      })
      .addCase(getHabilidades.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.payload || "Erro ao buscar habilidades";
      });
  },
});

export const { resetHabilidades } = habilidadesSlice.actions;
export default habilidadesSlice.reducer; 
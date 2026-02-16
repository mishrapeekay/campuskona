import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { School, TenantConfig } from '@/types/models';

interface TenantState {
  selectedTenant: School | null;
  tenantConfig: TenantConfig | null;
  availableTenants: School[];
  isLoading: boolean;
  error: string | null;
  // Super Admin bypasses tenant selection entirely
  isSuperAdminMode: boolean;
}

const initialState: TenantState = {
  selectedTenant: null,
  tenantConfig: null,
  availableTenants: [],
  isLoading: false,
  error: null,
  isSuperAdminMode: false,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setSelectedTenant: (state, action: PayloadAction<School>) => {
      state.selectedTenant = action.payload;
      state.isSuperAdminMode = false;
    },
    setTenantConfig: (state, action: PayloadAction<TenantConfig>) => {
      state.tenantConfig = action.payload;
    },
    setAvailableTenants: (state, action: PayloadAction<School[]>) => {
      state.availableTenants = action.payload;
    },
    clearTenant: (state) => {
      state.selectedTenant = null;
      state.tenantConfig = null;
      state.isSuperAdminMode = false;
    },
    setSuperAdminMode: (state, action: PayloadAction<boolean>) => {
      state.isSuperAdminMode = action.payload;
      if (action.payload) {
        // Clear any previously selected tenant when entering super admin mode
        state.selectedTenant = null;
        state.tenantConfig = null;
      }
    },
  },
});

export const {
  setSelectedTenant,
  setTenantConfig,
  setAvailableTenants,
  clearTenant,
  setSuperAdminMode,
} = tenantSlice.actions;
export default tenantSlice.reducer;

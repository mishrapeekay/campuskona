import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { login, logout, clearError } from '@/store/slices/authSlice';
import { LoginRequest } from '@/types/api';

const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, isLoading, error, subscriptionTier, tenantFeatures } = useSelector(
        (state: RootState) => state.auth
    );

    const handleLogin = (credentials: LoginRequest) => {
        return dispatch(login(credentials));
    };

    const handleLogout = () => {
        return dispatch(logout());
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    return {
        isAuthenticated,
        user,
        isLoading,
        error,
        subscriptionTier,
        tenantFeatures,
        login: handleLogin,
        logout: handleLogout,
        clearError: handleClearError,
    };
};

export default useAuth;

import { createContext, useContext, ReactNode } from 'react';

// Simple mock AuthContext until actual implementation is present
interface AuthContextType {
    user: any | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: { id: 1, role: 'admin', name: 'Admin User' },
    isLoading: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthContext.Provider value={{
            user: { id: 1, role: 'admin', name: 'Admin User' },
            isLoading: false
        }}>
            {children}
        </AuthContext.Provider>
    );
};

import { useState, useEffect, createContext, useContext } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth token
        const token = localStorage.getItem("auth_token");
        if (token) {
            // Validate token and set user
            // This would typically make an API call to validate the token
            setUser({
                id: "1",
                name: "Demo User",
                email: "demo@example.com",
                role: "user"
            });
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            // This would typically make an API call to authenticate
            // For demo purposes, we'll simulate a successful login
            const mockUser: User = {
                id: "1",
                name: "Demo User",
                email,
                role: "user"
            };

            localStorage.setItem("auth_token", "mock_token");
            setUser(mockUser);
        } catch (error) {
            throw new Error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setUser(null);
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            // This would typically make an API call to register
            // For demo purposes, we'll simulate a successful registration
            const mockUser: User = {
                id: "1",
                name,
                email,
                role: "user"
            };

            localStorage.setItem("auth_token", "mock_token");
            setUser(mockUser);
        } catch (error) {
            throw new Error("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value= { value } >
        { children }
        </AuthContext.Provider>
    );
}; 
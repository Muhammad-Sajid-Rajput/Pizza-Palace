import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface Props {
    children: ReactNode;
}

interface DecodeInterface {
    role: 'admin' | 'user';
    exp?: number;
}

function getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function clearToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
}

export default function ProtectRouteLogin({ children }: Props) {
    const token = getToken();
    if (!token) return <>{children}</>;

    try {
        const decoded: DecodeInterface = jwtDecode(token);

        if (!decoded.exp) {
            console.warn('Token has no expiration claim');
            clearToken();
            return <>{children}</>;
        }

        if (decoded.exp * 1000 <= Date.now()) {
            console.log('Token expired, showing login page');
            clearToken();
            return <>{children}</>;
        }

        if (!decoded.role) {
            console.error('Token has no role claim');
            clearToken();
            return <>{children}</>;
        }

        // Redirect already logged in users to their dashboard
        if (decoded.role === 'admin') {
            console.log('Admin already logged in, redirecting to /admin');
            return <Navigate to="/admin" replace />;
        }
        console.log('User already logged in, redirecting to /');
        return <Navigate to="/" replace />;
    } catch (error) {
        console.error('Error decoding token in ProtectRouteLogin:', error);
        clearToken();
        return <>{children}</>;
    }
}

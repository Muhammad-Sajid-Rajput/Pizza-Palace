import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    allowedRoles?: ('user' | 'admin')[];
}

interface TokenPayload {
    role: 'user' | 'admin';
    exp?: number;
}

function getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function clearToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
}

export default function ProtectRoute({ children, allowedRoles = ['user', 'admin'] }: Props) {
    const token = getToken();
    if (!token) {
        console.log('ProtectRoute: No token found, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded: TokenPayload = jwtDecode(token);

        // Check token expiration
        if (!decoded.exp) {
            console.warn('Token has no expiration claim');
            clearToken();
            return <Navigate to="/login" replace />;
        }

        if (decoded.exp * 1000 <= Date.now()) {
            console.log('Token expired at', new Date(decoded.exp * 1000));
            clearToken();
            return <Navigate to="/login" replace />;
        }

        // Check role
        if (!decoded.role) {
            console.error('Token has no role claim');
            clearToken();
            return <Navigate to="/login" replace />;
        }

        if (!allowedRoles.includes(decoded.role)) {
            console.error(`User role '${decoded.role}' not in allowed roles:`, allowedRoles);
            return <Navigate to="/login" replace />;
        }

        return <>{children}</>;
    } catch (error) {
        console.error('Invalid token, clearing storage:', error);
        clearToken();
        return <Navigate to="/login" replace />;
    }
}

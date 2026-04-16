import jwt from "jsonwebtoken";

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('JWT_SECRET is missing or too weak');
    }

    return secret;
};

const issuer = process.env.JWT_ISSUER || 'pizza-palace-api';
const audience = process.env.JWT_AUDIENCE || 'pizza-palace-client';
const defaultExpiry = process.env.JWT_EXPIRES_IN || '1d';

export const sign = (payload, expires = defaultExpiry) =>
    jwt.sign(payload, getJwtSecret(), {
        expiresIn: expires,
        issuer,
        audience
    });

export const verify = (token) =>
    jwt.verify(token, getJwtSecret(), {
        issuer,
        audience
    });

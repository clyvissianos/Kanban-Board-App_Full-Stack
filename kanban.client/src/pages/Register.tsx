import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const nav = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(email, password, displayName);
        nav('/');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Register</button>
        </form>
    );
}

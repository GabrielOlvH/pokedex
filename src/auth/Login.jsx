import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './auth.css'
import {usePopups} from "../popups/PopupContext";
import usePopup from "../hooks/usePopup";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const triggerPopup = usePopup()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username.length === 0 || password.length === 0) {
            triggerPopup(<h2>Insert an username and password!</h2>, 2000);
            return;
        }
        await login(username, password);
    };

    return (
        <form className={"form"} onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;

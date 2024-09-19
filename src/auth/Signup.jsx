import React, {useEffect, useState} from 'react';
import { useAuth } from './AuthContext';

import './auth.css'
import usePopup from "../hooks/usePopup";

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isMismatch, setIsMismatch] = useState(false)
    const { signup } = useAuth();
    const triggerPopup = usePopup()

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username.length === 0 || password.length === 0) {
            triggerPopup(<h2>Insert an username and password!</h2>, 2000)
            return
        }

        if (isMismatch) {
            triggerPopup(<h2>Passwords don't match!</h2>, 2000)
            return;
        }

        await signup(username, password);
    };

    useEffect(() => {
        setIsMismatch(confirmPassword !== password)
    }, [password, confirmPassword])

    return (
        <form className={"form"} onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                className={isMismatch ? "error" : ""}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                className={isMismatch ? "error" : ""}
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit">Sign up</button>
        </form>
    );
};

export default Signup;

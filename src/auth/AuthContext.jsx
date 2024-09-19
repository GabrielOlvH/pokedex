import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import usePopup from "../hooks/usePopup";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const triggerPopup = usePopup()

    const checkLogin = () =>  {
        axios.get('http://localhost:4001/check-auth', { withCredentials: true })
            .then(response => {
                if (response.data.authenticated) {
                    setUser(response.data.user);
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            });
    }

    useEffect(checkLogin, []);

    const login = async (username, password) => {
        try {
            axios.post('http://localhost:4001/login', { username, password }, { withCredentials: true })
                .then(() => {
                    checkLogin()
                })
                .catch(() => triggerPopup(<h2>Incorrect username or password</h2>, 2000))
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const signup = async (username, password) => {
        try {
            axios.post('http://localhost:4001/signup', { username, password }, { withCredentials: true })
                .then(() => triggerPopup(<><h2>Account created!</h2><p>You can now log into your new account</p></>, 2000))
                .catch((r) => triggerPopup(<h2>{r.response.data.message}</h2>, 2000))
        } catch (error) {
            console.error('Signup.jsx failed', error);
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:4001/logout', {}, { withCredentials: true });
            setAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, authenticated, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

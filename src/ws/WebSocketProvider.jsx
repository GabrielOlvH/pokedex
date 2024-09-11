import React, { createContext, useEffect, useReducer } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

const socket = io('http://localhost:4000');

const initialState = {
    captureCheck: null,
    encounterMessage: null
};

function websocketReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_ENCOUNTER':
            return { ...state, encounterMessage: action.payload };
        case 'CAPTURE_CHECK':
            return { ...state, captureCheck: action.payload };
        default:
            return state;
    }
}

export const WebSocketProvider = ({ children }) => {
    const [state, dispatch] = useReducer(websocketReducer, initialState);

    useEffect(() => {
        socket.on('UPDATE_ENCOUNTER', (data) => {
            console.log(`Received UPDATE_ENCOUNTER: ${data}`)
            dispatch({ type: 'UPDATE_ENCOUNTER', payload: data });
        });

        socket.on('CAPTURE_CHECK', (data) => {
            console.log(`Received CAPTURE_CHECK: ${data}`)
            dispatch({ type: 'CAPTURE_CHECK', payload: data });
        });

        return () => {
            socket.off('UPDATE_ENCOUNTER');
            socket.off('CAPTURE_CHECK');
        };
    }, []);

    const sendMessage = (event, data) => {
        if (socket) {
            socket.emit(event, data);
        } else {
            console.error('Socket is not connected');
        }
    };

    return (
        <WebSocketContext.Provider value={{...state, sendMessage}}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => React.useContext(WebSocketContext);

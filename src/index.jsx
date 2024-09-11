import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {QueryClient, QueryClientProvider} from "react-query";
import {WebSocketProvider} from "./ws/WebSocketProvider";
import {PopupProvider} from "./popups/PopupContext";
import Popup from "./popups/Popup";
import {AuthProvider} from "./auth/AuthContext";

const root = ReactDOM.createRoot(document.getElementById('root'));

const queryClient = new QueryClient();
root.render(
  <React.StrictMode>
      <PopupProvider>
          <AuthProvider>
              <QueryClientProvider client={queryClient}>
                  <WebSocketProvider>
                    <App />
                  </WebSocketProvider>
                </QueryClientProvider>
              </AuthProvider>
          <Popup/>
      </PopupProvider>
  </React.StrictMode>
);

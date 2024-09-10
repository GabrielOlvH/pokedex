import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {QueryClient, QueryClientProvider} from "react-query";
import {WebSocketProvider} from "./ws/WebSocketProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));

const queryClient = new QueryClient();
root.render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
              <App />
          </WebSocketProvider>
      </QueryClientProvider>
  </React.StrictMode>
);

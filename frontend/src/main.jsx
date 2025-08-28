import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import './index.css'
import io from 'socket.io-client'; // Import socket.io-client

// Initialize socket.io globally
const socket = io('http://localhost:5000'); // Connect to your backend socket.io server
window.socket = socket; // Make socket globally accessible

socket.on('connect', () => {
  console.log('Global Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Global Socket disconnected');
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  </React.StrictMode>,
)
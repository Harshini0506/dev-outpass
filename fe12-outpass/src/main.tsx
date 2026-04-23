// frontend/src/main.tsx
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/mobile-enhancements.css';
import './styles/mobile-utilities.css';
import './styles/dashboard-mobile.css';
import './styles/mobile-fixes.css';
import './styles/mobile-text-controls.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
  <App />
</GoogleOAuthProvider>

);

import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// 2. Find your root DOM node:
const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in index.html');

// 3. Create the React root:
const root = createRoot(container);

// 4. Render your app via the root:
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
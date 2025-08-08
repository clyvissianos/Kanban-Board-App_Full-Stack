// src/main.tsx
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import axios from './api/axios';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

function Bootstrap() {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        // If your axios has baseURL '/api', use 'health' (no leading slash),
        // otherwise use '/api/health' or proxy '/health' in vite.config.ts.
        axios.get('/health')
            .then(() => setReady(true))
            .catch(err => {
                console.error('Health check failed, retrying in 2s…', err);
                const id = setTimeout(() => location.reload(), 2000);
                return () => clearTimeout(id);
            });
    }, []);

    if (!ready) {
        return <div style={{ padding: 20, fontSize: 18 }}>Loading application…</div>;
    }

    console.log('Health check successful, application is ready.');
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

const rootEl = document.getElementById('root')!;
const w = window as any;

// Reuse existing root if HMR re-imports this module
const root: Root = w.__appRoot ?? createRoot(rootEl);
w.__appRoot = root;

root.render(<Bootstrap />);

// On HMR dispose, unmount and clear the stored root
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        root.unmount();
        w.__appRoot = undefined;
    });
}














//import { createRoot } from 'react-dom/client';
//import App from './App';
//import { AuthProvider } from './contexts/AuthContext';

//// 2. Find your root DOM node:
//const container = document.getElementById('root');
//if (!container) throw new Error('Root container missing in index.html');

//// 3. Create the React root:
//const root = createRoot(container);

//// 4. Render your app via the root:
//root.render(
//    <AuthProvider>
//        <App />
//    </AuthProvider>
//);
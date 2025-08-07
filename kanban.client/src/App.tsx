import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardDetail from './pages/BoardDetail';

function App() {
    const { token } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* always accessible */}
                <Route path="/login"    element={<Login />}  />
                <Route path="/register" element={<Register />}/>

                {/* everything else requires a token */}
                <Route
                  path="/"
                  element={ token ? <Dashboard /> : <Navigate to="/login" replace /> }
                />
                <Route
                  path="/boards/:id"
                  element={ token ? <BoardDetail /> : <Navigate to="/login" replace /> }
                />

                {/* catch-all: redirect anything else to /login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
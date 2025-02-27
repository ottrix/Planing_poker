import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import App from './App';

const RedirectToMain = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (roomId) {
            localStorage.setItem("joinRoomId", roomId);
            navigate("/", { replace: true });
        }
    }, [roomId, navigate]);

    return null; 
};

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/room/:roomId" element={<RedirectToMain />} />
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </Router>
    );
}

export default AppRouter;

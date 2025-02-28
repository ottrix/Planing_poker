import React, { useEffect } from 'react';

const App: React.FC = () => {
    // ... existing code ...

    useEffect(() => {
        // Dodaj lub usuń klasę night-mode z elementu body
        if (isNightMode) {
            document.body.classList.add('night-mode');
        } else {
            document.body.classList.remove('night-mode');
        }
    }, [isNightMode]);

    return (
        <div className={`container text-center mt-5 ${isNightMode ? 'night-mode' : ''}`}>
            {/* ... reszta kodu ... */}
        </div>
    );
};

export default App;
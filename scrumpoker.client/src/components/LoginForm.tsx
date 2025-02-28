import React from 'react';

interface LoginFormProps {
    username: string;
    setUsername: (username: string) => void;
    handleUsernameSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ username, setUsername, handleUsernameSubmit }) => {
    return (
        <div>
            <input
                type="text"
                placeholder="Your name to display"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control mb-2 your-name"
            />
            <button onClick={handleUsernameSubmit} className="btn btn-success mb-2">Submit Name</button>
        </div>
    );
};

export default LoginForm;

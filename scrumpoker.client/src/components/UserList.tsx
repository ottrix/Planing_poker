import React from 'react';

interface UserListProps {
    users: { userId: string, userName: string }[];
    roomName: string;
    selectedPoints: { [key: string]: string };
    revealedPoints: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, roomName, selectedPoints, revealedPoints }) => {
    return (
        <div className="user-list-container">
            <h2>Participants {roomName}: </h2>
            <ul className="user-list">
                {users.map((user) => (
                    <li key={user.userId}>
                        {user.userName}
                        {selectedPoints[user.userId] && (
                            <span style={{ color: revealedPoints ? 'green' : 'blue', fontWeight: 'bold' }}>
                                {revealedPoints ? ` ${selectedPoints[user.userId]}` : ' ?'}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
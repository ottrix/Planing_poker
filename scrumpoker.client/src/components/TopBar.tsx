import React, { useState } from 'react';

interface TopBarProps {
    isNightMode: boolean;
    roomId: string;
    onChangeRoom: (newRoomId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ isNightMode, roomId, onChangeRoom }) => {
    const [newRoomId, setNewRoomId] = useState<string>('');

    const handleCopyLink = () => {
        const roomLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(roomLink).then(() => {
            alert('Room link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy room link: ', err);
        });
    };

    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(roomId).then(() => {
            alert('Room ID copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy room ID: ', err);
        });
    };

    const handleChangeRoom = () => {
        if (newRoomId.trim()) {
            onChangeRoom(newRoomId.trim());
        }
    };

    return (
        <div className={`topbar ${isNightMode ? 'night-mode' : 'day-mode'}`}>
            <button onClick={handleCopyLink} className="btn btn-primary">Copy Room Link</button>
            <button onClick={handleCopyRoomId} className="btn btn-copy-room-id">Copy Room ID</button>
            <div className="change-room-container">
                <input
                    type="text"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    placeholder="Enter Room ID"
                    className="form-control"
                />
                <button onClick={handleChangeRoom} className="btn btn-secondary">Change Room</button>
            </div>
        </div>
    );
};

export default TopBar;

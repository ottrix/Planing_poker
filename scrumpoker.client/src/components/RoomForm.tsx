import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CardSetSelector from './CardSetSelector';

interface RoomFormProps {
    isInTheRoom: boolean;
    roomName: string;
    setRoomName: (roomName: string) => void;
    handleCreateRoom: (roomName: string, selectedCardSetId: string) => void;
    roomId: string;
    setRoomId: (roomId: string) => void;
    handleJoinRoom: () => void;
    allowQuestPointManagement: boolean;
    handleToggleQuestPointManagement: () => void;
    isPermamentRoomId: boolean;
    togglePermamentRoomId: () => void;
}

const RoomForm: React.FC<RoomFormProps> = ({
    isInTheRoom,
    roomName,
    setRoomName,
    handleCreateRoom,
    roomId,
    setRoomId,
    handleJoinRoom,
    allowQuestPointManagement,
    handleToggleQuestPointManagement,
    isPermamentRoomId,
    togglePermamentRoomId
}) => {
    const [selectedCardSetId, setSelectedCardSetId] = useState('default');
    const cardSets = [
        { id: 'default', name: '1, 2, 3, 4, 5,..., 15', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'] },
        { id: 'fibonacci', name: 'Fibonacci', values: ['1', '2', '3', '5', '8', '13', '21', '34', '55'] },
        { id: 'tshirt', name: 'T-Shirt Sizes', values: ['XS', 'S', 'M', 'L', 'XL'] }
    ];

    return (
        <div>
            {!isInTheRoom && (
                <div className="create-room-section">
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                            <div style={{ flex: '1', marginRight: '10px' }}>
                                <label htmlFor="roomName" className="form-label" style={{ textAlign: 'left', display: 'block', fontWeight: 'bold' }}>Set name of new room:</label>
                                <input
                                    id="roomName"
                                    type="text"
                                    placeholder="Room name"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className="form-control"
                                    style={{ height: '38px' }}
                                />
                            </div>
                            <div style={{ flex: '1' }}>
                                <CardSetSelector
                                    cardSets={cardSets}
                                    selectedCardSetId={selectedCardSetId}
                                    onSelectCardSet={setSelectedCardSetId}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center mb-2" style={{ marginTop: '-5px' }}>
                        <button onClick={() => handleCreateRoom(roomName, selectedCardSetId)} className="btn btn-primary me-2">Create Room</button>
                        <div className="form-check form-switch me-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="questPointManagementSwitch"
                                checked={allowQuestPointManagement}
                                onChange={handleToggleQuestPointManagement}
                            />
                            <label className="form-check-label" htmlFor="questPointManagementSwitch">
                                {allowQuestPointManagement ? "Guest Point Management: Enabled" : "Guest Point Management: Disabled"}
                            </label>
                        </div>
                    </div>
                </div>
            )}
            <div className="join-room-section mb-2">
                <label htmlFor="roomId" className="form-label" style={{ textAlign: 'left', display: 'block', fontWeight: 'bold' }}>Join existing Room:</label>
                <input
                    id="roomId"
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="form-control mb-2"
                />
                <button onClick={handleJoinRoom} className="btn btn-secondary" style={{ display: 'block' }}>Join Room</button>
            </div>
        </div>
    );
};

export default RoomForm;

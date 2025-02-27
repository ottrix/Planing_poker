import React, { useState, useEffect } from 'react';
import useSignalR from '../hooks/useSignalR';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/index.css';
import LoginForm from './LoginForm';
import RoomForm from './RoomForm';
import UserList from './UserList';
import StoryPoints from './StoryPoints';
import TopBar from './TopBar';

function App() {
    const [roomName, setRoomName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');
    const [joinRoomId, setJoinId] = useState<string>('');
    const [isRoomOwner, setIsRoomOwner] = useState<boolean>(false);
    const [isInTheRoom, setIsInTheRoom] = useState<boolean>(false);
    const [isUsernameSubmitted, setIsUsernameSubmitted] = useState<boolean>(false);
    const [isNightMode, setIsNightMode] = useState<boolean>(false);
    const [selectedCardSet, setSelectedCardSet] = useState<{ id: string, name: string, values: string[] }>({ id: 'default', name: 'Default', values: ['1', '2', '3', '5', '8', '13', '21', '☕'] });
    const { connection, users, selectedPoints, revealedPoints, averagePoints, setUsers, setSelectedPoints, setRevealedPoints, setAveragePoints, setRoomId: setSignalRRoomId, setShowQuestPointManagement, showQuestPointManagement, canVote, setCanVote } = useSignalR();

    let userId: string | null;

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
            setIsUsernameSubmitted(true);
        }

        const savedRoomId = localStorage.getItem('roomId');
        if (savedRoomId) {
            setRoomId(savedRoomId);
        }

        const savedRoomName = localStorage.getItem('roomName');
        if (savedRoomName) {
            setRoomName(savedRoomName);
        }

        const savedNightMode = localStorage.getItem('isNightMode');
        if (savedNightMode) {
            setIsNightMode(savedNightMode === 'true');
        }

        const joinIdFromStorage = localStorage.getItem("joinRoomId");
        if (joinIdFromStorage && savedUsername) {
            handleJoinRoom(savedUsername, joinIdFromStorage);
            localStorage.removeItem("joinRoomId");
        }

        const urlParams = new URLSearchParams(window.location.search);
        const roomIdFromUrl = urlParams.get('roomId');
        if (roomIdFromUrl) {
            localStorage.setItem('joinRoomId', roomIdFromUrl);
            setJoinId(roomIdFromUrl);
        }
    }, []);

    useEffect(() => {
        if (isNightMode) {
            document.documentElement.classList.add('night-mode');
            document.documentElement.classList.remove('day-mode');
        } else {
            document.documentElement.classList.add('day-mode');
            document.documentElement.classList.remove('night-mode');
        }
        localStorage.setItem('isNightMode', isNightMode.toString());
    }, [isNightMode]);

    useEffect(() => {
        if (connection) {
            console.log('Setting up connection event listeners');
            connection.on("SetRoomInfo", (roomInfo: { isQuestPointsManegment: boolean; roomName: string; selectedCardSetId: string }) => {
                console.log('Received SetRoomInfo:', roomInfo);
                setShowQuestPointManagement(roomInfo.isQuestPointsManegment);
                setRoomName(roomInfo.roomName);
                
                const cardSets = [
                    { id: 'default', name: 'Default', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '☕'] },
                    { id: 'fibonacci', name: 'Fibonacci', values: ['1', '2', '3', '5', '8', '13', '21', '34', '55', '☕'] },
                    { id: 'tshirt', name: 'T-Shirt Sizes', values: ['XS', 'S', 'M', 'L', 'XL', '☕'] }
                ];
                const selectedSet = cardSets.find(set => set.id === roomInfo.selectedCardSetId) || cardSets[0];
                setSelectedCardSet(selectedSet);
            });

            connection.on("EnableGuestPointManagement", () => {
                setShowQuestPointManagement(true);
            });

            connection.on("UpdateUserList", (updatedUsers: any[]) => {
                setUsers(updatedUsers);
            });

            connection.on("Error", (message: string) => {
                alert(message);
            });
        }

        return () => {
            if (connection) {
                console.log('Cleaning up connection event listeners');
                connection.off("SetRoomInfo");
                connection.off("EnableGuestPointManagement");
                connection.off("UpdateUserList");
                connection.off("Error");
            }
        };
    }, [connection]);

    const handleUsernameSubmit = async () => {
        if (connection) {
            try {
                userId = localStorage.getItem('userId');
                if (!userId) {
                    userId = await connection.invoke("GenerateUserId");
                    if (userId)
                        localStorage.setItem('userId', userId);
                }
                await connection.invoke("SetName", userId, username);
                localStorage.setItem('username', username);
                setIsUsernameSubmitted(true);
                if (joinRoomId) {
                    handleJoinRoom(username, joinRoomId);
                }
            } catch (error) {
                console.error('Error setting username:', error);
            }
        }
    };

    const handleCreateRoom = async (roomName: string, selectedCardSetId: string) => {
        if (connection) {
            try {
                userId = localStorage.getItem('userId');
                if (!userId) {
                    userId = await connection.invoke("GenerateUserId");
                    if (userId)
                        localStorage.setItem('userId', userId);
                }
                await connection.invoke("SetName", userId, username);
                let roomGuid = localStorage.getItem('roomId') || ''; 
                if (!roomGuid) {
                    const roomInfo = await connection.invoke("CreateRoom", userId, roomName, selectedCardSetId, showQuestPointManagement, roomGuid);
                    roomGuid = roomInfo.roomId;
                    localStorage.setItem('roomId', roomGuid);
                }
                localStorage.setItem('roomName', roomName); 

                setRoomId(roomGuid);
                setSignalRRoomId(roomGuid);
                setIsRoomOwner(true);
                setIsInTheRoom(true);
                setShowQuestPointManagement(false); 

                // Join the room after creating it
                await connection.invoke("JoinRoom", roomGuid, username, userId);
            } catch (error) {
                console.error('Error creating room:', error);
            }
        }
    };

    const handleJoinRoom = async (username: string, roomGuid: string) => {
        if (connection) {
            try {
                const userId = localStorage.getItem('userId');
                await connection.invoke("JoinRoom", roomGuid, username, userId);
                setRoomId(roomGuid);
                setSignalRRoomId(roomGuid);
                setIsInTheRoom(true);

                const savedRoomName = localStorage.getItem('roomName');
                if (savedRoomName) {
                    setRoomName(savedRoomName);
                }
            } catch (error) {
                console.error('Error joining room:', error);
                alert('Error joining room: ' + error);
            }
        }
    };

    const handleSelectStoryPoints = async (storyPoints: string) => {
        if (connection && canVote) {
            try {
                userId = localStorage.getItem('userId');
                if (userId) {
                    await connection.invoke("SelectStoryPoints", roomId, userId, storyPoints);
                    setSelectedPoints(prev => ({ ...prev, [userId as string]: storyPoints }));
                } else {
                    console.error('User ID is null');
                }
            } catch (error) {
                console.error('Error selecting story points:', error);
            }
        }
    };

    const handleRevealPoints = async () => {
        if (connection) {
            try {
                await connection.invoke("RevealPoints");
                setCanVote(false); 
            } catch (error) {
                console.error('Error revealing points:', error);
            }
        }
    };

    const handleResetPoints = async () => {
        if (connection) {
            try {
                await connection.invoke("ResetVoting");
                setCanVote(true); 
            } catch (error) {
                console.error('Error resetting points:', error);
            }
        }
    };

    const handleToggleQuestPointManagement = () => {
        setShowQuestPointManagement(prev => !prev);
    };

    const toggleNightMode = () => {
        setIsNightMode(prev => !prev);
    };

    const handleChangeRoom = async (newRoomId: string) => {
        if (connection) {
            try {
                const userId = localStorage.getItem('userId');
                if (userId) {
                    await connection.invoke("LeaveRoom", roomId, userId);
                    await connection.invoke("JoinRoom", newRoomId, username, userId);
                    setRoomId(newRoomId);
                    setSignalRRoomId(newRoomId); 
                    setIsInTheRoom(true);

                    const savedRoomName = localStorage.getItem('roomName');
                    if (savedRoomName) {
                        setRoomName(savedRoomName);
                    }
                } else {
                    console.error('User ID is null');
                }
            } catch (error) {
                console.error('Error changing room:', error);
            }
        }
    };

    return (
        <div className="container text-center mt-5">
            {isInTheRoom && <TopBar isNightMode={isNightMode} roomId={roomId} onChangeRoom={handleChangeRoom} />}
            <div className="top-right-corner">
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="nightModeSwitch"
                        checked={isNightMode}
                        onChange={toggleNightMode} />
                    <label className="form-check-label" htmlFor="nightModeSwitch">
                        {isNightMode ? 'Night Mode' : 'Day Mode'}
                    </label>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                <img src={`/logo${isNightMode ? 'Black' : 'White'}.png`} id="logo" alt="Logo" />
            </div>
            {!isInTheRoom && (
                <>
                    <h1 className="mb-4">Welcome to Poker Planning!</h1>
                </>
            )}

            {!isUsernameSubmitted && (
                <LoginForm
                    username={username}
                    setUsername={setUsername}
                    handleUsernameSubmit={handleUsernameSubmit} />
            )}

            {isUsernameSubmitted && !isInTheRoom && (
                <RoomForm
                    isInTheRoom={isInTheRoom}
                    roomName={roomName}
                    setRoomName={setRoomName}
                    handleCreateRoom={handleCreateRoom}
                    roomId={joinRoomId} 
                    setRoomId={setJoinId} 
                    handleJoinRoom={() => handleJoinRoom(username, joinRoomId)}
                    allowQuestPointManagement={showQuestPointManagement}
                    handleToggleQuestPointManagement={handleToggleQuestPointManagement}
                    isPermamentRoomId={false}
                    togglePermamentRoomId={() => { }}
                />
            )}

            {!isInTheRoom && (
                <div className="scrollable-text mt-4">
                    <p className="entryDiscription">
                        This is a simple and clean solution designed to make your planning sessions more efficient and fun. With an intuitive interface, it’s easy to use for teams of all sizes. Whether you're estimating tasks or discussing priorities, Poker Planning helps you stay organized and aligned. Choose your preferred card set or create a custom deck, and start planning smarter today!
                    </p>
                </div>
            )}

            {isInTheRoom && (isRoomOwner || showQuestPointManagement) && (
                <div className="button-container">
                    <button onClick={handleRevealPoints} className="btn btn-warning mb-2">Reveal Points</button>
                    <button onClick={handleResetPoints} className="btn btn-danger mb-2">Reset Points</button>
                </div>
            )}

            {users.length > 0 && (
                <UserList users={users} roomName={roomName} selectedPoints={selectedPoints} revealedPoints={revealedPoints} />
            )}

            {isUsernameSubmitted && isInTheRoom && (
                <StoryPoints
                    storyPoints={selectedCardSet.values}
                    selectedPoints={selectedPoints}
                    username={username}
                    handleSelectStoryPoints={handleSelectStoryPoints}
                    canVote={canVote} 
                />
            )}

            {revealedPoints && averagePoints !== null && averagePoints !== 0 && (
                <div>
                    <h2>Average Points: <span style={{ fontWeight: 'bold' }}>{averagePoints}</span></h2>
                </div>
            )}
        </div>
    );
}

export default App;

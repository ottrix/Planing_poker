import { useState, useEffect, useRef } from 'react';
import { createSignalRConnection } from '../services/signalRService';

interface SignalRContextType {
    connection: any;
    users: { userId: string, userName: string }[];
    selectedPoints: { [key: string]: string };
    revealedPoints: boolean;
    averagePoints: number | null;
    showQuestPointManagement: boolean;
    canVote: boolean;
    setUsers: React.Dispatch<React.SetStateAction<{ userId: string, userName: string }[]>>;
    setSelectedPoints: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
    setRevealedPoints: React.Dispatch<React.SetStateAction<boolean>>;
    setAveragePoints: React.Dispatch<React.SetStateAction<number | null>>;
    setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
    setShowQuestPointManagement: React.Dispatch<React.SetStateAction<boolean>>;
    setCanVote: React.Dispatch<React.SetStateAction<boolean>>;
}

const SIGNALR_URL = "https://plan-poker.com/planningHub";

const useSignalR = (initialRoomId: string | null = null): SignalRContextType => {
    const [users, setUsers] = useState<{ userId: string, userName: string }[]>([]);
    const [selectedPoints, setSelectedPoints] = useState<{ [key: string]: string }>({});
    const [revealedPoints, setRevealedPoints] = useState<boolean>(false);
    const [averagePoints, setAveragePoints] = useState<number | null>(null);
    const [roomId, setRoomId] = useState<string | null>(initialRoomId);
    const [showQuestPointManagement, setShowQuestPointManagement] = useState<boolean>(false);
    const [canVote, setCanVote] = useState<boolean>(true);
    const connectionRef = useRef<any>(null);

    useEffect(() => {
        if (!connectionRef.current) {
            const newConnection = createSignalRConnection(SIGNALR_URL);
            console.log('Attempting to connect to SignalR...');

            newConnection.start()
                .then(() => {
                    console.log('Connected to SignalR');
                    if (roomId) {
                        const userId = localStorage.getItem('userId');
                        const username = localStorage.getItem('username');
                        newConnection.invoke("JoinRoom", roomId, username, userId)
                            .then(() => console.log(`Joined room: ${roomId}`))
                            .catch((err: any) => console.error('Error joining room:', err));
                    }
                })
                .catch((err: any) => console.error('Error connecting to SignalR:', err));

            connectionRef.current = newConnection;

            // Log when a new user joins
            newConnection.on("UserJoined", (userId: string, userName: string) => {
                console.log(`User joined: ${userId}, ${userName}`);
                setUsers(prev => {
                    if (!prev.some(user => user.userId === userId)) {
                        return [...prev, { userId, userName }];
                    }
                    return prev;
                });
            });

            // Handle UpdateCanVote event
            newConnection.on("UpdateCanVote", (canVote: boolean) => {
                console.log('CanVote state updated:', canVote);
                setCanVote(canVote);
            });

            // Log when a user leaves
            newConnection.on("UserLeft", (userId: string) => {
                console.log(`User left: ${userId}`);
                setUsers(prev => prev.filter(user => user.userId !== userId));
            });

            // Log when user list is updated
            newConnection.on("UpdateUserList", (userList: { userId: string, userName: string }[]) => {
                console.log('User list updated:', userList);
                setUsers(userList);
            });

            // Log when user selects points
            newConnection.on("UserSelectedPoints", (userId: string, points: string) => {
                console.log(`User ${userId} selected points: ${points}`);
                setSelectedPoints(prev => ({ ...prev, [userId]: points }));
            });

            // Log when points are revealed
            newConnection.on("PointsRevealed", (votes: { [key: string]: string }, averagePoints: number) => {
                console.log('Points revealed:', votes);
                setSelectedPoints(votes);
                setRevealedPoints(true);
                setAveragePoints(averagePoints);
            });

            // Log when voting is reset
            newConnection.on("VotingReset", () => {
                console.log('Voting has been reset');
                setSelectedPoints({});
                setRevealedPoints(false);
                setAveragePoints(null);
            });

            // Log when quest points management setting changes
            newConnection.on("SetQuestPointsManegment", (isQuestPointsManegment: boolean) => {
            console.log('Quest points management setting changed:', isQuestPointsManegment);
            setShowQuestPointManagement(isQuestPointsManegment);
              
            });
        }
    }, [roomId, showQuestPointManagement]);

    // Debug log for component render or state changes
    //useEffect(() => {
    //    console.log('SignalR hook state updated:', { users, selectedPoints, revealedPoints, averagePoints, roomId, showQuestPointManagement, canVote });
    //}, [users, selectedPoints, revealedPoints, averagePoints, roomId, showQuestPointManagement, canVote]);

    return {
        connection: connectionRef.current,
        users,
        selectedPoints,
        revealedPoints,
        averagePoints,
        showQuestPointManagement,
        canVote,
        setUsers,
        setSelectedPoints,
        setRevealedPoints,
        setAveragePoints,
        setRoomId,
        setShowQuestPointManagement,
        setCanVote
    };
};

export default useSignalR;

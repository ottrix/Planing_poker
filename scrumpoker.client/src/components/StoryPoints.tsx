import React from 'react';

interface StoryPointsProps {
    storyPoints: string[];
    selectedPoints: { [key: string]: string };
    username: string;
    handleSelectStoryPoints: (points: string) => void;
    canVote: boolean;
}

const StoryPoints: React.FC<StoryPointsProps> = ({ storyPoints, selectedPoints, username, handleSelectStoryPoints, canVote }) => {
    const userId = localStorage.getItem('userId');
    const selectedPoint = selectedPoints[userId as string];

    return (
        <div className={`cards-container ${selectedPoint ? 'selected' : ''}`}>
            {storyPoints.map((points, index) => (
                <button
                    key={index}
                    className={`btn m-2 btn-card ${selectedPoint === points ? 'btn-primary selected-card' : 'btn-outline-primary'}`}
                    disabled={!canVote}
                    onClick={() => handleSelectStoryPoints(points)}>
                    {points}
                </button>
            ))}
        </div>
    );
};

export default StoryPoints;

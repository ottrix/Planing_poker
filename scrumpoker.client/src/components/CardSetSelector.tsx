import React from 'react';

interface CardSetSelectorProps {
    cardSets: { id: string, name: string, values: string[] }[];
    selectedCardSetId: string;
    onSelectCardSet: (cardSetId: string) => void;
}

const CardSetSelector: React.FC<CardSetSelectorProps> = ({ cardSets, selectedCardSetId, onSelectCardSet }) => {
    return (
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <label htmlFor="cardSetSelector" className="form-label" style={{ textAlign: 'left', display: 'block', fontWeight: 'bold' }}>Select Card Set:</label>
            <select
                id="cardSetSelector"
                className="form-control"
                value={selectedCardSetId}
                onChange={(e) => onSelectCardSet(e.target.value)}
            >
                {cardSets.map((cardSet) => (
                    <option key={cardSet.id} value={cardSet.id}>
                        {cardSet.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CardSetSelector;

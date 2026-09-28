import { createContext, useContext } from 'react';

export const LearningRoomContext = createContext(null);

export function useLearningRoom() {
    const context = useContext(LearningRoomContext);

    if (!context) {
        throw new Error('Learning room tabs must be rendered inside LearningRoomContext.');
    }

    return context;
}

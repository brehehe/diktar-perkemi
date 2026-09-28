import { createContext, useContext } from 'react';

export const SpeakerScheduleContext = createContext(null);

export function useSpeakerSchedule() {
    const context = useContext(SpeakerScheduleContext);

    if (!context) {
        throw new Error('Speaker schedule sections must be rendered inside SpeakerScheduleContext.');
    }

    return context;
}

import EventScheduleDialogs from './EventScheduleDialogs';
import EventAttendanceDialogs from './EventAttendanceDialogs';
import EventLearningDialogs from './EventLearningDialogs';
import EventRegistrationDialogs from './EventRegistrationDialogs';
import EventDocumentDialogs from './EventDocumentDialogs';

export default function EventShowDialogs() {
    return (
        <>
            <EventScheduleDialogs />
            <EventAttendanceDialogs />
            <EventLearningDialogs />
            <EventRegistrationDialogs />
            <EventDocumentDialogs />
        </>
    );
}

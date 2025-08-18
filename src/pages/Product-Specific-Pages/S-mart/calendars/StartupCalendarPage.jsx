// StartupCalendarPage.js
import CalendarWrapper from './CalendarWrapper';

const StartupCalendarPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Scheduled Meetings</h1>
      <CalendarWrapper type="startup" />
    </div>
  );
};

export default StartupCalendarPage;
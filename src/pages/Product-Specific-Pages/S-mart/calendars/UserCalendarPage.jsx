// UserCalendarPage.js
import CalendarWrapper from './CalendarWrapper';

const UserCalendarPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Meetings</h1>
      <CalendarWrapper type="user" />
    </div>
  );
};
export default UserCalendarPage;
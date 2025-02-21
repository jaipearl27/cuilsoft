import EventChart from "./EventChart";
import TopUsers from "./TopUsers";

const Dashboard = ({ analytics, eventHistory }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Total Events</h2>
          <p className="text-3xl">{analytics.totalEventCount}</p>
        </div>
        <div className="p-4 bg-green-500 text-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Active Users</h2>
          <p className="text-3xl">{analytics.activeUsersCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-purple-500 text-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Events Last 5 Min</h2>
          <p className="text-3xl">{analytics.eventCountLast5Minutes}</p>
        </div>
        <div className="p-4 bg-red-500 text-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Peak Events / Min</h2>
          <p className="text-3xl">{analytics.peakEventsPerMinute.toFixed(2)}</p>
        </div>
      </div>

      <EventChart eventTypeCounts={analytics.eventTypeCounts} />
      <TopUsers topUsers={analytics.topUsers} />
      
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Event History</h2>
        <ul className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md">
          {eventHistory.slice(0, 10).map((event, index) => (
            <li key={index} className="text-gray-700">
              {event.eventType} - {event.userId} ({new Date(event.timestamp).toLocaleTimeString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

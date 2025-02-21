const TopUsers = ({ topUsers }) => {
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Top Users</h2>
        <ul className="bg-gray-50 p-3 rounded-md">
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <li key={index} className="text-gray-700">
                {user.userId}: {user.eventCount} events
              </li>
            ))
          ) : (
            <p className="text-gray-500">No top users yet.</p>
          )}
        </ul>
      </div>
    );
  };
  
  export default TopUsers;
  
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import Dashboard from "./components/Dashboard";


const socket = io(import.meta.env.VITE_SOCKET_URL);

function App() {
  const [analytics, setAnalytics] = useState({
    totalEventCount: 0,
    eventCountLast5Minutes: 0,
    rollingAverage: 0,
    peakEventsPerMinute: 0,
    eventTypeCounts: {},
    activeUsersCount: 0,
    topUsers: [],
  });

  const [eventHistory, setEventHistory] = useState([]);

  useEffect(() => {

    socket.connect();


    // Fetch initial historical event data
    axios.get(`${import.meta.env.VITE_API_URL}/analytics`)
      .then((res) => {
        setEventHistory(res.data);
      })
      .catch((err) => console.error("Error fetching historical events:", err));




      function onConnect() {
        console.log('socket connected')
      }
  
      function onDisconnect() {
        console.log('socket disconnected')
        
      }


      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);


    // Listen for real-time updates
    socket.on("realTimeAggregations", (data) => {
      setAnalytics(data);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('realTimeAggregations')
    };
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Real-Time Analytics Dashboard
      </h1>
      <Dashboard analytics={analytics} eventHistory={eventHistory} />
    </div>
  );
}

export default App;

import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EF0"];

const EventChart = ({ eventTypeCounts }) => {
  const data = Object.entries(eventTypeCounts).map(([eventType, count], index) => ({
    name: eventType,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">Event Distribution</h2>
      <div className="flex justify-center">
        <PieChart width={300} height={300}>
          <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
};

export default EventChart;

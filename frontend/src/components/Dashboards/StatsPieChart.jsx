import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#FF7A00', '#2D3748'];

const StatsPieChart = ({ solvedCount, totalProblems }) => {
  const unsolvedCount = Math.max(totalProblems - solvedCount, 0);
  
  const data = [
    { name: 'Solved', value: solvedCount },
    { name: 'Unsolved', value: unsolvedCount },
  ];

  return (
    <div className="bg-dark-800 p-4 rounded-lg h-64">
      <h3 className="text-lg font-semibold mb-4 text-orange-primary">Problem Stats</h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsPieChart;
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const Heatmap = ({ solvedProblems }) => {

  const getHeatmapData = () => {
    if (!solvedProblems || solvedProblems.length === 0) return [];
    
    const dateMap = solvedProblems.reduce((acc, problem) => {
      if (!problem.solvedAt) return acc;
      
      const date = new Date(problem.solvedAt);
      if (isNaN(date.getTime())) return acc;
      
      const dateStr = date.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dateMap).map(([date, count]) => ({
      date,
      count
    }));
  };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  return (
    <div className="bg-dark-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-orange-primary">Activity Heatmap</h3>
      <div className="heatmap-container">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={getHeatmapData()}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return `color-github-${Math.min(value.count, 4)}`;
          }}
          tooltipDataAttrs={(value) => ({
            'data-tip': value ? `${value.date}: ${value.count} submissions` : 'No submissions',
          })}
          showWeekdayLabels={true}
        />
      </div>
    </div>
  );
};

export default Heatmap;

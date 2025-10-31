import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return <div className="text-center text-slate-500 dark:text-slate-400 py-4">Saisis des dépenses pour voir le graphique.</div>;
  }
  
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map(item => {
    const percent = item.value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      `L 0 0`, // Line to center
    ].join(' ');

    return { pathData, color: item.color };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-40 h-40 flex-shrink-0">
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((slice, i) => (
            <path key={i} d={slice.pathData} fill={slice.color} />
          ))}
        </svg>
      </div>
      <div className="flex-grow">
        <ul className="space-y-1 text-sm">
          {data.map(item => (
            <li key={item.label} className="flex items-center justify-between">
              <div className="flex items-center">
                 <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                 <span>{item.label}</span>
              </div>
              <span className="font-semibold">{((item.value / total) * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PieChart;
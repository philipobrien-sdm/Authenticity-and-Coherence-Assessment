import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RadarChartProps {
  data: {
    [key: string]: { score: number };
  } | null | undefined;
}

// Custom tick component to wrap long labels
const CustomizedAxisTick: React.FC<any> = (props) => {
  const { x, y, payload, textAnchor } = props;
  const words = payload.value.split(' ');
  const lineHeight = 14; // Approx line height for 12px font
  
  // Adjust the vertical position to center the multi-line text block
  const yOffset = (words.length - 1) * lineHeight / 2;

  return (
    <text
      x={x}
      y={y - yOffset}
      textAnchor={textAnchor}
      fill="#E2E8F0"
      fontSize={12}
      fontFamily="sans-serif"
    >
      {words.map((word, index) => (
        <tspan x={x} dy={index === 0 ? 0 : `${lineHeight}px`} key={index}>
          {word}
        </tspan>
      ))}
    </text>
  );
};

const RadarChartComponent: React.FC<RadarChartProps> = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([key, value]) => ({
    subject: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    score: value.score,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData} margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
        <PolarGrid stroke="#4A5568" />
        <PolarAngleAxis dataKey="subject" tick={<CustomizedAxisTick />} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'none' }} axisLine={{ stroke: 'none' }} />
        <Radar name="Score" dataKey="score" stroke="#2DD4BF" fill="#2DD4BF" fillOpacity={0.6} />
        <Tooltip
            contentStyle={{
                backgroundColor: '#1A202C',
                borderColor: '#2DD4BF',
                color: '#E2E8F0'
            }}
            cursor={{ stroke: '#2DD4BF', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Legend wrapperStyle={{ color: '#E2E8F0' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
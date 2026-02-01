import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  Legend
} from 'recharts';
import { DailyLog } from '../types';

interface ChartsProps {
  data: DailyLog[];
}

// Custom dot renderers voor iconen in de grafiek
const AlcoholDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.alcohol) return null;
  return <text x={cx} y={cy} dy={4} textAnchor="middle" fontSize={14}>🍷</text>;
};

const FoodDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.badFood) return null;
  return <text x={cx} y={cy} dy={4} textAnchor="middle" fontSize={14}>🍟</text>;
};

const Charts: React.FC<ChartsProps> = ({ data }) => {
  // Sorteer data op datum oplopend
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = sortedData.map(log => {
    // Check op slechte voeding keywords
    const isBadFood = ['choc', 'snoep', 'suiker', 'friet', 'pizza', 'burger', 'chips', 'koek', 'vet'].some(k => 
        (log.food.snacks + ' ' + log.food.dinner).toLowerCase().includes(k)
    );

    return {
        date: new Date(log.date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
        fullDate: log.date,
        stress: log.lifestyle.stress,
        pimple: log.skin.newPimple ? 1 : 0, 
        menstruation: log.menstruation.active ? 1 : 0,
        sleep: log.lifestyle.sleepHours,
        alcohol: log.alcohol.consumed ? 9 : null, // Zet icoon hoog in grafiek (y=9)
        badFood: isBadFood ? 8 : null, // Zet icoon hoog in grafiek (y=8)
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-pink-700">Totaaloverzicht</h3>
        <p className="text-gray-500 text-sm">Zie direct de relatie tussen je gedrag en je huid.</p>
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
            
            {/* X-as toont nu alle datums (interval 0) */}
            <XAxis dataKey="date" fontSize={10} interval={0} tickMargin={10} angle={-45} textAnchor="end" height={60} />
            
            {/* Linker Y-as: Stress & Slaap (0-10) */}
            <YAxis 
                yAxisId="left" 
                domain={[0, 10]} 
                label={{ value: 'Niveau', angle: -90, position: 'insideLeft', fill: '#666' }} 
                fontSize={12}
            />

            {/* Rechter Y-as: Puistjes & Menstruatie (0 of 1) */}
            <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 1]} 
                tick={false} 
                label={{ value: 'Status', angle: 90, position: 'insideRight', fill: '#666' }} 
            />

            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #fbcfe8', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ color: '#db2777', fontWeight: 'bold' }}
              itemStyle={{ fontSize: '12px' }}
              formatter={(value: any, name: string) => {
                  if (name === 'Nieuw Puistje') return value === 1 ? 'Ja 🚨' : 'Nee';
                  if (name === 'Menstruatie') return value === 1 ? 'Ja 🩸' : 'Nee';
                  if (name === 'Uren Slaap') return `${value}u`;
                  if (name === 'Alcohol') return value ? 'Ja' : 'Nee';
                  if (name === 'Snacks/Vet') return value ? 'Ja' : 'Nee';
                  return value;
              }}
            />
            
            <Legend verticalAlign="top" height={36} iconType="circle" />

            {/* Achtergrondvlakken */}
            <Area 
                yAxisId="right" 
                type="step" 
                dataKey="menstruation" 
                fill="#fbcfe8" 
                stroke="none" 
                fillOpacity={0.4} 
                name="Menstruatie" 
            />
            
            <Bar 
                yAxisId="right" 
                dataKey="pimple" 
                fill="#ef4444" 
                barSize={20} 
                name="Nieuw Puistje" 
                radius={[4, 4, 0, 0]}
            />

            {/* Lijnen */}
            <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="stress" 
                stroke="#ec4899" 
                strokeWidth={3} 
                name="Stress (0-5)" 
                dot={{ r: 3, strokeWidth: 2, fill: 'white' }} 
            />
            
            <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="sleep" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                name="Uren Slaap" 
                dot={{ r: 0 }} 
                strokeDasharray="5 5"
            />

            {/* Iconen (Invisible line, custom dot) */}
            <Line
                yAxisId="left"
                dataKey="alcohol"
                stroke="none"
                dot={<AlcoholDot />}
                name="Alcohol"
                isAnimationActive={false}
            />
            <Line
                yAxisId="left"
                dataKey="badFood"
                stroke="none"
                dot={<FoodDot />}
                name="Snacks/Vet"
                isAnimationActive={false}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4 text-xs justify-center text-gray-500">
          <div className="flex items-center gap-1">🔴 Breakout</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-pink-200"></span> Menstruatie</div>
          <div className="flex items-center gap-1"><span className="w-3 h-1 bg-pink-500"></span> Stress</div>
          <div className="flex items-center gap-1">🍷 Alcohol</div>
          <div className="flex items-center gap-1">🍟 Slecht Eten</div>
      </div>
    </div>
  );
};

export default Charts;
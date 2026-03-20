import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const LGAAnalyticsView: React.FC = () => {
  const complianceData = [
    { name: 'Compliant', value: 82, color: '#10b981' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Non-Compliant', value: 6, color: '#ef4444' },
  ];

  const revenueData = [
    { month: 'Oct', revenue: 4200000 },
    { month: 'Nov', revenue: 4800000 },
    { month: 'Dec', revenue: 5600000 },
    { month: 'Jan', revenue: 5100000 },
    { month: 'Feb', revenue: 6200000 },
    { month: 'Mar', revenue: 6800000 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <h3 className="font-serif italic text-xl mb-6">Compliance Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {complianceData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-mono uppercase opacity-60">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <h3 className="font-serif italic text-xl mb-6">Revenue Collection (₦)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ border: '1px solid #141414', borderRadius: '0', fontFamily: 'monospace' }}
                  formatter={(value: number) => [`₦${(value/1000000).toFixed(1)}M`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#141414" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

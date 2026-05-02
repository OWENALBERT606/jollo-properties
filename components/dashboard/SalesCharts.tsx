"use client";

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
  Cell,
  Legend,
} from "recharts";

interface MonthlySale {
  month: string;
  count: number;
}

interface Props {
  monthlySales: MonthlySale[];
  activeSales: number;
  partialSales: number;
  completedSales: number;
}

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#14b8a6"];

export default function SalesCharts({ monthlySales, activeSales, partialSales, completedSales }: Props) {
  const pieData = [
    { name: "Active", value: activeSales },
    { name: "Partial Payment", value: partialSales },
    { name: "Completed", value: completedSales },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar chart - monthly completed sales */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Monthly Sales (Last 6 Months)</h2>
        {monthlySales.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`${v} sales`, "Completed"]} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie chart - transaction status breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Sales Status Breakdown</h2>
        {pieData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../contexts/ThemeContext'

interface StatsChartProps {
  type: 'line' | 'bar' | 'pie'
  data: any[]
  dataKey?: string
  xAxisKey?: string
  title?: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function StatsChart({ type, data, dataKey = 'value', xAxisKey = 'name', title }: StatsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartColors = {
    text: isDark ? '#E5E7EB' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB',
    tooltip: isDark ? '#1F2937' : '#FFFFFF',
  }

  if (type === 'line') {
    return (
      <div className="w-full h-80">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke={chartColors.text}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke={chartColors.text}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.tooltip, 
                border: `1px solid ${chartColors.grid}`,
                borderRadius: '8px',
                color: chartColors.text
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'bar') {
    return (
      <div className="w-full h-80">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke={chartColors.text}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke={chartColors.text}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.tooltip, 
                border: `1px solid ${chartColors.grid}`,
                borderRadius: '8px',
                color: chartColors.text
              }}
            />
            <Legend />
            <Bar 
              dataKey={dataKey} 
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'pie') {
    return (
      <div className="w-full h-80">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.tooltip, 
                border: `1px solid ${chartColors.grid}`,
                borderRadius: '8px',
                color: chartColors.text
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}

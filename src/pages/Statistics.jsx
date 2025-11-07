import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Mock statistics data
const MODEL_STATS = [
  { model: 'GPT-4', safe: 45, jailbroken: 5, total: 50 },
  { model: 'GPT-3.5', safe: 38, jailbroken: 12, total: 50 },
  { model: 'Claude 3', safe: 48, jailbroken: 2, total: 50 },
  { model: 'Llama 2', safe: 20, jailbroken: 30, total: 50 },
  { model: 'Mistral', safe: 25, jailbroken: 25, total: 50 },
];

const OVERALL_STATS = [
  { name: 'Safe', value: 176, color: '#86EFAC' },
  { name: 'Jailbroken', value: 74, color: '#F87171' },
];

const TIME_SERIES_DATA = [
  { date: 'Jan 1', safe: 12, jailbroken: 3 },
  { date: 'Jan 8', safe: 15, jailbroken: 5 },
  { date: 'Jan 15', safe: 18, jailbroken: 4 },
  { date: 'Jan 22', safe: 20, jailbroken: 6 },
  { date: 'Jan 29', safe: 22, jailbroken: 7 },
];

const ATTACK_TYPE_DATA = [
  { type: 'Role Playing', count: 25 },
  { type: 'Developer Mode', count: 18 },
  { type: 'Ignore Instructions', count: 15 },
  { type: 'Jailbreak Prompts', count: 10 },
  { type: 'Other', count: 6 },
];

const COLORS = {
  safe: '#86EFAC',
  jailbroken: '#F87171',
  sky: '#7DD3FC',
  moss: '#86EFAC',
};

function Statistics() {
  const totalTests = MODEL_STATS.reduce((sum, m) => sum + m.total, 0);
  const totalSafe = MODEL_STATS.reduce((sum, m) => m.safe + sum, 0);
  const totalJailbroken = MODEL_STATS.reduce((sum, m) => m.jailbroken + sum, 0);
  const safetyRate = ((totalSafe / totalTests) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics & Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into your prompt injection testing</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-radial">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalTests}</div>
          </CardContent>
        </Card>

        <Card className="shadow-radial">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Safe Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.safe }}>{totalSafe}</div>
          </CardContent>
        </Card>

        <Card className="shadow-radial">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jailbroken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.jailbroken }}>{totalJailbroken}</div>
          </CardContent>
        </Card>

        <Card className="shadow-radial">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Safety Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-600">{safetyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Model Comparison Bar Chart */}
        <Card className="shadow-radial-lg">
          <CardHeader>
            <CardTitle>Model Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MODEL_STATS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="model" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)'
                  }} 
                />
                <Legend />
                <Bar dataKey="safe" fill={COLORS.safe} name="Safe" radius={[8, 8, 0, 0]} />
                <Bar dataKey="jailbroken" fill={COLORS.jailbroken} name="Jailbroken" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overall Distribution Pie Chart */}
        <Card className="shadow-radial-lg">
          <CardHeader>
            <CardTitle>Overall Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={OVERALL_STATS}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {OVERALL_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Series and Attack Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Time Series Line Chart */}
        <Card className="shadow-radial-lg">
          <CardHeader>
            <CardTitle>Testing Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={TIME_SERIES_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="safe" 
                  stroke={COLORS.safe} 
                  strokeWidth={2}
                  name="Safe"
                  dot={{ fill: COLORS.safe, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="jailbroken" 
                  stroke={COLORS.jailbroken} 
                  strokeWidth={2}
                  name="Jailbroken"
                  dot={{ fill: COLORS.jailbroken, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attack Types Bar Chart */}
        <Card className="shadow-radial-lg">
          <CardHeader>
            <CardTitle>Attack Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ATTACK_TYPE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="type" type="category" stroke="#6B7280" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)'
                  }} 
                />
                <Bar dataKey="count" fill={COLORS.sky} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Safety Rates Table */}
      <Card className="shadow-radial-lg">
        <CardHeader>
          <CardTitle>Model Safety Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Model</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Tests</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Safe</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Jailbroken</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Safety Rate</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_STATS.map((stat) => {
                  const safetyRate = ((stat.safe / stat.total) * 100).toFixed(1);
                  return (
                    <tr key={stat.model} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{stat.model}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{stat.total}</td>
                      <td className="py-3 px-4 text-sm text-right" style={{ color: COLORS.safe }}>{stat.safe}</td>
                      <td className="py-3 px-4 text-sm text-right" style={{ color: COLORS.jailbroken }}>{stat.jailbroken}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-sky-600">{safetyRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Statistics;


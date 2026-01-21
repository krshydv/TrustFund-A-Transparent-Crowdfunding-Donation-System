import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign, TrendingUp, Award } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // 1. Fetch Real Data from Backend
      const response = await api.get('/analytics/dashboard');
      
      if (response.data.success) {
        const realData = response.data.data;

        // 2. Process Chart Data: Fill in missing months with 0
        // This makes the chart look "real" even with sparse data
        const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const processedChartData = allMonths.map(month => {
          // Find if we have data for this month from backend
          const found = realData.monthlyData.find(d => d.name === month);
          return {
            name: month,
            amount: found ? found.amount : 0 // Use 0 if no donations that month
          };
        });

        setStats({ ...realData, monthlyData: processedChartData });
      }
    } catch (error) {
      console.error("Analytics Error:", error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-center">No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button 
            onClick={fetchAnalytics}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Refresh Data ↻
          </button>
        </div>

        {/* 1. Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Raised */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Funds Raised</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-2">
                  ₹{stats.totalAmount?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Total Donations Count */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Donations</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.totalDonations || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Top Donor */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Top Donor</p>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  {stats.topDonor?.name || 'N/A'}
                </h3>
                <p className="text-xs text-emerald-600 font-medium">
                  Donated ₹{stats.topDonor?.amount?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Monthly Trend (Bar Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Donation Trends (2025)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12}}
                    interval={0} // Show all months
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Donors List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Leaderboard</h3>
            <div className="space-y-4">
              {stats.topDonors && stats.topDonors.length > 0 ? (
                stats.topDonors.map((donor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          index === 1 ? 'bg-gray-200 text-gray-700' : 
                          'bg-emerald-50 text-emerald-700'}
                      `}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{donor.name || 'Anonymous'}</span>
                    </div>
                    <span className="font-bold text-emerald-600">₹{donor.totalDonated?.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No donations yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
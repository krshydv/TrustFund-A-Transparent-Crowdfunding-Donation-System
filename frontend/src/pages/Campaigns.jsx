import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Heart, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Hardcoded category IDs matching the seeder
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: '650c1f1e1c9d440000000000', name: 'Medical' },
    { id: '650c1f1e1c9d440000000001', name: 'Education' },
    { id: '650c1f1e1c9d440000000002', name: 'Environment' },
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchQuery, selectedCategory, campaigns]);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      if (response.data.success) {
        setCampaigns(response.data.data || []);
        setFilteredCampaigns(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (campaign) => campaign.category?._id === selectedCategory || campaign.category?.toString() === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          campaign.title?.toLowerCase().includes(query) ||
          campaign.description?.toLowerCase().includes(query)
      );
    }

    setFilteredCampaigns(filtered);
  };

  const calculateProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">All Campaigns</h1>
          <p className="text-gray-600">Discover and support causes that matter to you</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full md:w-48 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
          </div>
        )}

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <EmptyState
            type={searchQuery || selectedCategory !== 'all' ? 'search' : 'campaigns'}
            message={
              searchQuery || selectedCategory !== 'all'
                ? 'No campaigns match your filters. Try adjusting your search.'
                : 'No campaigns available yet.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <Link
                key={campaign._id}
                to={`/campaign/${campaign._id}`}
                className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 group"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {campaign.images && campaign.images.length > 0 ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={campaign.images[0].url}
                      alt={campaign.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-colors">
                    <Heart className="h-12 w-12 text-primary-400 group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 line-clamp-2 min-h-[3.5rem] group-hover:text-primary-600 transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4.5rem]">
                    {campaign.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">
                        ₹{campaign.currentAmount?.toLocaleString() || 0} raised
                      </span>
                      <span className="text-gray-600">
                        of ₹{campaign.goalAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-1000 group-hover:from-primary-600 group-hover:to-primary-700"
                        style={{
                          width: `${calculateProgress(
                            campaign.currentAmount || 0,
                            campaign.goalAmount || 1
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-primary-600 mt-1 font-medium">
                      {calculateProgress(campaign.currentAmount || 0, campaign.goalAmount || 1).toFixed(0)}% funded
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <span className="font-medium">
                      By {campaign.creator?.firstName} {campaign.creator?.lastName}
                    </span>
                    {campaign.endDate && (
                      <span>Ends {format(new Date(campaign.endDate), 'MMM d')}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;

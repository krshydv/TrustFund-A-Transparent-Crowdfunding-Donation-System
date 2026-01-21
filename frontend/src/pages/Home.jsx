import { Link } from 'react-router-dom';
import { Heart, ArrowRight, TrendingUp, Users, DollarSign, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalRaised: 0, totalCampaigns: 0, totalDonors: 0 });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      if (response.data.success) {
        const campaigns = response.data.data || [];
        // Get featured campaigns (first 3 or campaigns with highest progress)
        const sorted = campaigns.sort((a, b) => {
          const progressA = (a.currentAmount || 0) / (a.goalAmount || 1);
          const progressB = (b.currentAmount || 0) / (b.goalAmount || 1);
          return progressB - progressA;
        });
        setFeaturedCampaigns(sorted.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/campaigns');
      if (response.data.success) {
        const campaigns = response.data.data || [];
        const totalRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
        setStats({
          totalRaised,
          totalCampaigns: campaigns.length,
          totalDonors: campaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Faded Background Image with Animation */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/image.png)',
            opacity: 0.15,
            animation: 'float 20s ease-in-out infinite, pulse-slow 4s ease-in-out infinite',
            transform: 'scale(1.1)',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-primary-700/80 to-primary-800/90" />
        
        {/* Floating Sparkles Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-block mb-6 animate-bounce-slow">
              <Heart className="h-20 w-20 mx-auto text-white drop-shadow-2xl" fill="currentColor" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-lg animate-fade-in-up-delay">
              <span className="block">Make a</span>
              <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Difference
              </span>
              <span className="block">Today</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-2xl mx-auto animate-fade-in-up-delay-2">
              Support causes you care about and help change lives. Every contribution matters.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up-delay-3">
              <Link
                to="/campaigns"
                className="group relative bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span className="flex items-center justify-center">
                  Explore Campaigns
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="group relative bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-400 transition-all duration-300 transform hover:scale-105 border-2 border-white/50 shadow-xl hover:shadow-2xl backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center">
                    Start a Campaign
                    <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </Link>
              ) : (
                <Link
                  to="/create-campaign"
                  className="group relative bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-400 transition-all duration-300 transform hover:scale-105 border-2 border-white/50 shadow-xl hover:shadow-2xl backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center">
                    Create Campaign
                    <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                ₹{stats.totalRaised.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Raised</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {stats.totalCampaigns}
              </div>
              <div className="text-gray-600">Active Campaigns</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {stats.totalDonors}
              </div>
              <div className="text-gray-600">Generous Donors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Featured Campaigns</h2>
            <p className="text-gray-600">Discover campaigns making a real impact</p>
          </div>
          <Link
            to="/campaigns"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center group transition-colors"
          >
            View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : featuredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign, index) => (
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                  <p className="text-sm text-gray-500 font-medium">
                    By {campaign.creator?.firstName} {campaign.creator?.lastName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState type="campaigns" />
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of people making a difference in their communities
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={isAuthenticated ? "/create-campaign" : "/register"}
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Your Campaign
            </Link>
            <Link
              to="/campaigns"
              className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-all duration-300 transform hover:scale-105 border-2 border-white/50"
            >
              Browse Campaigns
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

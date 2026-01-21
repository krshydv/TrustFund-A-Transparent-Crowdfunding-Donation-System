import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Heart, User, Calendar, DollarSign, CreditCard, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Donation State
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      if (response.data.success) {
        setCampaign(response.data.data.campaign);
        setDonations(response.data.data.donations || []);
      }
    } catch (error) {
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Handle Campaign Deletion
  const handleDelete = async () => {
    if(!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success("Campaign deleted successfully");
      navigate('/campaigns');
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const handleMockPayment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to donate');
      navigate('/login');
      return;
    }

    // Basic Validation
    if (!donationAmount || Number(donationAmount) < 10) {
      toast.error('Minimum donation is ₹10');
      return;
    }
    if (!cardDetails.number || !cardDetails.cvv || !cardDetails.expiry) {
      toast.error('Please enter dummy card details');
      return;
    }

    setDonating(true);
    try {
      // Call the MOCK Payment Endpoint
      const response = await api.post('/payments/mock', {
        amount: Number(donationAmount),
        campaignId: id,
        cardNumber: cardDetails.number
      });

      if (response.data.success) {
        toast.success('Payment Successful! Thank you for your support.');
        setDonationAmount('');
        setCardDetails({ number: '', expiry: '', cvv: '' });
        setShowPaymentForm(false);
        
        // Refresh data to show new progress
        fetchCampaign(); 
      }
    } catch (error) {
      console.error("Donation Error:", error);
      const message = error.response?.data?.message || 'Payment Failed';
      toast.error(message);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!campaign) return null;

  const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
  const isCreator = user && campaign.creator && user._id === campaign.creator._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {campaign.images && campaign.images.length > 0 ? (
              <img
                src={campaign.images[0].url}
                alt={campaign.title}
                className="w-full h-96 object-cover rounded-xl shadow-sm"
              />
            ) : (
              <div className="w-full h-96 bg-emerald-50 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="h-24 w-24 text-emerald-300" />
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
                {isCreator && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDelete}
                      className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete Campaign
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 mb-6 text-gray-500 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>by {campaign.creator?.firstName} {campaign.creator?.lastName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Ends {campaign.endDate ? format(new Date(campaign.endDate), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-900 font-bold text-lg">
                    ₹{campaign.currentAmount?.toLocaleString() || 0}
                  </span>
                  <span className="text-gray-500">
                    goal of ₹{campaign.goalAmount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-emerald-600 mt-2 font-medium">{progress.toFixed(0)}% Funded</p>
              </div>

              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {campaign.description}
              </div>
            </div>

            {/* Recent Donations List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Supporters</h2>
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation._id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                          {donation.donorName ? donation.donorName.charAt(0) : 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{donation.donorName || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">{format(new Date(donation.createdAt), 'MMM d')}</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600 text-sm">+ ₹{donation.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center italic py-4">Be the first to donate!</p>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Donation Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <Heart className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Make a Donation</h2>
              </div>
              
              {!showPaymentForm ? (
                // STEP 1: Enter Amount
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Min ₹10"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                        if(donationAmount >= 10) setShowPaymentForm(true);
                        else toast.error("Enter at least ₹10");
                    }}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Proceed to Pay
                  </button>
                  <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                    <Lock size={12} /> Secure Payment Gateway
                  </p>
                </div>
              ) : (
                // STEP 2: Fake Credit Card Form
                <form onSubmit={handleMockPayment} className="space-y-4 animate-fadeIn">
                   <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
                      ℹ️ <strong>Demo Mode:</strong> Enter any fake card details. No money will be deducted.
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">CARD NUMBER</label>
                      <div className="relative">
                         <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                         <input 
                            type="text" 
                            placeholder="4242 4242 4242 4242"
                            className="block w-full pl-10 py-2 border border-gray-300 rounded-md text-sm"
                            maxLength="19"
                            required
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">EXPIRY</label>
                        <input 
                            type="text" 
                            placeholder="MM/YY"
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
                            required
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                         />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">CVV</label>
                        <input 
                            type="password" 
                            placeholder="123"
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
                            maxLength="3"
                            required
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                         />
                      </div>
                   </div>

                   <button
                    type="submit"
                    disabled={donating}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all flex justify-center items-center gap-2"
                  >
                    {donating ? (
                        <>Processing <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span></>
                    ) : (
                        `Pay ₹${Number(donationAmount).toLocaleString()}`
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
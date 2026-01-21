import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Camera, Upload } from 'lucide-react';

const Profile = () => {
  const { user: contextUser, login } = useAuth(); 
  // Local state to hold the freshest user data from the server
  const [user, setUser] = useState(contextUser);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Fetch Fresh Data on Load (Fixes the "Old Amount" bug)
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
          // Optionally update global context too if your auth logic supports it
          // login(response.data.data, localStorage.getItem('token')); 
        }
      } catch (error) {
        console.error("Failed to refresh profile", error);
      }
    };
    fetchLatestProfile();
  }, []);

  // If data is still loading
  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const response = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Profile image updated!');
        // Update local view immediately
        if (response.data.user) {
           setUser(response.data.user);
        } else {
           // Fallback reload if backend doesn't return user
           window.location.reload();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary-100 bg-gray-100">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <User size={64} />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg group-hover:bg-emerald-700 transition-colors">
                   {uploading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Upload size={16} />}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/jpeg,image/png,image/jpg"
              />
              <p className="mt-3 text-gray-500 text-sm">{user.email}</p>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <User className="inline-block w-4 h-4 mr-1" /> First Name
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-gray-900 font-medium border border-gray-100">
                   {/* FIX: Reading directly from root */}
                   {user.firstName || 'N/A'}
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <User className="inline-block w-4 h-4 mr-1" /> Last Name
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-gray-900 font-medium border border-gray-100">
                   {user.lastName || 'N/A'}
                </div>
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Mail className="inline-block w-4 h-4 mr-1" /> Email
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-gray-900 font-medium border border-gray-100">
                   {user.email}
                </div>
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Phone className="inline-block w-4 h-4 mr-1" /> Phone Number
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-gray-900 font-medium border border-gray-100">
                   {/* FIX: Reading 'phoneNumber' which matches your backend */}
                   {user.phoneNumber || 'Not provided'}
                </div>
              </div>

            </div>

            {/* Stats Section */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Your Impact</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <p className="text-sm text-gray-600">Total Donated</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    ₹{user.totalDonated?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600">Campaigns Created</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {user.totalCampaignsCreated || 0}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SEOHead } from '../seo/SEOHead';
import { Breadcrumb, breadcrumbConfigs } from '../seo/Breadcrumb';
import { profileSetupSEO } from '../seo/seoConfig';

export const ProfileSetupPage: React.FC = () => {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    social_links: {
      twitter: '',
      instagram: '',
      facebook: '',
      linkedin: ''
    }
  });

  // Populate form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        social_links: {
          twitter: user.social_links?.twitter || '',
          instagram: user.social_links?.instagram || '',
          facebook: user.social_links?.facebook || '',
          linkedin: user.social_links?.linkedin || ''
        }
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both profile setup for new users and profile editing for existing users
  // Remove the redirect to gallery - users should be able to edit their profiles
  
  // Debug logging
  console.log('ProfileSetupPage - User:', user);
  console.log('ProfileSetupPage - Loading:', loading);
  console.log('ProfileSetupPage - Profile completed:', user?.profile_completed);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social_')) {
      const socialField = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile(formData);
      navigate('/gallery');
    } catch (error) {
      console.error('Profile setup error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        {...profileSetupSEO}
        url="/profile-setup"
        noIndex={true} // Private page
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Breadcrumb items={breadcrumbConfigs.profileSetup} />
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {user.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-purple-500"
                />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {user.profile_completed ? 'Edit Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-300">
              {user.profile_completed ? 'Update your profile information' : 'Help others get to know you better'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Display Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your display name"
                required
                className="bg-black/20 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Location
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                className="bg-black/20 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Website
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className="bg-black/20 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Social Links (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Twitter
                  </label>
                  <Input
                    type="text"
                    name="social_twitter"
                    value={formData.social_links.twitter}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Instagram
                  </label>
                  <Input
                    type="text"
                    name="social_instagram"
                    value={formData.social_links.instagram}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Facebook
                  </label>
                  <Input
                    type="text"
                    name="social_facebook"
                    value={formData.social_links.facebook}
                    onChange={handleInputChange}
                    placeholder="facebook.com/username"
                    className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    LinkedIn
                  </label>
                  <Input
                    type="text"
                    name="social_linkedin"
                    value={formData.social_links.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/username"
                    className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};
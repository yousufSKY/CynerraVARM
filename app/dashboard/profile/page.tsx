'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone, 
  Building, 
  Shield,
  Edit3,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Initialize form data with user information
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.primaryEmailAddress?.emailAddress || '',
      phone: user.primaryPhoneNumber?.phoneNumber || '',
      company: (user.unsafeMetadata?.company as string) || '',
      location: (user.unsafeMetadata?.location as string) || '',
      bio: (user.unsafeMetadata?.bio as string) || ''
    });
  }, [user, isLoaded, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Update user basic information
      await user?.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Update unsafe metadata for additional fields
      await user?.update({
        unsafeMetadata: {
          company: formData.company,
          location: formData.location,
          bio: formData.bio
        }
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your personal information and preferences</p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
            size="sm"
          >
            {isEditing ? (
              <>Save Changes</>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-20 sm:w-24 h-20 sm:h-24 mx-auto">
                <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                <AvatarFallback className="bg-cyan-600 text-white text-xl sm:text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <CardTitle className="text-white mt-4">
              {user.fullName || 'User'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt!).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Shield className="w-4 h-4" />
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Verified Account
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-slate-400">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300 text-sm">First Name</Label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 disabled:opacity-60 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300 text-sm">Last Name</Label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 disabled:opacity-60 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm">Email Address</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-slate-700/30 border-slate-600 text-slate-400 cursor-not-allowed text-sm"
                />
              </div>
              <p className="text-xs text-slate-500">Email cannot be changed from this page</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300 text-sm">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 disabled:opacity-60 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-300 text-sm">Company</Label>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your Company"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 disabled:opacity-60 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300 text-sm">Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  placeholder="City, Country"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 disabled:opacity-60 text-sm"
                />
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-300 text-sm">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={3}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 disabled:opacity-60 resize-none text-sm"
              />
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
                  size="sm"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
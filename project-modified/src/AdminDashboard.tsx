import { useState, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Search,
  X,
  Check,
  Clock,
  MapPin,
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Profile {
  id: string;
  user_id: string;
  email: string;
  is_admin: boolean;
}

interface TrackingEvent {
  id: string;
  package_id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface PackageData {
  id: string;
  tracking_number: string;
  recipient_name: string;
  sender_name: string;
  origin: string;
  destination: string;
  weight_kg: number;
  status: string;
  estimated_delivery: string;
  created_at: string;
  tracking_events?: TrackingEvent[];
}

type View = 'list' | 'create' | 'edit' | 'events';

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Package management state
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [view, setView] = useState<View>('list');
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    tracking_number: '',
    recipient_name: '',
    sender_name: '',
    origin: '',
    destination: '',
    weight_kg: '',
    status: 'pending',
    estimated_delivery: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tracking event form
  const [eventForm, setEventForm] = useState({
    status: 'pending',
    location: '',
    description: ''
  });
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchPackages = async () => {
    setPackagesLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
    }
    setPackagesLoading(false);
  };

  useEffect(() => {
    if (profile?.is_admin) {
      fetchPackages();
    }
  }, [profile?.is_admin]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: email
        });

      if (profileError) {
        setAuthError('Account created but profile setup failed. Contact admin.');
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPackages([]);
  };

  const generateTrackingNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PEX-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const trackingNumber = formData.tracking_number || generateTrackingNumber();

    const { data, error } = await supabase
      .from('packages')
      .insert({
        tracking_number: trackingNumber.toUpperCase(),
        recipient_name: formData.recipient_name,
        sender_name: formData.sender_name,
        origin: formData.origin,
        destination: formData.destination,
        weight_kg: parseFloat(formData.weight_kg) || 0,
        status: formData.status,
        estimated_delivery: formData.estimated_delivery || null
      })
      .select()
      .single();

    if (error) {
      setFormError(error.message);
      setFormLoading(false);
      return;
    }

    setFormData({
      tracking_number: '',
      recipient_name: '',
      sender_name: '',
      origin: '',
      destination: '',
      weight_kg: '',
      status: 'pending',
      estimated_delivery: ''
    });
    setFormLoading(false);
    setView('list');
    fetchPackages();
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setFormLoading(true);
    setFormError(null);

    const { error } = await supabase
      .from('packages')
      .update({
        tracking_number: formData.tracking_number.toUpperCase(),
        recipient_name: formData.recipient_name,
        sender_name: formData.sender_name,
        origin: formData.origin,
        destination: formData.destination,
        weight_kg: parseFloat(formData.weight_kg) || 0,
        status: formData.status,
        estimated_delivery: formData.estimated_delivery || null
      })
      .eq('id', selectedPackage.id);

    if (error) {
      setFormError(error.message);
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    setView('list');
    setSelectedPackage(null);
    fetchPackages();
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    await supabase.from('tracking_events').delete().eq('package_id', id);
    await supabase.from('packages').delete().eq('id', id);
    fetchPackages();
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setEventLoading(true);

    await supabase.from('tracking_events').insert({
      package_id: selectedPackage.id,
      status: eventForm.status,
      location: eventForm.location,
      description: eventForm.description
    });

    await supabase
      .from('packages')
      .update({ status: eventForm.status })
      .eq('id', selectedPackage.id);

    setEventForm({ status: 'pending', location: '', description: '' });
    setEventLoading(false);

    const { data } = await supabase
      .from('packages')
      .select('*, tracking_events(*)')
      .eq('id', selectedPackage.id)
      .single();

    if (data) {
      setSelectedPackage(data);
    }
    fetchPackages();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this tracking event?')) return;

    await supabase.from('tracking_events').delete().eq('id', eventId);

    const { data } = await supabase
      .from('packages')
      .select('*, tracking_events(*)')
      .eq('id', selectedPackage?.id)
      .single();

    if (data) {
      setSelectedPackage(data);
    }
    fetchPackages();
  };

  const openEditView = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setFormData({
      tracking_number: pkg.tracking_number,
      recipient_name: pkg.recipient_name,
      sender_name: pkg.sender_name,
      origin: pkg.origin,
      destination: pkg.destination,
      weight_kg: pkg.weight_kg.toString(),
      status: pkg.status,
      estimated_delivery: pkg.estimated_delivery || ''
    });
    setView('edit');
  };

  const openEventsView = async (pkg: PackageData) => {
    const { data } = await supabase
      .from('packages')
      .select('*, tracking_events(*)')
      .eq('id', pkg.id)
      .single();

    if (data) {
      setSelectedPackage(data);
      setView('events');
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'out_for_delivery': return 'bg-violet-100 text-violet-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!session || !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
              <Shield className="w-12 h-12 text-white mx-auto mb-3" />
              <h2 className="font-['Poppins'] text-2xl font-bold text-white">Admin Portal</h2>
              <p className="text-orange-100 text-sm mt-1">Post Express Dashboard</p>
            </div>

            <div className="p-6">
              {profile && !profile.is_admin && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Admin Access Required</p>
                    <p className="text-sm text-amber-700 mt-1">Your account needs admin privileges to access this dashboard.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAuthView('signin')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    authView === 'signin'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthView('signup')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    authView === 'signup'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={authView === 'signin' ? handleSignIn : handleSignUp}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {authError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      authView === 'signin' ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Site</span>
              </a>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <h1 className="font-['Poppins'] font-bold text-lg text-slate-800">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">{profile?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search packages..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <button
                onClick={() => {
                  setFormData({
                    tracking_number: '',
                    recipient_name: '',
                    sender_name: '',
                    origin: '',
                    destination: '',
                    weight_kg: '',
                    status: 'pending',
                    estimated_delivery: ''
                  });
                  setView('create');
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Package
              </button>
            </div>

            {packagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-1">No packages found</h3>
                <p className="text-slate-500">Get started by creating your first package.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking #</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-medium text-slate-800">{pkg.tracking_number}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{pkg.recipient_name}</p>
                            <p className="text-sm text-slate-500">From: {pkg.sender_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{pkg.origin}</p>
                            <p className="text-sm text-slate-400">→ {pkg.destination}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pkg.status)}`}>
                              {pkg.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(pkg.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEventsView(pkg)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Tracking Events"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditView(pkg)}
                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {(view === 'create' || view === 'edit') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Poppins'] text-xl font-bold text-slate-800">
                  {view === 'create' ? 'Create New Package' : 'Edit Package'}
                </h2>
                <button
                  onClick={() => {
                    setView('list');
                    setSelectedPackage(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {formError}
                </div>
              )}

              <form onSubmit={view === 'create' ? handleCreatePackage : handleUpdatePackage} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={formData.tracking_number}
                      onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sender Name *</label>
                    <input
                      type="text"
                      value={formData.sender_name}
                      onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Name *</label>
                    <input
                      type="text"
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Origin *</label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Destination *</label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Est. Delivery Date</label>
                    <input
                      type="date"
                      value={formData.estimated_delivery}
                      onChange={(e) => setFormData({...formData, estimated_delivery: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setView('list');
                      setSelectedPackage(null);
                    }}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {view === 'create' ? 'Create Package' : 'Update Package'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'events' && selectedPackage && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setView('list');
                setSelectedPackage(null);
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to packages
            </button>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
                <p className="text-slate-400 text-sm mb-1">Tracking Number</p>
                <h2 className="font-['Poppins'] text-2xl font-bold">{selectedPackage.tracking_number}</h2>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-slate-400">From:</span> {selectedPackage.sender_name} ({selectedPackage.origin})
                  </div>
                  <div>
                    <span className="text-slate-400">To:</span> {selectedPackage.recipient_name} ({selectedPackage.destination})
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-slate-800 mb-4">Add Tracking Event</h3>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({...eventForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Package status update"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={eventLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {eventLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Event
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Tracking History</h3>
              {selectedPackage.tracking_events && selectedPackage.tracking_events.length > 0 ? (
                <div className="space-y-4">
                  {selectedPackage.tracking_events
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event) => (
                      <div key={event.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(event.status)}`}>
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{event.status.replace('_', ' ')}</p>
                              <p className="text-sm text-slate-500">{event.description}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No tracking events yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

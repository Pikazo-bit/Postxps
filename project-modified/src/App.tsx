import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminDashboard from './AdminDashboard';
import {
  Truck,
  Package,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  X,
  Send,
  User,
  Box,
  Warehouse,
  Plane,
  Ship,
  Building2,
  Home,
  Briefcase,
  Music,
  Car,
  Leaf,
  Star,
  MessageSquare,
  Clock3,
  Award,
  Users,
  Phone,
  Mail,
  ArrowRight,
  Menu,
  Quote,
  ChevronRight,
  Shield,
  Globe,
  Zap,
  Check
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface TrackingEvent {
  id: string;
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
  tracking_events: TrackingEvent[];
}

interface QuoteForm {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
}

function App() {
  const pathname = window.location.pathname;

  if (pathname === '/admin') {
    return <AdminDashboard />;
  }

  return <MainSite />;
}

function MainSite() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    setPackageData(null);

    try {
      const { data: pkg, error: pkgError } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (pkgError || !pkg) {
        setError('Package not found. Please check your tracking number and try again.');
        setIsLoading(false);
        return;
      }

      const { data: events } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('package_id', pkg.id)
        .order('timestamp', { ascending: true });

      setPackageData({
        ...pkg,
        tracking_events: events || []
      });
    } catch {
      setError('An error occurred while tracking your package.');
    }
    setIsLoading(false);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quote request');
      }

      setSubmitSuccess(true);
      setQuoteForm({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        message: ''
      });
    } catch {
      setSubmitError('Failed to send your quote request. Please try again or contact us directly at info@postsxps.com.');
    }
    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-700 bg-amber-100';
      case 'in_transit':
        return 'text-blue-700 bg-blue-100';
      case 'out_for_delivery':
        return 'text-violet-700 bg-violet-100';
      case 'delivered':
        return 'text-emerald-700 bg-emerald-100';
      default:
        return 'text-white bg-green-900';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_transit':
        return 'In Transit';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navLinks = [
    { href: '#', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#about', label: 'About' },
    { href: '#special-services', label: 'Special Services' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-green-950 font-['Inter'] antialiased">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-green-900/95 backdrop-blur-md shadow-lg shadow-green-900/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl shadow-lg shadow-green-200/50 group-hover:shadow-green-300/50 transition-shadow">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-['Poppins'] font-bold text-xl text-white leading-tight">
                  Post Express
                </h1>
                <p className="text-xs text-green-600 font-semibold tracking-wide">MOVING & STORAGE</p>
              </div>
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    scrolled
                      ? 'text-white hover:text-green-600 hover:bg-green-50'
                      : 'text-white hover:text-green-600 hover:bg-white/50'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:shadow-xl hover:shadow-green-200/50 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Free Quote
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-green-900 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-green-800 border-t border-green-800 shadow-xl">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-white font-medium hover:bg-green-50 hover:text-green-600 transition-colors flex items-center justify-between group"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
              ))}
              <button
                onClick={() => {
                  setShowQuoteModal(true);
                  setMobileMenuOpen(false);
                }}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold text-sm"
              >
                Get Free Quote
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Logistics"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-950/95 to-slate-900/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/50 via-transparent to-green-950/30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border border-green-500/30">
              <Truck className="w-4 h-4" />
              Trusted by 2,650+ Customers Worldwide
            </div>

            <h2 className="font-['Poppins'] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white mb-6">
              Move Smarter,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">Store Safer</span>
            </h2>

            <p className="text-slate-300 text-lg sm:text-xl mb-10 leading-relaxed max-w-lg">
              Professional moving and storage solutions for homes, offices, and businesses.
              Fast, reliable, and fully insured — from local moves to global freight.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold text-base hover:shadow-2xl hover:shadow-green-500/30 transition-all hover:-translate-y-1"
              >
                Get Free Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#services"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all"
              >
                Explore Services
              </a>
            </div>

            <div className="mt-16 pt-8 border-t border-white/20 grid grid-cols-3 gap-8 max-w-md">
              <div>
                <p className="font-['Poppins'] text-2xl font-bold text-white">15+</p>
                <p className="text-white/60 text-sm">Years Experience</p>
              </div>
              <div>
                <p className="font-['Poppins'] text-2xl font-bold text-white">120+</p>
                <p className="text-white/60 text-sm">Fleet Vehicles</p>
              </div>
              <div>
                <p className="font-['Poppins'] text-2xl font-bold text-white">48h</p>
                <p className="text-white/60 text-sm">Avg Delivery</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-950 to-transparent"></div>
      </section>

      {/* Track Package Section */}
      <section id="track" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1115195/pexels-photo-1115195.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Packages"
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-4">
              <Search className="w-5 h-5" />
              REAL-TIME TRACKING
            </div>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-white mb-4">
              Track Your Shipment
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Enter your tracking number to get live status updates and delivery timeline.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleTrack} className="mb-6">
              <div className="flex flex-col sm:flex-row bg-green-800 rounded-2xl shadow-xl shadow-green-900/50 overflow-hidden border border-green-700">
                <div className="flex-1 relative">
                  <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number (e.g. SWM-A3B7C2D1E)"
                    className="w-full pl-14 pr-4 py-5 text-white placeholder-slate-400 focus:outline-none text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-5 font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Circle className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Track Package
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-white/60 text-sm mb-8">
              Tracking numbers are provided in your booking confirmation email.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-start gap-3 mb-8">
                <Circle className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {packageData && (
              <div className="bg-green-800 rounded-2xl shadow-xl shadow-green-900/50 border border-green-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-900 text-white p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Tracking Number</p>
                      <p className="font-['Poppins'] text-xl font-bold">{packageData.tracking_number}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(packageData.status)}`}>
                      {getStatusLabel(packageData.status)}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Sender</p>
                      <p className="font-medium text-white">{packageData.sender_name}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Recipient</p>
                      <p className="font-medium text-white">{packageData.recipient_name}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Weight</p>
                      <p className="font-medium text-white">{packageData.weight_kg} kg</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Est. Delivery</p>
                      <p className="font-medium text-white">
                        {packageData.estimated_delivery ? formatDate(packageData.estimated_delivery) : 'TBD'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6 p-4 bg-green-900 rounded-xl">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{packageData.origin}</span>
                    </div>
                    <div className="flex-1 border-t border-dashed border-green-700 relative">
                      <Truck className="w-5 h-5 text-green-500 absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50" />
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">{packageData.destination}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      Tracking History
                    </h3>
                    <div className="space-y-0">
                      {packageData.tracking_events.map((event, index) => {
                        const isLast = index === packageData.tracking_events.length - 1;
                        return (
                          <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isLast
                                  ? 'bg-green-500 text-white shadow-lg shadow-orange-200'
                                  : 'bg-green-700 text-white/60'
                              }`}>
                                {isLast ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                                )}
                              </div>
                              {!isLast && <div className="w-0.5 h-16 bg-green-700 mt-2"></div>}
                            </div>
                            <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                              <div className="flex items-center gap-3 mb-1">
                                <span className={`text-sm font-semibold ${isLast ? 'text-green-600' : 'text-white'}`}>
                                  {getStatusLabel(event.status)}
                                </span>
                                <span className="text-xs text-white/60">{formatDateTime(event.timestamp)}</span>
                              </div>
                              <p className="text-white text-sm">{event.description}</p>
                              <p className="text-white/60 text-xs mt-1">{event.location}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-green-950" />
        <div className="absolute right-0 bottom-0 w-1/3 h-2/3 opacity-[0.03]">
          <img
            src="https://images.pexels.com/photos/906092/pexels-photo-906092.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Delivery truck"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-4">
              <Briefcase className="w-5 h-5" />
              WHAT WE OFFER
            </div>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-white mb-4">
              Comprehensive Moving & Logistics
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              From a single item to an entire household or office, we have the expertise, fleet,
              and facilities to move anything — anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Plane, title: 'Air Freight', desc: 'Express air cargo solutions for time-sensitive shipments. Door-to-door delivery with real-time tracking.' },
              { icon: Ship, title: 'Sea Cargo', desc: 'Full container and LCL ocean freight services connecting major global ports with marine insurance.' },
              { icon: Truck, title: 'Road Freight', desc: 'Nationwide trucking network for partial and full loads. GPS-monitored fleets ensure on-time delivery.' },
              { icon: Warehouse, title: 'Warehousing', desc: 'Short and long-term climate-controlled storage solutions with inventory management.' }
            ].map((service, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-7 border border-green-700 hover:border-green-200 transition-all duration-500 hover:shadow-2xl hover:shadow-green-100/50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative w-14 h-14 bg-green-800 rounded-xl flex items-center justify-center mb-5 shadow-sm group-hover:bg-green-500 transition-colors duration-300">
                  <service.icon className="w-7 h-7 text-green-500 group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="font-['Poppins'] text-lg font-bold text-white mb-3 group-hover:text-green-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {service.desc}
                </p>
                <a href="#contact" className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Moving team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-950/95 to-white/80"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-4">
                <Award className="w-5 h-5" />
                15+ YEARS OF EXCELLENCE
              </div>
              <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                Your Most Trusted Moving & Storage Partner
              </h2>
              <p className="text-white mb-4 leading-relaxed">
                Post Express Moving & Storage Services is a leading logistics company founded on the
                principles of reliability, transparency, and care.
              </p>
              <p className="text-white mb-8 leading-relaxed">
                Our nationwide fleet, certified team, and state-of-the-art storage facilities ensure
                your belongings are handled with the utmost professionalism — from pickup to final delivery.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Fully licensed, bonded & insured',
                  'Real-time shipment tracking',
                  'Dedicated account manager',
                  'Eco-friendly packing available',
                  'Transparent pricing — no hidden fees',
                  'Guaranteed delivery windows'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowQuoteModal(true)}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-green-200/50 transition-all hover:-translate-y-0.5"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="bg-green-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-['Poppins'] text-4xl font-bold text-green-600 mb-2">2,650+</p>
                <p className="text-white">Happy Clients</p>
              </div>
              <div className="bg-green-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-['Poppins'] text-4xl font-bold text-green-600 mb-2">120+</p>
                <p className="text-white">Expert Staff</p>
              </div>
              <div className="bg-green-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-['Poppins'] text-4xl font-bold text-green-600 mb-2">158</p>
                <p className="text-white">Fleet Vehicles</p>
              </div>
              <div className="bg-green-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-['Poppins'] text-4xl font-bold text-green-600 mb-2">458</p>
                <p className="text-white">Partner Networks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Services Section */}
      <section id="special-services" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-green-900/50 to-green-800/30" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <img
            src="https://images.pexels.com/photos/1267339/pexels-photo-1267339.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Packing boxes"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-4">
              <Star className="w-5 h-5" />
              GOING BEYOND
            </div>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-white mb-4">
              Special Services
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Tailored solutions for unique moving challenges — because no two moves are the same.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Home, title: 'Residential Moving', desc: 'Full-service home relocation — packing, loading, transport, and unpacking.' },
              { icon: Building2, title: 'Office Relocation', desc: 'Minimal downtime commercial moves with overnight or weekend scheduling.' },
              { icon: Box, title: 'Packing Services', desc: 'Professional packing with custom crating for fragile and high-value items.' },
              { icon: Music, title: 'Piano & Art Moving', desc: 'Specialized equipment and white-glove handling for pianos, antiques, and artwork.' },
              { icon: Car, title: 'Vehicle Transport', desc: 'Enclosed and open-air auto transport across all 50 states.' },
              { icon: Leaf, title: 'Eco-Friendly Moves', desc: 'Sustainable packing materials and carbon-offset shipping options.' }
            ].map((service, i) => (
              <div
                key={i}
                className="group bg-green-900 rounded-2xl p-7 border border-green-800 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 transition-all duration-500 hover:shadow-2xl hover:shadow-green-100/50 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-green-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <service.icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-['Poppins'] text-lg font-bold text-white group-hover:text-white mb-2 transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-green-200/50 transition-all hover:-translate-y-0.5"
            >
              Request a Custom Quote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Global network"
            className="w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-green-900"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-3">
              <Users className="w-5 h-5" />
              OUR NETWORK
            </div>
            <h2 className="font-['Poppins'] text-2xl font-bold text-white">
              Trusted by Leading Partners
            </h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {['FedEx', 'UPS', 'DHL', 'MAERSK', 'MSC', 'USPS', 'XPO'].map((partner) => (
              <div key={partner} className="bg-green-800 px-8 py-4 rounded-xl shadow-sm border border-green-700 hover:border-green-200 hover:shadow-md transition-all">
                <p className="font-bold text-white text-lg">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Happy customers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-green-950/90 to-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-4">
              <MessageSquare className="w-5 h-5" />
              TESTIMONIALS
            </div>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-white mb-4">
              Real Stories, Real Results
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Over 2,650 satisfied customers trust Post Express for their most important relocations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "Post Express made our cross-country relocation completely stress-free. The team was punctual, professional, and handled every piece of furniture with extreme care.",
                name: "Sarah Mitchell",
                role: "Homeowner, Austin TX",
                initials: "SM",
                gradient: "from-green-400 to-green-600"
              },
              {
                quote: "We relocated our entire 80-person office over a weekend. Post Express delivered on every promise — zero downtime Monday morning.",
                name: "James Thornton",
                role: "Operations Director, NovaTech",
                initials: "JT",
                gradient: "from-blue-400 to-blue-600"
              },
              {
                quote: "I needed my entire gallery collection moved and stored temporarily. The white-glove packing service was exceptional — every artwork arrived in perfect condition.",
                name: "Elena Rodriguez",
                role: "Art Gallery Owner",
                initials: "ER",
                gradient: "from-rose-400 to-rose-600"
              },
              {
                quote: "Their sea freight rates are among the most competitive I have found, and the customs support saved us countless hours. A true end-to-end logistics partner.",
                name: "David Park",
                role: "Import/Export Manager",
                initials: "DP",
                gradient: "from-emerald-400 to-emerald-600"
              },
              {
                quote: "Our family has moved 4 times with the military. Post Express was by far our best experience — fast, organized, and the crew treated our home like their own.",
                name: "Laura Stevens",
                role: "Military Family, Fort Hood",
                initials: "LS",
                gradient: "from-amber-400 to-amber-600"
              },
              {
                quote: "The warehousing and fulfillment integration was seamless. Real-time inventory tracking turned our logistics from a headache into a competitive advantage.",
                name: "Marcus Webb",
                role: "E-Commerce Entrepreneur",
                initials: "MW",
                gradient: "from-cyan-400 to-cyan-600"
              }
            ].map((testimonial, i) => (
              <div key={i} className="group bg-green-800 rounded-2xl p-7 shadow-sm border border-green-800 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                <Quote className="w-8 h-8 text-orange-200 mb-4" />
                <p className="text-white mb-6 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7869302/pexels-photo-7869302.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Business contract"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-green-900"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold mb-4">
              <Mail className="w-5 h-5" />
              GET IN TOUCH
            </div>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-white mb-4">
              Request a Free Quote
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Tell us about your move and we'll get back with a transparent, no-obligation quote within 2 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-4 p-5 bg-green-800 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Email Us</p>
                  <p className="text-white">info@postsxps.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-green-800 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Call Us</p>
                  <p className="text-white">+1 812 802 4356</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-green-800 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Working Hours</p>
                  <p className="text-white text-sm">Mon – Fri: 8:00 AM – 7:00 PM</p>
                  <p className="text-white text-sm">Sat: 9:00 AM – 4:00 PM</p>
                </div>
              </div>

            </div>

            {/* Quote Form */}
            <div className="lg:col-span-3 bg-green-800 rounded-2xl shadow-xl p-8 border border-green-700">
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        required
                        value={quoteForm.name}
                        onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="email"
                        required
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="tel"
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Service Type *</label>
                    <div className="relative">
                      <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <select
                        required
                        value={quoteForm.serviceType}
                        onChange={(e) => setQuoteForm({...quoteForm, serviceType: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-green-800 text-white"
                      >
                        <option value="">Select a service</option>
                        <option value="residential">Residential Moving</option>
                        <option value="office">Office Relocation</option>
                        <option value="air">Air Freight</option>
                        <option value="sea">Sea Cargo</option>
                        <option value="road">Road Freight</option>
                        <option value="warehouse">Warehousing</option>
                        <option value="vehicle">Vehicle Transport</option>
                        <option value="packing">Packing Services</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                    className="w-full px-4 py-3.5 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all text-white"
                    placeholder="Tell us about your move — origin, destination, approximate date, special items..."
                  />
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-3">
                    <X className="w-5 h-5 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-green-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Circle className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Quote Request
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-950/80 backdrop-blur-sm">
          <div className="bg-green-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-green-800 p-6 border-b border-green-800 flex items-center justify-between">
              <div>
                <h3 className="font-['Poppins'] text-2xl font-bold text-white">Get a Free Quote</h3>
                <p className="text-white/80 text-sm mt-1">Fill in the details below and we'll get back to you within 2 hours.</p>
              </div>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setSubmitSuccess(false);
                  setSubmitError(null);
                }}
                className="w-10 h-10 rounded-full bg-green-900 hover:bg-green-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-['Poppins'] text-xl font-bold text-white mb-2">Quote Request Sent!</h4>
                <p className="text-white/80 mb-6">We've received your quote request and will get back to you shortly.</p>
                <button
                  onClick={() => {
                    setShowQuoteModal(false);
                    setSubmitSuccess(false);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="p-6 space-y-5">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-3">
                    <X className="w-5 h-5 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        required
                        value={quoteForm.name}
                        onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="email"
                        required
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="tel"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Service Type *</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <select
                      required
                      value={quoteForm.serviceType}
                      onChange={(e) => setQuoteForm({...quoteForm, serviceType: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-green-800 text-white"
                    >
                      <option value="">Select a service</option>
                      <option value="residential">Residential Moving</option>
                      <option value="office">Office Relocation</option>
                      <option value="air">Air Freight</option>
                      <option value="sea">Sea Cargo</option>
                      <option value="road">Road Freight</option>
                      <option value="warehouse">Warehousing</option>
                      <option value="vehicle">Vehicle Transport</option>
                      <option value="packing">Packing Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                    className="w-full px-4 py-3 border border-green-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-white"
                    placeholder="Tell us about your move — origin, destination, approximate date, special items..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-green-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Circle className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Quote Request
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-green-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <a href="#" className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-['Poppins'] font-bold text-xl">Post Express</h3>
                  <p className="text-xs text-green-400 font-semibold">MOVING & STORAGE</p>
                </div>
              </a>
              <p className="text-white/60 text-sm leading-relaxed">
                Your trusted partner for residential, commercial, and international moving & storage since 2009.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2.5 text-white/60 text-sm">
                {['Home', 'Services', 'About Us', 'Special Services', 'Testimonials', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(' ', '')}`} className="hover:text-green-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Our Services</h4>
              <ul className="space-y-2.5 text-white/60 text-sm">
                {['Residential Moving', 'Office Relocation', 'Air Freight', 'Sea Cargo', 'Road Freight', 'Warehousing'].map((link) => (
                  <li key={link}>
                    <a href="#services" className="hover:text-green-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-500" />
                  +1 812 802 4356
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-green-500" />
                  info@postsxps.com
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-green-800">
                <p className="text-xs text-white/80 mb-2">Working Hours</p>
                <div className="space-y-1 text-sm text-white/60">
                  <p><span className="text-white/80">Mon – Fri</span> 8:00 AM – 7:00 PM</p>
                  <p><span className="text-white/80">Saturday</span> 9:00 AM – 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-green-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm">
              © {new Date().getFullYear()} Post Express Moving & Storage. All rights reserved.
            </p>
            <div className="flex gap-6 text-white/80 text-sm">
              <a href="#" className="hover:text-green-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-green-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-green-400 transition-colors">Sitemap</a>
              <a href="/admin" className="hover:text-green-400 transition-colors">Admin</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

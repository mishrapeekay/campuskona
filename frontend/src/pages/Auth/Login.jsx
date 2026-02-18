import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, loginStart, loginFailure, setTenantFeatures } from '../../store/slices/authSlice';
import apiClient from '../../api/client';
import { getMyFeatures } from '../../api/features';
import { getPublicSchools } from '../../api/tenants';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Search,
  School as SchoolIcon,
  ShieldCheck,
  ChevronRight,
  Phone,
  Calendar,
  ArrowLeft,
  ArrowLeftRight,
  ShieldEllipsis
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Card } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState('TENANT_SELECTION'); // 'TENANT_SELECTION', 'SCHOOL_LOGIN', 'PLATFORM_LOGIN', 'OTP_LOGIN'
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingSchools, setFetchingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Workstream G: OTP Login state
  const [otpMode, setOtpMode] = useState('phone'); // 'phone' | 'admission'
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [admissionDob, setAdmissionDob] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Load schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      setFetchingSchools(true);
      try {
        const res = await getPublicSchools();
        setSchools(res.data.results || []);
        setFilteredSchools(res.data.results || []);
      } catch (err) {
        console.error('Failed to load schools', err);
      } finally {
        setFetchingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  // Filter schools
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredSchools(schools.filter(s =>
        s.school_name.toLowerCase().includes(q) ||
        s.school_code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, schools]);

  const handleSelectTenant = (school) => {
    setSelectedSchool(school);
    localStorage.setItem('selectedTenant', school.subdomain);
    localStorage.setItem('tenant_subdomain', school.subdomain);
    setStep('SCHOOL_LOGIN');
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('selectedTenant');
    localStorage.removeItem('tenant_subdomain');
    setSelectedSchool(null);
    setStep('TENANT_SELECTION');
  };

  const handlePlatformAccess = () => {
    localStorage.removeItem('selectedTenant');
    localStorage.removeItem('tenant_subdomain');
    setStep('PLATFORM_LOGIN');
  };

  // Workstream G: OTP handlers
  const handleSendOTP = async () => {
    if (otpPhone.length < 10) { setOtpError('Please enter a valid 10-digit phone number'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await apiClient.post('/auth/otp/request/', { phone: otpPhone });
      setOtpSessionId(res.data.session_id);
      setOtpSent(true);
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'Failed to send OTP');
    } finally { setOtpLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) { setOtpError('Enter the 6-digit OTP'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await apiClient.post('/auth/otp/verify/', { phone: otpPhone, otp: otpCode, session_id: otpSessionId });
      dispatch(loginSuccess(res.data));
      window.location.href = '/dashboard';
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'Invalid OTP');
    } finally { setOtpLoading(false); }
  };

  const handleAdmissionLogin = async () => {
    if (!admissionNo.trim() || !admissionDob.trim()) { setOtpError('Admission number and date of birth are required'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await apiClient.post('/auth/admission-login/', { admission_number: admissionNo, date_of_birth: admissionDob });
      dispatch(loginSuccess(res.data));
      window.location.href = '/dashboard';
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'Invalid credentials');
    } finally { setOtpLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      // Platform login doesn't use X-Tenant-Subdomain
      // The interceptor will omit it if not in localStorage

      const response = await apiClient.post('/auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      dispatch(loginSuccess(response.data));

      if (step === 'SCHOOL_LOGIN') {
        try {
          const featuresRes = await getMyFeatures();
          dispatch(setTenantFeatures(featuresRes.data));
        } catch (featErr) {
          console.warn('Could not fetch tenant features:', featErr);
        }
      }

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      dispatch(loginFailure(err.response?.data?.message || err.response?.data?.detail || 'Login failed'));
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] p-4 font-sans text-slate-200">
      {/* Background blobs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'TENANT_SELECTION' && (
          <motion.div
            key="selection"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-lg z-10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-900/50 mb-6 transition-transform hover:scale-110">
                <SchoolIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">Find Your School</h1>
              <p className="text-slate-400 font-medium">Select a school node to begin</p>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, city or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {fetchingSchools ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Platform Nodes...</p>
                </div>
              ) : filteredSchools.length > 0 ? (
                filteredSchools.map((school, idx) => (
                  <motion.div
                    key={school.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelectTenant(school)}
                    className="group"
                  >
                    <Card className="bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 p-5 rounded-3xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-indigo-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-950/30 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                          <SchoolIcon className="h-7 w-7 text-indigo-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-white truncate group-hover:text-indigo-300 transition-colors">
                            {school.school_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 hover:bg-slate-800 text-[10px] font-bold py-0 h-5">
                              CODE: {school.school_code}
                            </Badge>
                            <span className="text-xs text-slate-500 font-medium truncate">
                              {school.city}, {school.state}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                          <Phone className="h-3.5 w-3.5 text-slate-600" />
                          {school.contact_phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          Session 2024-25
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-500 font-medium">
                  No schools found matching your search.
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handlePlatformAccess}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/50 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Platform Admin Access
              </button>
            </div>
          </motion.div>
        )}

        {step === 'SCHOOL_LOGIN' && (
          <motion.div
            key="school-login"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md z-10"
          >
            <div className="text-center mb-10">
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-900/30 mb-6">
                <SchoolIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-black text-white mb-2">{selectedSchool?.school_name}</h1>
              <p className="text-slate-400 font-medium tracking-tight">Welcome back! Sign in to continue.</p>
            </div>

            <Card className="bg-slate-900/60 border-slate-800 p-8 rounded-[40px] shadow-2xl">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-900/30 bg-red-950/20 p-4 mb-6 text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@school.com"
                      required
                      className="bg-slate-950/50 border-slate-800 h-14 rounded-2xl pl-12 text-white placeholder:text-slate-600 focus:ring-indigo-500/50"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                      <ShieldEllipsis className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="bg-slate-950/50 border-slate-800 h-14 rounded-2xl pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-indigo-500/50"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In'}
                </Button>
              </form>
            </Card>

            <div className="mt-10 flex flex-col items-center gap-6">
              {/* Workstream G: OTP Login alternative */}
              <button
                onClick={() => setStep('OTP_LOGIN')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 hover:bg-emerald-900/40 transition-all text-xs font-bold text-emerald-400 uppercase tracking-widest"
              >
                📱 Login with Phone OTP / Admission No.
              </button>

              <p className="text-xs font-medium text-slate-500">
                Don't have an account? <span className="text-slate-200 font-bold hover:underline cursor-pointer">Contact Admin</span>
              </p>

              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/50 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Change School
              </button>
            </div>
          </motion.div>
        )}

        {step === 'PLATFORM_LOGIN' && (
          <motion.div
            key="platform-login"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md z-10"
          >
            <div className="text-center mb-10">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-indigo-600 shadow-2xl shadow-indigo-900 mb-8 ring-8 ring-indigo-500/10">
                <ShieldCheck className="h-12 w-12 text-white" />
              </motion.div>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 mb-3">
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[3px]">Platform Access</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-2">Super Admin</h1>
              <p className="text-slate-400 font-medium text-sm">Platform-level access. No school required.</p>
            </div>

            <Card className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-800">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-900/30 bg-red-950/20 p-4 mb-6 text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Admin Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@platform.com"
                    required
                    className="bg-slate-950/50 border-slate-800 h-14 rounded-2xl px-6 text-white placeholder:text-slate-700 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="bg-slate-950/50 border-slate-800 h-14 rounded-2xl pl-6 pr-12 text-white placeholder:text-slate-700 focus:ring-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Access Platform'}
                </Button>
              </form>
            </Card>

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setStep('TENANT_SELECTION')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/50 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to School Login
              </button>
            </div>
          </motion.div>
        )}
        {/* Workstream G: OTP / Admission Login Step */}
        {step === 'OTP_LOGIN' && (
          <motion.div
            key="otp-login"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md z-10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-emerald-600 shadow-2xl shadow-emerald-900 mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Passwordless Login</h1>
              <p className="text-slate-400 text-sm">Login with Phone OTP or Admission Number</p>
            </div>

            <Card className="bg-slate-900 p-7 rounded-[36px] shadow-2xl border border-slate-800">
              {/* Mode tabs */}
              <div className="flex rounded-xl bg-slate-800 p-1 mb-6">
                {[['phone', '📞 Phone OTP'], ['admission', '🏫 Admission No.']].map(([m, label]) => (
                  <button key={m} onClick={() => { setOtpMode(m); setOtpError(''); setOtpSent(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${otpMode === m ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >{label}</button>
                ))}
              </div>

              {otpError && <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm text-center">{otpError}</div>}

              {otpMode === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input value={otpPhone} onChange={e => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number" disabled={otpSent}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {otpSent && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">6-Digit OTP</label>
                      <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter OTP" maxLength={6}
                        className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-2xl font-bold tracking-widest placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                  {!otpSent ? (
                    <button onClick={handleSendOTP} disabled={otpLoading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                    >{otpLoading ? 'Sending...' : 'Send OTP'}</button>
                  ) : (
                    <>
                      <button onClick={handleVerifyOTP} disabled={otpLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                      >{otpLoading ? 'Verifying...' : 'Verify & Login'}</button>
                      <button onClick={resendTimer === 0 ? handleSendOTP : undefined} disabled={resendTimer > 0}
                        className="w-full text-xs text-slate-400 hover:text-emerald-400 transition-all disabled:opacity-50 mt-1"
                      >{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}</button>
                    </>
                  )}
                </div>
              )}

              {otpMode === 'admission' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admission Number</label>
                    <input value={admissionNo} onChange={e => setAdmissionNo(e.target.value.toUpperCase())}
                      placeholder="e.g. ADM2024001"
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                    <input value={admissionDob} onChange={e => setAdmissionDob(e.target.value)}
                      type="date" placeholder="YYYY-MM-DD"
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button onClick={handleAdmissionLogin} disabled={otpLoading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                  >{otpLoading ? 'Logging in...' : 'Login'}</button>
                </div>
              )}
            </Card>

            <div className="mt-8 flex justify-center">
              <button onClick={() => setStep('SCHOOL_LOGIN')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-all text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Email Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Settings,
    User,
    Bell,
    ShieldCheck,
    Building,
    Palette,
    Key,
    Globe,
    Sun,
    Moon,
    Monitor,
    Save,
    Check,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { useTheme } from '../../contexts/ThemeContext';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import authAPI from '../../api/auth';
import apiClient from '../../api/client';
import showToast from '../../utils/toast';
import { updateUserInStore } from '../../store/slices/authSlice';

const SettingsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('profile');

    const settingsSections = [
        { id: 'profile', name: t('common.profile', 'Profile'), icon: User },
        { id: 'security', name: t('settings.security', 'Security'), icon: ShieldCheck },
        { id: 'appearance', name: t('settings.theme', 'Appearance'), icon: Palette },
        { id: 'regional', name: t('settings.language', 'Regional'), icon: Globe },
        { id: 'notifications', name: t('nav.notifications', 'Notifications'), icon: Bell },
        { id: 'general', name: t('settings.general', 'General'), icon: Settings },
        { id: 'school', name: t('nav.tenants', 'School Info'), icon: Building },
        { id: 'api', name: t('settings.api', 'API'), icon: Key },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'security': return <SecuritySettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'regional': return <RegionalSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'general': return <GeneralSettings />;
            case 'school': return <SchoolInfoSettings />;
            case 'api': return <APISettings />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title={t('settings.title', 'Settings')}
                    description={t('settings.description', 'Manage your account and application preferences')}
                />
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <Card>
                            <CardContent className="p-3">
                                <nav className="space-y-1">
                                    {settingsSections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveTab(section.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === section.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="flex-1 text-left">{section.name}</span>
                                                {activeTab === section.id && <Check className="w-4 h-4" />}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="col-span-12 lg:col-span-9">
                        <AnimatedPage key={activeTab}>
                            {renderContent()}
                        </AnimatedPage>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

// ─── Profile Settings ────────────────────────────────────────────────────────
const ProfileSettings = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        try {
            const response = await apiClient.patch(`/auth/users/${user.id}/`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
            });
            dispatch(updateUserInStore(response.data));
            showToast.success('Profile updated successfully');
        } catch (error) {
            const data = error.response?.data || {};
            const msg = data.detail || data.phone?.[0] || data.first_name?.[0] || 'Failed to update profile';
            showToast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('common.profile', 'My Profile')}</CardTitle>
                <CardDescription>{t('settings.profile_desc', 'Manage your personal information.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 pb-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/20">
                            {formData.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{formData.first_name} {formData.last_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user?.user_type?.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('common.first_name', 'First Name')}</label>
                            <input
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('common.last_name', 'Last Name')}</label>
                            <input
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">{t('common.email', 'Email')}</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">{t('common.phone', 'Phone')}</label>
                        <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                : <><Save className="w-4 h-4 mr-2" />{t('common.update_profile', 'Update Profile')}</>
                            }
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

// ─── Security Settings ───────────────────────────────────────────────────────
const SecuritySettings = () => {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [show, setShow] = useState({ old: false, new: false, confirm: false });
    const [form, setForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.old_password) errs.old_password = 'Required';
        if (!form.new_password) errs.new_password = 'Required';
        else if (form.new_password.length < 8) errs.new_password = 'Minimum 8 characters';
        if (form.new_password !== form.new_password_confirm) errs.new_password_confirm = 'Passwords do not match';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            await authAPI.changePassword(form);
            showToast.success('Password changed successfully');
            setForm({ old_password: '', new_password: '', new_password_confirm: '' });
        } catch (error) {
            const data = error.response?.data || {};
            if (data.old_password) setErrors(prev => ({ ...prev, old_password: data.old_password[0] || 'Incorrect password' }));
            else if (data.new_password) setErrors(prev => ({ ...prev, new_password: data.new_password[0] }));
            else showToast.error(data.detail || data.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ name, placeholder, showKey }) => (
        <div className="grid gap-1">
            <div className="relative">
                <input
                    type={show[showKey] ? 'text' : 'password'}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors[name] ? 'border-destructive' : 'border-input'}`}
                />
                <button
                    type="button"
                    onClick={() => setShow(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.security', 'Security Settings')}</CardTitle>
                <CardDescription>{t('settings.security_desc', 'Ensure your account is secure.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-semibold mb-4">{t('settings.change_password', 'Change Password')}</h4>
                    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
                        <Field name="old_password" placeholder={t('settings.current_password', 'Current Password')} showKey="old" />
                        <Field name="new_password" placeholder={t('settings.new_password', 'New Password')} showKey="new" />
                        <Field name="new_password_confirm" placeholder={t('settings.confirm_password', 'Confirm New Password')} showKey="confirm" />
                        <Button type="submit" disabled={saving}>
                            {saving
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                                : <><ShieldCheck className="w-4 h-4 mr-2" />{t('settings.update_password', 'Update Password')}</>
                            }
                        </Button>
                    </form>
                </div>
                <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold">{t('settings.two_factor', 'Two-Factor Authentication')}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{t('settings.two_factor_desc', 'Add an extra layer of security to your account.')}</p>
                        </div>
                        <Button variant="outline" disabled title="Coming soon">{t('settings.enable_2fa', 'Enable 2FA')}</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Appearance Settings ─────────────────────────────────────────────────────
const AppearanceSettings = () => {
    const { t } = useTranslation();
    const { theme, setTheme, effectiveTheme } = useTheme();

    const themes = [
        { value: 'light', label: t('settings.light', 'Light'), icon: Sun },
        { value: 'dark', label: t('settings.dark', 'Dark'), icon: Moon },
        { value: 'auto', label: t('settings.auto', 'Auto'), icon: Monitor },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.theme', 'Appearance')}</CardTitle>
                <CardDescription>{t('settings.appearance_desc', 'Customize the look and feel.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-3">{t('settings.theme_label', 'Theme')}</label>
                    <div className="grid grid-cols-3 gap-4">
                        {themes.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={`px-4 py-4 border-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${theme === value
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border hover:border-primary/50 text-muted-foreground'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {t('settings.current_theme', 'Current theme')}: <span className="font-medium text-foreground capitalize">{effectiveTheme}</span>
                        {theme === 'auto' && ` (${t('settings.system_detected', 'Auto-detected from system')})`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Regional Settings ───────────────────────────────────────────────────────
const RegionalSettings = () => {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (e) => {
        const langCode = e.target.value;
        i18n.changeLanguage(langCode);
        localStorage.setItem('i18nextLng', langCode);
        showToast.success('Language updated');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.language', 'Regional Settings')}</CardTitle>
                <CardDescription>{t('settings.regional_desc', 'Localization and formatting preferences.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">{t('common.language', 'Language')}</label>
                    <select
                        value={i18n.language}
                        onChange={handleLanguageChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label} ({lang.native})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">{t('settings.timezone', 'Timezone')}</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                        <option>Europe/London (GMT)</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">{t('settings.date_format', 'Date Format')}</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                    </select>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Notification Settings ───────────────────────────────────────────────────
const NotificationSettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.notifications', 'Notification Preferences')}</CardTitle>
                <CardDescription>{t('settings.notifications_desc', 'Choose how you want to be notified.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {[
                    { key: 'settings.email_notifications', label: 'Email Notifications', on: true },
                    { key: 'settings.sms_notifications', label: 'SMS Notifications', on: false },
                    { key: 'settings.push_notifications', label: 'Push Notifications', on: true },
                    { key: 'settings.weekly_digest', label: 'Weekly Digest', on: false },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm font-medium">{t(item.key, item.label)}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.on} />
                            <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">Notification delivery is managed by your administrator.</p>
            </CardContent>
        </Card>
    );
};

// ─── General Settings (admin info) ───────────────────────────────────────────
const GeneralSettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.general', 'General Settings')}</CardTitle>
                <CardDescription>{t('settings.general_desc', 'Basic school information and preferences.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        General school settings are managed by your system administrator via the Admin panel.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── School Info Settings ─────────────────────────────────────────────────────
const SchoolInfoSettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('nav.tenants', 'School Information')}</CardTitle>
                <CardDescription>{t('settings.school_desc', "Update your institution's details.")}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        School branding and information is managed by your system administrator.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── API Settings ─────────────────────────────────────────────────────────────
const APISettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.api', 'API & Integrations')}</CardTitle>
                <CardDescription>{t('settings.api_desc', 'Manage keys and connect third-party services.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Warning:</strong> {t('settings.api_warning', 'Keep your API keys secure. Do not share them publicly.')}
                    </p>
                </div>
                <div className="space-y-3">
                    {['Google Classroom', 'Zoom', 'Razorpay'].map(name => (
                        <div key={name} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                            <span className="text-sm font-medium">{name}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Coming soon</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default SettingsPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Upload,
    Check,
    AlertCircle
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { SUPPORTED_LANGUAGES } from '../../i18n';

const SettingsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const settingsSections = [
        {
            id: 'general',
            name: t('settings.general'),
            icon: Settings,
            description: t('settings.general_desc', 'Basic school information and preferences'),
        },
        {
            id: 'profile',
            name: t('common.profile'),
            icon: User,
            description: t('settings.profile_desc', 'Personal information and account settings'),
        },
        {
            id: 'notifications',
            name: t('nav.notifications', 'Notifications'),
            icon: Bell,
            description: t('settings.notifications_desc', 'Manage notification preferences'),
        },
        {
            id: 'security',
            name: t('settings.security'),
            icon: ShieldCheck,
            description: t('settings.security_desc', 'Password, 2FA, and security settings'),
        },
        {
            id: 'school',
            name: t('nav.tenants', 'School Info'),
            icon: Building,
            description: t('settings.school_desc', 'School details, logo, and branding'),
        },
        {
            id: 'appearance',
            name: t('settings.theme', 'Appearance'),
            icon: Palette,
            description: t('settings.appearance_desc', 'Theme, colors, and display preferences'),
        },
        {
            id: 'api',
            name: t('settings.api', 'API & Integrations'),
            icon: Key,
            description: t('settings.api_desc', 'API keys and third-party integrations'),
        },
        {
            id: 'regional',
            name: t('settings.language', 'Regional'),
            icon: Globe,
            description: t('settings.regional_desc', 'Language, timezone, and regional settings'),
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'profile': return <ProfileSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'security': return <SecuritySettings />;
            case 'school': return <SchoolInfoSettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'api': return <APISettings />;
            case 'regional': return <RegionalSettings />;
            default: return <GeneralSettings />;
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

// Settings Components uses Tailwind + Primitives
const GeneralSettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.general', 'General Settings')}</CardTitle>
                <CardDescription>{t('settings.general_desc', 'Configure basic parameters for the application.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('common.school_name', 'School Name')}</label>
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={t('common.enter_school_name', 'Enter school name')}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('common.academic_year', 'Academic Year')}</label>
                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option>2025-2026</option>
                            <option>2024-2025</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="maintenance" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="maintenance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t('settings.maintenance_mode', 'Enable maintenance mode')}
                        </label>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button>
                        <Save className="w-4 h-4 mr-2" />
                        {t('common.save_changes', 'Save Changes')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ProfileSettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('common.profile', 'My Profile')}</CardTitle>
                <CardDescription>{t('settings.profile_desc', 'Manage your personal information.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                        <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        {t('common.change_photo', 'Change Photo')}
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">{t('common.first_name', 'First Name')}</label>
                        <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">{t('common.last_name', 'Last Name')}</label>
                        <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('common.email', 'Email')}</label>
                    <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('common.phone', 'Phone')}</label>
                    <input type="tel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="flex justify-end">
                    <Button>
                        <Save className="w-4 h-4 mr-2" />
                        {t('common.update_profile', 'Update Profile')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

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
                    { key: 'settings.email_notifications', label: 'Email Notifications' },
                    { key: 'settings.sms_notifications', label: 'SMS Notifications' },
                    { key: 'settings.push_notifications', label: 'Push Notifications' },
                    { key: 'settings.weekly_digest', label: 'Weekly Digest' }
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-foreground">{t(item.key, item.label)}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                ))}
                <div className="flex justify-end pt-4">
                    <Button>
                        <Save className="w-4 h-4 mr-2" />
                        {t('common.save_preferences', 'Save Preferences')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const SecuritySettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.security', 'Security Settings')}</CardTitle>
                <CardDescription>{t('settings.security_desc', 'Ensure your account is secure.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-4">{t('settings.change_password', 'Change Password')}</h4>
                    <div className="space-y-4 max-w-md">
                        <input type="password" placeholder={t('settings.current_password', 'Current Password')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        <input type="password" placeholder={t('settings.new_password', 'New Password')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        <input type="password" placeholder={t('settings.confirm_password', 'Confirm New Password')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        <Button>{t('settings.update_password', 'Update Password')}</Button>
                    </div>
                </div>
                <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">{t('settings.two_factor', 'Two-Factor Authentication')}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{t('settings.two_factor_desc', 'Add an extra layer of security to your account.')}</p>
                        </div>
                        <Button variant="outline">{t('settings.enable_2fa', 'Enable 2FA')}</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const SchoolInfoSettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('nav.tenants', 'School Information')}</CardTitle>
                <CardDescription>{t('settings.school_desc', "Update your institution's details.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('common.school_logo', 'School Logo')}</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
                            <Building className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            {t('common.upload_logo', 'Upload Logo')}
                        </Button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('common.address', 'Address')}</label>
                    <textarea rows="3" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">{t('common.phone', 'Contact Number')}</label>
                        <input type="tel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">{t('common.email', 'Email')}</label>
                        <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button>
                        <Save className="w-4 h-4 mr-2" />
                        {t('common.save_school_info', 'Save School Info')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

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
                <CardDescription>{t('settings.appearance_desc', 'Customize the look and feel of the application.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-3">{t('settings.theme_label', 'Theme')}</label>
                    <div className="grid grid-cols-3 gap-4">
                        {themes.map((themeOption) => {
                            const Icon = themeOption.icon;
                            return (
                                <button
                                    key={themeOption.value}
                                    onClick={() => setTheme(themeOption.value)}
                                    className={`px-4 py-4 border-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${theme === themeOption.value
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border hover:border-primary/50 text-muted-foreground'
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span>{themeOption.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {t('settings.current_theme', 'Current theme')}: <span className="font-medium text-foreground capitalize">{effectiveTheme}</span>
                        {theme === 'auto' && ` (${t('settings.system_detected', 'Auto-detected from system')})`}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('settings.primary_color', 'Primary Color')}</label>
                    <div className="flex items-center gap-3">
                        <input type="color" defaultValue="#3B82F6" className="h-10 w-20 rounded border border-input bg-background cursor-pointer p-1" />
                        <span className="text-xs text-muted-foreground">{t('settings.color_limit_note', 'Note: Color customization is currently limited.')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const APISettings = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.api', 'API & Integrations')}</CardTitle>
                <CardDescription>{t('settings.api_desc', 'Manage keys and connect third-party services.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>{t('common.warning', 'Warning')}:</strong> {t('settings.api_warning', 'Keep your API keys secure. Do not share them publicly.')}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('settings.api_key', 'API Key')}</label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value="sk_live_••••••••••••••••"
                            readOnly
                            className="flex-1 h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                        />
                        <Button variant="outline">{t('common.show', 'Show')}</Button>
                        <Button variant="outline">{t('common.regenerate', 'Regenerate')}</Button>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">{t('settings.connected_integrations', 'Connected Integrations')}</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                            <span className="text-sm font-medium">{t('settings.google_classroom', 'Google Classroom')}</span>
                            <Button variant="ghost" className="text-primary hover:text-primary/80 h-auto p-0 px-2 font-medium">{t('common.configure', 'Configure')}</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                            <span className="text-sm font-medium">{t('settings.zoom', 'Zoom')}</span>
                            <Button variant="ghost" className="text-primary hover:text-primary/80 h-auto p-0 px-2 font-medium">{t('common.configure', 'Configure')}</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const RegionalSettings = () => {
    const { t, i18n } = useTranslation();
    const handleLanguageChange = (e) => {
        const langCode = e.target.value;
        i18n.changeLanguage(langCode);
        localStorage.setItem('i18nextLng', langCode);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.language', 'Regional Settings')}</CardTitle>
                <CardDescription>{t('settings.regional_desc', 'Localization and formatting preferences.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('common.language', 'Language')}</label>
                    <select
                        value={i18n.language}
                        onChange={handleLanguageChange}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label} ({lang.native})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('settings.timezone', 'Timezone')}</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                        <option>Europe/London (GMT)</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('settings.date_format', 'Date Format')}</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">{t('settings.currency', 'Currency')}</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <Button>
                        <Save className="w-4 h-4 mr-2" />
                        {t('common.save', 'Save')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default SettingsPage;

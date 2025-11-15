import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getLMSSettings, updateLMSSettings, getZoomSettings, updateZoomSettings } from '../services/settingsService';
import { Settings as SettingsIcon, Save, Mail, Sidebar, UserPlus, CreditCard, FileText, Search, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { userData } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'LMS',
    siteDescription: 'Learning Management System',
    enableSignups: true,
    enableEmailVerification: true,
    enablePayments: false,
    currency: 'USD',
    enableCertificates: true,
    enableBadges: true,
    enableDiscussions: true,
    enableAnnouncements: true,
    enableLiveClasses: true,
    enableQuizzes: true,
    enableAssignments: true,
    enablePrograms: true,
    enableEvaluations: true,
    enableSkills: true,
    enableCoupons: false,
    defaultRole: 'student',
    maxFileUploadSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    emailNotifications: true,
    pushNotifications: false,
    maintenanceMode: false,
    maintenanceMessage: 'The system is under maintenance. Please check back later.',
  });
  const [zoomSettings, setZoomSettings] = useState({
    apiKey: '',
    apiSecret: '',
    enabled: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [lmsResult, zoomResult] = await Promise.all([
          getLMSSettings(),
          getZoomSettings(),
        ]);
        if (lmsResult.success) {
          setSettings(lmsResult.data);
        }
        if (zoomResult.success) {
          setZoomSettings(zoomResult.data);
        }
      } catch (error) {
        console.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (userData?.role !== 'admin') {
      toast.error('Only admins can update settings');
      return;
    }

    setSaving(true);
    try {
      const [lmsResult, zoomResult] = await Promise.all([
        updateLMSSettings(settings),
        updateZoomSettings(zoomSettings),
      ]);
      if (lmsResult.success && zoomResult.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save some settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (userData?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You don't have permission to access settings.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'lms', label: 'LMS Settings', icon: SettingsIcon },
    { id: 'zoom', label: 'Zoom Settings', icon: Video },
    { id: 'features', label: 'Features', icon: Sidebar },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'seo', label: 'SEO', icon: Search },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="card p-0 sm:p-6">
        {/* Mobile: Scrollable tabs */}
        <div className="overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-4 sm:pt-6">
          {/* LMS Settings */}
          {activeTab === 'lms' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name *</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  className="input"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Role for New Users</label>
                <select
                  value={settings.defaultRole}
                  onChange={(e) => updateSetting('defaultRole', e.target.value)}
                  className="input"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileUploadSize}
                  onChange={(e) => updateSetting('maxFileUploadSize', parseInt(e.target.value))}
                  className="input"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types (comma-separated)</label>
                <input
                  type="text"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) => updateSetting('allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                  className="input"
                  placeholder="pdf, doc, docx, jpg, png"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {settings.maintenanceMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                  <textarea
                    value={settings.maintenanceMessage}
                    onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                    className="input"
                    rows="3"
                  />
                </div>
              )}
            </div>
          )}

          {/* Zoom Settings */}
          {activeTab === 'zoom' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Zoom Integration</label>
                  <p className="text-sm text-gray-500">Enable Zoom for live classes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zoomSettings.enabled}
                    onChange={(e) => setZoomSettings({ ...zoomSettings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {zoomSettings.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zoom API Key</label>
                    <input
                      type="text"
                      value={zoomSettings.apiKey}
                      onChange={(e) => setZoomSettings({ ...zoomSettings, apiKey: e.target.value })}
                      className="input"
                      placeholder="Your Zoom API Key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zoom API Secret</label>
                    <input
                      type="password"
                      value={zoomSettings.apiSecret}
                      onChange={(e) => setZoomSettings({ ...zoomSettings, apiSecret: e.target.value })}
                      className="input"
                      placeholder="Your Zoom API Secret"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="space-y-3 sm:space-y-4">
              {[
                { key: 'enableSignups', label: 'Enable User Signups' },
                { key: 'enableEmailVerification', label: 'Enable Email Verification' },
                { key: 'enablePayments', label: 'Enable Payments' },
                { key: 'enableCertificates', label: 'Enable Certificates' },
                { key: 'enableBadges', label: 'Enable Badges' },
                { key: 'enableDiscussions', label: 'Enable Discussions' },
                { key: 'enableAnnouncements', label: 'Enable Announcements' },
                { key: 'enableLiveClasses', label: 'Enable Live Classes' },
                { key: 'enableQuizzes', label: 'Enable Quizzes' },
                { key: 'enableAssignments', label: 'Enable Assignments' },
                { key: 'enablePrograms', label: 'Enable Programs' },
                { key: 'enableEvaluations', label: 'Enable Evaluations' },
                { key: 'enableSkills', label: 'Enable Skills' },
                { key: 'enableCoupons', label: 'Enable Coupons' },
                { key: 'emailNotifications', label: 'Email Notifications' },
                { key: 'pushNotifications', label: 'Push Notifications' },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 py-2 sm:py-0">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => updateSetting(key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Payments</label>
                  <p className="text-sm text-gray-500">Enable payment processing for courses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enablePayments}
                    onChange={(e) => updateSetting('enablePayments', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {settings.enablePayments && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="input"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Send email notifications to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-sm text-gray-500">Enable browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={settings.metaDescription || ''}
                  onChange={(e) => updateSetting('metaDescription', e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Default meta description for SEO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Image URL</label>
                <input
                  type="url"
                  value={settings.metaImage || ''}
                  onChange={(e) => updateSetting('metaImage', e.target.value)}
                  className="input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input
                  type="text"
                  value={settings.metaKeywords || ''}
                  onChange={(e) => updateSetting('metaKeywords', e.target.value)}
                  className="input"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;


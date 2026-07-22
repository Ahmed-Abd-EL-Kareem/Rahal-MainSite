'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Camera, AlertCircle, CheckCircle, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import Button from '@/components/ui/Button';

export default function AccountSettingsPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState<string | null>(null);
  // Form states
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [currency, setCurrency] = useState('USD');
  const [avatarUrl, setAvatarUrl] = useState('');
  // Image Upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  // Profile Save states
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Change Password Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Extract userId on mount
  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)auth_token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[2] : null;
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        setUserId(decoded.id || decoded._id || decoded.sub || null);
      } catch (err) {
        console.error('Error decoding token', err);
      }
    }
  }, []);

  // Fetch current user details
  const { data: userData } = useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const currentUser = userData?.data?.user;

  // Sync form states with database user values
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setLanguage(currentUser.preferredLanguage || 'en');
      setCurrency(currentUser.preferredCurrency || 'USD');
      setAvatarUrl(currentUser.image || '');
    }
  }, [currentUser]);

  // Handle Image Upload to Cloudinary
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'angular_upload');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/ds4qifmha/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload response not OK');
      }

      const data = await res.json();

      if (data.secure_url) {
        setAvatarUrl(data.secure_url);
      } else {
        setImageUploadError(locale === 'ar' ? 'فشل رفع الصورة.' : 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setImageUploadError(locale === 'ar' ? 'حدث خطأ أثناء رفع الصورة.' : 'Error uploading image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (currentUser) {
      setName(currentUser.name || '');
      setLanguage(currentUser.preferredLanguage || 'en');
      setCurrency(currentUser.preferredCurrency || 'USD');
      setAvatarUrl(currentUser.image || '');
      setErrorMsg(null);
      setSuccessMsg(null);
      setImageUploadError(null);
    }
  };

  // Handle Save Profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!name.trim()) {
      setErrorMsg(t('errors.missingFields'));
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await usersApi.updateUser(userId, {
        name,
        preferredLanguage: language,
        preferredCurrency: currency,
        image: avatarUrl || undefined,
      });

      if (response && response.status === 'success') {
        setSuccessMsg(t('saved'));
        
        // Invalidate react-query cache for user
        queryClient.invalidateQueries({ queryKey: ['currentUser', userId] });

        // Handle language change on the frontend if it's different from the current URL locale
        if (language !== locale) {
          // Set next-intl cookie and reload to switch languages
          document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000`;
          // Reload page
          window.location.reload();
        }
      } else {
        setErrorMsg(t('errorSaving'));
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || t('errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Change Password Form Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('passwordsDoNotMatch'));
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await usersApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (response && response.status === 'success') {
        setPasswordSuccess(t('passwordChangedSuccess'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        
        // Auto-close modal after success message
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(locale === 'ar' ? 'فشل تغيير كلمة المرور.' : 'Failed to change password.');
      }
    } catch (err: any) {
      console.error('Change password error:', err);
      // Handle incorrect current password (typically 401)
      if (err.statusCode === 401) {
        setPasswordError(t('currentPasswordIncorrect'));
      } else {
        setPasswordError(err.message || (locale === 'ar' ? 'فشل تغيير كلمة المرور.' : 'Failed to change password.'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const userInitial = name ? name.charAt(0).toUpperCase() : 'U';
  const isRtl = locale === 'ar';

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 md:p-12 shadow-md relative">
      <header className="mb-10 text-left">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-on-surface mb-2">
          {t('profileTitle')}
        </h1>
        <p className="font-body text-sm text-on-surface-variant opacity-70">
          {t('profileSubtitle')}
        </p>
      </header>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3 text-success">
          <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span className="text-sm font-semibold font-body">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span className="text-sm font-semibold font-body">{errorMsg}</span>
        </div>
      )}

      {imageUploadError && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span className="text-sm font-semibold font-body">{imageUploadError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-12 text-left">
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-outline-variant/10 pb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-high shadow-md relative">
              {avatarUrl ? (
                <img
                  className="w-full h-full object-cover"
                  src={avatarUrl}
                  alt={name}
                />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-4xl font-bold font-display">
                  {userInitial}
                </div>
              )}

              {/* Uploading Image Overlay Spinner */}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <label
              className={`absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full cursor-pointer hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-md ${
                isUploadingImage ? 'pointer-events-none opacity-55' : ''
              }`}
              htmlFor="avatar-upload"
            >
              <Camera size={18} />
              <input
                className="hidden"
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
              />
            </label>
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-display font-semibold text-lg text-on-surface">
              {t('photoTitle')}
            </h3>
            <p className="font-body text-xs text-on-surface-variant">
              {t('photoDesc')}
            </p>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-error font-bold text-xs hover:underline mt-2 bg-transparent border-none p-0 cursor-pointer block mx-auto md:mx-0"
              >
                {t('removePhoto')}
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('fullName')}
            </label>
            <input
              className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Read-only Email */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('emailAddress')}
            </label>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="font-body text-sm text-on-surface-variant opacity-60">
                {currentUser.email}
              </span>
              <Lock className="text-outline-variant" size={16} />
            </div>
          </div>
        </div>

        {/* Regional Preferences */}
        <div className="pt-8 border-t border-outline-variant/10">
          <h3 className="font-display font-semibold text-xl text-on-surface mb-6">
            {t('regionalSettings')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Language Selection */}
            <div>
              <span className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-4">
                {t('preferredLanguage')}
              </span>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                    className="w-4 h-4 text-primary border-outline focus:ring-primary cursor-pointer"
                  />
                  <span className="font-body text-sm group-hover:text-primary transition-colors">
                    English (Global)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="language"
                    value="ar"
                    checked={language === 'ar'}
                    onChange={() => setLanguage('ar')}
                    className="w-4 h-4 text-primary border-outline focus:ring-primary cursor-pointer"
                  />
                  <span className="font-body text-sm group-hover:text-primary transition-colors">
                    العربية (Arabic)
                  </span>
                </label>
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <span className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-4">
                {t('currency')}
              </span>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="currency"
                    value="USD"
                    checked={currency === 'USD'}
                    onChange={() => setCurrency('USD')}
                    className="w-4 h-4 text-primary border-outline focus:ring-primary cursor-pointer"
                  />
                  <span className="font-body text-sm group-hover:text-primary transition-colors">
                    USD ($) - US Dollar
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="currency"
                    value="EGP"
                    checked={currency === 'EGP'}
                    onChange={() => setCurrency('EGP')}
                    className="w-4 h-4 text-primary border-outline focus:ring-primary cursor-pointer"
                  />
                  <span className="font-body text-sm group-hover:text-primary transition-colors">
                    EGP (EL) - Egyptian Pound
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Actions Container */}
        <div className="pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Security Action (Change Password) */}
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPasswordModalOpen(true)}
              className="rounded-xl border-secondary text-secondary hover:bg-secondary/5 font-semibold text-sm flex items-center gap-2"
            >
              <Lock size={16} />
              <span>{t('changePasswordBtn')}</span>
            </Button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-xl font-body text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || isUploadingImage}
              className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold font-body text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isSaving ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </div>
      </form>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={() => {
              if (!isChangingPassword) {
                setIsPasswordModalOpen(false);
                setPasswordError(null);
                setPasswordSuccess(null);
              }
            }} 
          />
          
          <div className="relative bg-surface border border-outline-variant/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl z-10 animate-fade-in text-on-surface">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              disabled={isChangingPassword}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant/80 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <header className="mb-6 text-left">
              <h2 className="font-display font-semibold text-xl text-on-surface mb-1.5">
                {t('changePasswordTitle')}
              </h2>
              <p className="font-body text-xs text-on-surface-variant opacity-70">
                {t('changePasswordDesc')}
              </p>
            </header>

            {/* Alert Notifications */}
            {passwordSuccess && (
              <div className="mb-5 p-3 bg-success/15 border border-success/20 rounded-xl flex items-start gap-2.5 text-success">
                <CheckCircle className="flex-shrink-0 mt-0.5" size={16} />
                <span className="text-xs font-semibold font-body">{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 p-3 bg-error/15 border border-error/20 rounded-xl flex items-start gap-2.5 text-error">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                <span className="text-xs font-semibold font-body">{passwordError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-4 pr-11 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors cursor-pointer ${
                      isRtl ? 'left-4' : 'right-4'
                    }`}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-4 pr-11 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors cursor-pointer ${
                      isRtl ? 'left-4' : 'right-4'
                    }`}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-4 pr-11 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors cursor-pointer ${
                      isRtl ? 'left-4' : 'right-4'
                    }`}
                  >
                    {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isChangingPassword}
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-on-surface-variant hover:bg-surface-container-low"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isChangingPassword}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>{t('savingPassword')}</span>
                    </>
                  ) : (
                    <span>{t('saveChanges')}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

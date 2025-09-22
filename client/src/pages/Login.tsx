import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { X, Eye, EyeOff, Mail, Phone } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://krishik-agri-business-hub-backend.onrender.com/api';

const Login: React.FC = () => {
    const [form, setForm] = useState({ emailOrPhone: '', password: '' });
    const [error, setError] = useState('');
    const [inputType, setInputType] = useState<'email' | 'phone'>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password reset states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordForm, setForgotPasswordForm] = useState({ emailOrPhone: '' });
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

    // Password reset modal states
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetForm, setResetForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetUserId, setResetUserId] = useState('');

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // Auto-detect input type
        if (name === 'emailOrPhone') {
            const isProductionAPI = API.includes('onrender.com') || API.includes('herokuapp.com');

            if (value.includes('@')) {
                setInputType('email');
            } else if (!isProductionAPI && /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
                setInputType('phone');
            } else if (isProductionAPI) {
                // Force email type for production
                setInputType('email');
            }
        }
    };

    const validateInput = (value: string) => {
        const isEmail = value.includes('@');
        const isPhone = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''));
        const isProductionAPI = API.includes('onrender.com') || API.includes('herokuapp.com');

        if (isProductionAPI && !isEmail && value.length > 0) {
            setError('Please enter a valid email address');
            return false;
        } else if (!isProductionAPI && !isEmail && !isPhone && value.length > 0) {
            setError('Please enter a valid email address or phone number');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!validateInput(form.emailOrPhone)) {
            setLoading(false);
            return;
        }

        try {
            // Determine if input is email or phone
            const isEmail = form.emailOrPhone.includes('@');

            // Check if we're using production API (backward compatibility)
            const isProductionAPI = API.includes('onrender.com') || API.includes('herokuapp.com');

            let requestBody;
            if (isProductionAPI && isEmail) {
                // Use old API format for production with email
                requestBody = {
                    email: form.emailOrPhone,
                    password: form.password
                };
            } else {
                // Use new API format for local development or phone numbers
                requestBody = {
                    emailOrPhone: form.emailOrPhone,
                    password: form.password
                };
            }

            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login failed');
                setLoading(false);
                return;
            }

            // Check if password reset is required (only available on local backend)
            if (data.requiresPasswordReset) {
                setResetUserId(data.userId);
                setShowResetModal(true);
                setLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/profile');
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle forgot password
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotPasswordError('');
        setForgotPasswordSuccess('');
        setForgotPasswordLoading(true);

        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrPhone: forgotPasswordForm.emailOrPhone }),
            });

            // Handle specific error cases
            if (res.status === 404) {
                // Check if it's a 404 from missing endpoint (production) or user not found
                const isProductionAPI = API.includes('onrender.com') || API.includes('herokuapp.com');
                if (isProductionAPI) {
                    setForgotPasswordError('Password reset feature is not yet deployed to production. Please contact support at support@krishik.com for password reset assistance.');
                } else {
                    setForgotPasswordError('User not found. Please check your email or phone number.');
                }
                return;
            }

            if (res.status === 503) {
                setForgotPasswordError('SMS service is temporarily unavailable. Please contact support for password reset assistance.');
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setForgotPasswordError(data.message || 'Failed to send reset code');
                return;
            }

            setForgotPasswordSuccess(data.message);
            setResetUserId(data.userId);
            setShowForgotPassword(false);
            setShowResetModal(true);
        } catch (err) {
            setForgotPasswordError('Server error. Please try again later.');
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    // Handle password reset
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError('');
        setResetSuccess('');

        if (resetForm.newPassword !== resetForm.confirmPassword) {
            setResetError('Passwords do not match');
            return;
        }

        if (resetForm.newPassword.length < 6) {
            setResetError('Password must be at least 6 characters long');
            return;
        }

        setResetLoading(true);

        try {
            const res = await fetch(`${API}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: resetUserId,
                    otp: resetForm.otp,
                    newPassword: resetForm.newPassword
                }),
            });

            // Handle specific error cases
            if (res.status === 404) {
                // Check if it's a 404 from missing endpoint (production) or invalid OTP
                const isProductionAPI = API.includes('onrender.com') || API.includes('herokuapp.com');
                if (isProductionAPI) {
                    setResetError('Password reset feature is not yet deployed to production. Please contact support at support@krishik.com for password reset assistance.');
                } else {
                    setResetError('Invalid or expired OTP. Please request a new password reset.');
                }
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setResetError(data.message || 'Failed to reset password');
                return;
            }

            setResetSuccess('Password reset successfully! You can now login with your new password.');
            setShowResetModal(false);
            setResetForm({ otp: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setResetError('Server error. Please try again later.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">
                        Email or Phone Number
                    </label>
                    <input
                        type={inputType === 'email' ? 'email' : 'tel'}
                        name="emailOrPhone"
                        value={form.emailOrPhone}
                        onChange={handleChange}
                        placeholder={inputType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {API.includes('onrender.com') || API.includes('herokuapp.com')
                            ? "Login with your email address (phone login coming soon)"
                            : "You can login with either your email address or phone number"
                        }
                    </p>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded transition ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-green-600 hover:text-green-700 text-sm underline"
                    >
                        Forgot Password?
                    </button>
                </div>
            </form>

            {/* Forgot Password Modal */}
            <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Dialog.Title className="text-lg font-semibold">Forgot Password</Dialog.Title>
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Password Reset:</strong> Enter your email or phone number to receive a 6-digit verification code.
                                The code will be sent to both your email and phone number.
                            </p>
                            {API.includes('onrender.com') || API.includes('herokuapp.com') ? (
                                <p className="text-sm text-orange-700 mt-2">
                                    <strong>Note:</strong> This feature is currently in development. For immediate assistance, please contact support.
                                </p>
                            ) : null}
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block mb-1 font-medium">Email or Phone Number</label>
                                <input
                                    type="text"
                                    value={forgotPasswordForm.emailOrPhone}
                                    onChange={(e) => setForgotPasswordForm({ emailOrPhone: e.target.value })}
                                    placeholder="Enter your email or phone number"
                                    required
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {forgotPasswordError && <p className="text-red-500 text-sm">{forgotPasswordError}</p>}
                            {forgotPasswordSuccess && <p className="text-green-500 text-sm">{forgotPasswordSuccess}</p>}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotPasswordLoading}
                                    className={`flex-1 px-4 py-2 rounded transition ${forgotPasswordLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        } text-white`}
                                >
                                    {forgotPasswordLoading ? 'Sending...' : 'Send Code'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Password Reset Modal */}
            <Dialog open={showResetModal} onClose={() => setShowResetModal(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Dialog.Title className="text-lg font-semibold">Reset Password</Dialog.Title>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                                <Mail size={16} />
                                <Phone size={16} />
                                <span className="text-sm">OTP sent to your email and phone</span>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div>
                                <label className="block mb-1 font-medium">Enter OTP</label>
                                <input
                                    type="text"
                                    value={resetForm.otp}
                                    onChange={(e) => setResetForm(prev => ({ ...prev, otp: e.target.value }))}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    required
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">New Password</label>
                                <input
                                    type="password"
                                    value={resetForm.newPassword}
                                    onChange={(e) => setResetForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="Enter new password"
                                    required
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    value={resetForm.confirmPassword}
                                    onChange={(e) => setResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirm new password"
                                    required
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
                            {resetSuccess && <p className="text-green-500 text-sm">{resetSuccess}</p>}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className={`flex-1 px-4 py-2 rounded transition ${resetLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        } text-white`}
                                >
                                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default Login; 
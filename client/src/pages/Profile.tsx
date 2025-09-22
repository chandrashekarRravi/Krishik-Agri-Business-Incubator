import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Edit2, Save, X, Settings, Package, MapPin, Calendar, Star, TrendingUp } from 'lucide-react';
import { Dialog } from '@headlessui/react';

const API = import.meta.env.VITE_API_URL || 'https://krishik-agri-business-hub-backend.onrender.com/api';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        profile: null as File | null,
        profilePreview: user?.profile ? `${API.replace('/api', '')}/uploads/${user.profile}` : '',
    });
    const [orders, setOrders] = useState<any[]>([]);
    const [emailChanged, setEmailChanged] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [summaryOrder, setSummaryOrder] = useState<any | null>(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [addresses, setAddresses] = useState<any[]>(user?.addresses || []);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editAddressIndex, setEditAddressIndex] = useState<number | null>(null);
    const [addressForm, setAddressForm] = useState({ label: '', address: '', isDefault: false });
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Function to refresh user data from backend
    const refreshUserData = async () => {
        if (!user || !user._id) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API}/auth/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                localStorage.setItem('user', JSON.stringify(userData));
                // Update form with fresh data
                setForm(prev => ({
                    ...prev,
                    name: userData.name || prev.name,
                    email: userData.email || prev.email,
                    phone: userData.phone || prev.phone,
                    address: userData.address || prev.address,
                    profilePreview: userData.profile ? `${API.replace('/api', '')}/uploads/${userData.profile}` : prev.profilePreview
                }));
            }
        } catch (err) {
            console.error('Failed to refresh user data:', err);
        }
    };

    useEffect(() => {
        if (!user || !user._id) return;
        const token = localStorage.getItem('token');
        fetch(`${API}/orders?userId=${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch orders');
                return res.json();
            })
            .then(data => {
                if (data.orders) setOrders(data.orders);
                else if (Array.isArray(data)) setOrders(data);
                else setOrders([]);
            })
            .catch(() => {
                setOrders([]);
                setFetchError('Could not fetch orders. Backend may be down.');
            });

        // Refresh user data on component mount
        refreshUserData();
    }, [user && user._id]);

    // Fetch addresses on mount or user change
    useEffect(() => {
        if (!user || !user._id) return;
        const token = localStorage.getItem('token');
        fetch(`${API}/auth/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user');
                return res.json();
            })
            .then(data => setAddresses(data?.addresses || []))
            .catch(() => {
                setAddresses([]);
                setFetchError('Could not fetch user profile. Backend may be down.');
            });
    }, [user && user._id]);

    if (fetchError) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-green-200 py-10">
                <div className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl p-8 border border-green-200 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-lg text-red-500 mb-4">{fetchError}</p>
                    <button
                        className="bg-agri-green text-white px-4 py-2 rounded hover:bg-agri-green/90"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const handleEdit = () => setEditMode(true);
    const handleCancel = () => {
        setEditMode(false);
        setForm({
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            profile: null,
            profilePreview: user.profile ? `${API.replace('/api', '')}/uploads/${user.profile}` : '',
        });
        setEmailChanged(false);
        setMessage('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setForm((prev) => ({ ...prev, profile: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm((prev) => ({ ...prev, profilePreview: reader.result as string }));
            reader.readAsDataURL(file);
        } else {
            setForm((prev) => ({ ...prev, profilePreview: user?.profile ? `${API.replace('/api', '')}/uploads/${user.profile}` : '' }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id) return;

        setSaving(true);
        setMessage('');

        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Add form fields
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        formData.append('address', form.address);

        // Add profile image if selected
        if (form.profile) {
            formData.append('profile', form.profile);
        }

        try {
            const res = await fetch(`${API}/auth/profile/${user._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || 'Failed to update profile');
                setSaving(false);
                return;
            }

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(data.user));

            // Update form with new data
            setForm(prev => ({
                ...prev,
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone,
                address: data.user.address,
                profilePreview: data.user.profile ? `${API.replace('/api', '')}/uploads/${data.user.profile}` : prev.profilePreview,
                profile: null // Reset file selection
            }));

            setEditMode(false);
            setMessage('Profile updated successfully.');
            setSaving(false);

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage('');
            }, 3000);

        } catch (err) {
            console.error('Profile update error:', err);
            setMessage('Failed to update profile. Please try again.');
            setSaving(false);
        }
    };

    const handleViewSummary = async (orderId: string) => {
        const res = await fetch(`${API}/orders/${orderId}`);
        if (res.ok) {
            const data = await res.json();
            setSummaryOrder(data);
            setSummaryOpen(true);
        }
    };

    const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };
    const handleAddAddress = async () => {
        if (!user?._id || !addressForm.address) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/auth/address`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId: user._id, ...addressForm })
        });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
            setAddressModalOpen(false);
            setAddressForm({ label: '', address: '', isDefault: false });
        }
    };
    const handleEditAddress = (idx: number) => {
        setEditAddressIndex(idx);
        setAddressForm(addresses[idx]);
        setAddressModalOpen(true);
    };
    const handleSaveEditAddress = async () => {
        if (!user?._id || editAddressIndex === null) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/auth/address/${user._id}/${editAddressIndex}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(addressForm)
        });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
            setAddressModalOpen(false);
            setEditAddressIndex(null);
            setAddressForm({ label: '', address: '', isDefault: false });
        }
    };
    const handleDeleteAddress = async (idx: number) => {
        if (!user?._id) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/auth/address/${user._id}/${idx}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
        }
    };
    const handleSetDefaultAddress = async (idx: number) => {
        if (!user?._id) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/auth/address/${user._id}/default/${idx}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
        }
    };

    // Helper for order status progress
    const statusSteps = ["processing", "shipped", "delivered"];
    function OrderStatusProgress({ status }: { status: string }) {
        const currentStep = statusSteps.indexOf(status.toLowerCase());
        return (
            <div className="flex items-center gap-2 my-2">
                {statusSteps.map((step, idx) => (
                    <div key={step} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 
                            ${idx < currentStep ? 'bg-green-400 border-green-400 text-white' : idx === currentStep ? 'bg-yellow-400 border-yellow-400 text-white' : 'bg-gray-200 border-gray-300 text-gray-400'}`}>{idx + 1}</div>
                        {idx < statusSteps.length - 1 && (
                            <div className={`w-8 h-1 ${idx < currentStep ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                        )}
                    </div>
                ))}
                <span className="ml-2 text-xs font-semibold text-green-700">{status}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 h-60 xs:h-60 sm:h-56 md:h-72 lg:h-80 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 h-full flex items-center justify-center pt-8 xs:pt-10 sm:pt-12 md:pt-16 pb-4 xs:pb-6 sm:pb-8 md:pb-10">
                    <div className="max-w-7xl mx-auto w-full px-3 xs:px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-4">
                            {/* Profile Picture */}
                            <div className="relative flex-shrink-0">
                                {form.profilePreview && form.profilePreview !== '' ? (
                                    <img
                                        src={form.profilePreview}
                                        alt="Profile"
                                        className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full object-cover border-2 border-white shadow-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (nextElement) {
                                                nextElement.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-green-700 border-2 border-white shadow-lg">
                                        <span className="font-bold text-green-800">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                )}
                                {editMode && (
                                    <button
                                        type="button"
                                        className="absolute -bottom-0.5 -right-0.5 xs:-bottom-1 xs:-right-1 sm:-bottom-1.5 sm:-right-1.5 bg-green-600 text-white p-1 xs:p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-white text-center">
                                {!editMode ? (
                                    <>
                                        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 xs:mb-1 sm:mb-1.5 leading-tight">{user.name}</h1>
                                        <p className="text-green-100 text-xs xs:text-sm sm:text-base mb-1 xs:mb-2 sm:mb-3 leading-tight">Agri Enthusiast & Product Explorer</p>
                                        <div className="flex flex-wrap justify-center items-center gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm">
                                            <div className="flex items-center gap-1">
                                                <Package className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                                <span>{orders.length} Orders</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                                <span>Joined {new Date().getFullYear()}</span>
                                            </div>
                                            {/*                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                                <span>Premium Member</span>
                                            </div>
*/ }
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1 xs:space-y-2 sm:space-y-3">
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-white/50 focus:border-white outline-none text-white placeholder-white/70 w-full text-center"
                                            placeholder="Your Name"
                                            required
                                        />
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="text-xs xs:text-sm sm:text-base bg-transparent border-b-2 border-white/50 focus:border-white outline-none text-green-100 placeholder-green-100/70 w-full text-center"
                                            placeholder="Your Email"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 xs:gap-3 flex-shrink-0">
                                {!editMode ? (
                                    <button
                                        onClick={handleEdit}
                                        className="bg-white text-green-700 px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs xs:text-sm sm:text-base"
                                    >
                                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden xs:inline">Edit Profile</span>
                                        <span className="xs:hidden">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex gap-2 xs:gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="bg-white/20 text-white px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 rounded-full font-semibold hover:bg-white/30 transition-colors flex items-center gap-1 text-xs xs:text-sm sm:text-base"
                                        >
                                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden xs:inline">Cancel</span>
                                            <span className="xs:hidden">Cancel</span>
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className={`px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 rounded-full font-semibold transition-colors flex items-center gap-1 text-xs xs:text-sm sm:text-base ${saving
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-white text-green-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden xs:inline">
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </span>
                                            <span className="xs:hidden">
                                                {saving ? 'Saving...' : 'Save'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8">
                    {/* Left Sidebar */}
                    <div className="xl:col-span-1 space-y-3 xs:space-y-4 sm:space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 xs:p-4 sm:p-6">
                            <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-2 xs:mb-3 sm:mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Quick Stats</span>
                            </h3>
                            <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center py-0.5 xs:py-1">
                                    <span className="text-xs xs:text-sm sm:text-base text-gray-600">Total Orders</span>
                                    <span className="font-semibold text-green-600 text-xs xs:text-sm sm:text-base">{orders.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 xs:py-1">
                                    <span className="text-xs xs:text-sm sm:text-base text-gray-600">Completed</span>
                                    <span className="font-semibold text-green-600 text-xs xs:text-sm sm:text-base">{orders.filter(o => o.status === 'completed').length}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 xs:py-1">
                                    <span className="text-xs xs:text-sm sm:text-base text-gray-600">Pending</span>
                                    <span className="font-semibold text-yellow-600 text-xs xs:text-sm sm:text-base">{orders.filter(o => o.status === 'pending').length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 xs:p-4 sm:p-6">
                            <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-2 xs:mb-3 sm:mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Contact Information</span>
                            </h3>
                            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-0.5 xs:mb-1">Phone</label>
                                    {editMode ? (
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium text-xs xs:text-sm sm:text-base break-all">{user.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-0.5 xs:mb-1">Address</label>
                                    {editMode ? (
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                            rows={3}
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium text-xs xs:text-sm sm:text-base break-words leading-relaxed">{user.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-2 space-y-3 xs:space-y-4 sm:space-y-6">
                        {/* Orders Section */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 xs:p-4 sm:p-6">
                            <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-2 xs:mb-3 sm:mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Recent Orders</span>
                            </h3>
                            {orders.length === 0 ? (
                                <div className="text-center py-4 xs:py-6 sm:py-8 text-gray-500">
                                    <Package className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 xs:mb-3 sm:mb-4 text-gray-300" />
                                    <p className="text-xs xs:text-sm sm:text-base">No orders yet</p>
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="mt-2 xs:mt-3 sm:mt-4 bg-green-600 text-white px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 rounded-lg hover:bg-green-700 transition-colors text-xs xs:text-sm sm:text-base"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                                    {orders.slice(0, 5).map((order, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-2 xs:p-3 sm:p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col gap-1 xs:gap-2 mb-1 xs:mb-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base truncate">{order.productName}</h4>
                                                        <p className="text-xs text-gray-600">Order #{order.orderNumber}</p>
                                                    </div>
                                                    <span className={`px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs font-semibold flex-shrink-0 ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center text-xs text-gray-600 gap-0.5 xs:gap-1">
                                                    <span>Quantity: {order.quantity || 1}</span>
                                                    <span>Total: ₹{order.total || 'N/A'}</span>
                                                </div>
                                                {order.createdAt && (
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length > 5 && (
                                        <button className="w-full py-1.5 xs:py-2 text-green-600 hover:text-green-700 font-medium text-xs xs:text-sm sm:text-base">
                                            View All Orders ({orders.length})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Address Management */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 xs:p-4 sm:p-6">
                            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mb-2 xs:mb-3 sm:mb-4 gap-2 xs:gap-3 sm:gap-0">
                                <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Saved Addresses</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setAddressForm({ label: '', address: '', isDefault: false });
                                        setEditAddressIndex(null);
                                        setAddressModalOpen(true);
                                    }}
                                    className="bg-green-600 text-white px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg hover:bg-green-700 transition-colors text-xs xs:text-sm self-start xs:self-auto"
                                >
                                    Add Address
                                </button>
                            </div>
                            {addresses.length === 0 ? (
                                <p className="text-gray-500 text-center py-3 xs:py-4 text-xs xs:text-sm sm:text-base">No saved addresses</p>
                            ) : (
                                <div className="space-y-2 xs:space-y-3">
                                    {addresses.map((addr, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-2 xs:p-3 sm:p-4">
                                            <div className="flex flex-col gap-2 xs:gap-3 sm:gap-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base truncate">{addr.label}</h4>
                                                            {addr.isDefault && (
                                                                <span className="bg-green-100 text-green-800 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs font-semibold self-start">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-xs xs:text-sm break-words leading-relaxed">{addr.address}</p>
                                                    </div>
                                                    <div className="flex gap-1.5 xs:gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                setAddressForm(addr);
                                                                setEditAddressIndex(idx);
                                                                setAddressModalOpen(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-700 text-xs xs:text-sm px-1 xs:px-2 py-1 rounded hover:bg-blue-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAddress(idx)}
                                                            className="text-red-600 hover:text-red-700 text-xs xs:text-sm px-1 xs:px-2 py-1 rounded hover:bg-red-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file input for profile picture */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Success Message */}
            {message && (
                <div className="fixed top-3 right-3 left-3 xs:top-4 xs:right-4 xs:left-4 sm:left-auto bg-green-600 text-white px-3 xs:px-4 sm:px-6 py-2 xs:py-3 rounded-lg shadow-lg z-50 text-xs xs:text-sm sm:text-base">
                    {message}
                </div>
            )}

            {/* Order Summary Modal */}
            <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen p-3 xs:p-4">
                    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
                    <div className="relative bg-white rounded-lg shadow-xl p-3 xs:p-4 sm:p-6 w-full max-w-lg z-10">
                        <Dialog.Title className="text-xl font-bold mb-2">Order Summary</Dialog.Title>
                        {summaryOrder ? (
                            <div className="space-y-2">
                                <div><b>Order #:</b> {summaryOrder.orderNumber}</div>
                                <div><b>Product:</b> {summaryOrder.productName}</div>
                                <div><b>Quantity:</b> {summaryOrder.quantity}</div>
                                <div><b>Total:</b> ₹{summaryOrder.total}</div>
                                <div><b>Status:</b> {summaryOrder.status}</div>
                                <div><b>Estimated Delivery:</b> {summaryOrder.estimatedDelivery ? new Date(summaryOrder.estimatedDelivery).toLocaleDateString() : 'N/A'}</div>
                                <div><b>Shipping Address:</b> {summaryOrder.shippingAddress}</div>
                                <div><b>Placed On:</b> {new Date(summaryOrder.createdAt).toLocaleDateString()}</div>
                            </div>
                        ) : (
                            <div>Loading...</div>
                        )}
                        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded" onClick={() => setSummaryOpen(false)}>Close</button>
                    </div>
                </div>
            </Dialog>
            {/* Address Modal */}
            <Dialog open={addressModalOpen} onClose={() => { setAddressModalOpen(false); setEditAddressIndex(null); }} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen p-3 xs:p-4">
                    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
                    <div className="relative bg-white rounded-lg shadow-xl p-3 xs:p-4 sm:p-6 w-full max-w-lg z-10">
                        <Dialog.Title className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{editAddressIndex !== null ? 'Edit Address' : 'Add Address'}</Dialog.Title>
                        <div className="space-y-3 sm:space-y-4">
                            <input
                                type="text"
                                name="label"
                                value={addressForm.label}
                                onChange={handleAddressFormChange}
                                placeholder="Label (e.g. Home, Office)"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <textarea
                                name="address"
                                value={addressForm.address}
                                onChange={handleAddressFormChange}
                                placeholder="Full Address"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px] text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                required
                            />
                            <label className="flex items-center gap-2 text-sm sm:text-base">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressFormChange}
                                    className="rounded focus:ring-2 focus:ring-green-500"
                                />
                                Set as default
                            </label>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                                onClick={() => { setAddressModalOpen(false); setEditAddressIndex(null); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                                onClick={editAddressIndex !== null ? handleSaveEditAddress : handleAddAddress}
                            >
                                {editAddressIndex !== null ? 'Save' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Profile; 
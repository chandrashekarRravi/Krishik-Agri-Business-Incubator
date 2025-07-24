import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Edit2, Save, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';

const API = import.meta.env.VITE_API_URL;

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
            setForm((prev) => ({ ...prev, profilePreview: user.profile ? `${API.replace('/api', '')}/uploads/${user.profile}` : '' }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call to update profile
        setTimeout(() => {
            localStorage.setItem('user', JSON.stringify({
                ...user,
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                profile: user.profile // In real app, update after upload
            }));
            setEditMode(false);
            setMessage('Profile updated successfully.');
        }, 1000);
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
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-green-200 py-10">
            <div className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl p-8 border border-green-200">
                <div className="flex flex-col items-center mb-6">
                    {form.profilePreview ? (
                        <img
                            src={form.profilePreview}
                            alt="Profile"
                            className="w-28 h-28 rounded-full object-cover border-4 border-green-400 shadow-lg mb-2"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-green-200 flex items-center justify-center text-6xl text-green-700 border-4 border-green-400 shadow-lg mb-2">
                            <UserIcon size={48} />
                        </div>
                    )}
                    {!editMode && (
                        <>
                            <h2 className="text-3xl font-extrabold text-green-800 mb-1">{user.name}</h2>
                            <span className="text-green-600 font-medium text-lg">Agri Enthusiast</span>
                        </>
                    )}
                </div>
                {editMode ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex flex-col items-center">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                className="mb-2 px-4 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Change Photo
                            </button>
                        </div>
                        <div className="flex items-center bg-green-50 rounded-lg px-4 py-3 shadow-sm">
                            <span className="w-24 text-green-700 font-semibold">Name:</span>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="ml-2 flex-1 bg-transparent outline-none border-b border-green-300 focus:border-green-600"
                                required
                            />
                        </div>
                        <div className="flex items-center bg-yellow-50 rounded-lg px-4 py-3 shadow-sm">
                            <span className="w-24 text-yellow-700 font-semibold">Email:</span>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="ml-2 flex-1 bg-transparent outline-none border-b border-yellow-300 focus:border-yellow-600"
                                required
                            />
                        </div>
                        <div className="flex items-center bg-yellow-50 rounded-lg px-4 py-3 shadow-sm">
                            <span className="w-24 text-yellow-700 font-semibold">Phone:</span>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="ml-2 flex-1 bg-transparent outline-none border-b border-yellow-300 focus:border-yellow-600"
                                required
                            />
                        </div>
                        <div className="flex items-center bg-green-50 rounded-lg px-4 py-3 shadow-sm">
                            <span className="w-24 text-green-700 font-semibold">Address:</span>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="ml-2 flex-1 bg-transparent outline-none border-b border-green-300 focus:border-green-600 resize-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1" onClick={handleCancel}><X size={16} />Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"><Save size={16} />Save</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="flex items-center bg-green-50 rounded-lg px-4 py-3 shadow-sm">
                                <span className="w-24 text-green-700 font-semibold">Email:</span>
                                <span className="ml-2 text-green-900">{user.email}</span>
                            </div>
                            <div className="flex items-center bg-yellow-50 rounded-lg px-4 py-3 shadow-sm">
                                <span className="w-24 text-yellow-700 font-semibold">Phone:</span>
                                <span className="ml-2 text-yellow-900">{user.phone}</span>
                            </div>
                            <div className="flex items-center bg-green-50 rounded-lg px-4 py-3 shadow-sm">
                                <span className="w-24 text-green-700 font-semibold">Address:</span>
                                <span className="ml-2 text-green-900">{user.address}</span>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button className="px-4 py-2 bg-yellow-400 text-green-900 rounded hover:bg-yellow-500 flex items-center gap-1" onClick={handleEdit}><Edit2 size={16} />Edit Profile</button>
                        </div>
                    </>
                )}
                {message && <div className="mt-4 text-green-700 text-center font-semibold">{message}</div>}
                {/* Order History */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-agri-green mb-4">Order History</h3>
                    {Array.isArray(orders) && orders.length === 0 ? (
                        <div className="text-gray-500">No orders found.</div>
                    ) : (
                        <div className="space-y-4">
                            {Array.isArray(orders) && orders.map((order: any) => (
                                <div key={order._id} className="bg-green-50 rounded-lg p-4 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                        <div className="font-semibold text-lg text-green-800">{order.productName || order.product?.name || 'Product'}</div>
                                        <OrderStatusProgress status={order.status} />
                                        <button className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" onClick={() => handleViewSummary(order._id)}>View Summary</button>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        <strong>Order #:</strong> {order.orderNumber || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">Quantity: {order.quantity}</div>
                                    <div className="text-sm text-gray-600">Total: ₹{order.total}</div>                                    {order.estimatedDelivery && (
                                        <div className="text-xs text-blue-700 mt-1">Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Address Management Section */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-agri-green mb-4">Shipping Addresses</h3>
                    <button className="mb-4 px-4 py-2 bg-green-600 text-white rounded" onClick={() => { setAddressModalOpen(true); setEditAddressIndex(null); setAddressForm({ label: '', address: '', isDefault: false }); }}>Add Address</button>
                    {addresses.length === 0 ? (
                        <div className="text-gray-500">No addresses found.</div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((addr, idx) => (
                                <div key={idx} className={`bg-yellow-50 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between ${addr.isDefault ? 'border-2 border-green-600' : ''}`}>
                                    <div>
                                        <div className="font-semibold">{addr.label || 'Address'} {addr.isDefault && <span className="text-green-700 text-xs ml-2">(Default)</span>}</div>
                                        <div className="text-sm text-gray-700 whitespace-pre-line">{addr.address}</div>
                                    </div>
                                    <div className="flex gap-2 mt-2 md:mt-0">
                                        <button className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" onClick={() => handleEditAddress(idx)}>Edit</button>
                                        <button className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" onClick={() => handleDeleteAddress(idx)}>Delete</button>
                                        {!addr.isDefault && <button className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs" onClick={() => handleSetDefaultAddress(idx)}>Set Default</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Order Summary Modal */}
            <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
                    <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-10">
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
                    <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-10">
                        <Dialog.Title className="text-xl font-bold mb-2">{editAddressIndex !== null ? 'Edit Address' : 'Add Address'}</Dialog.Title>
                        <div className="space-y-2">
                            <input type="text" name="label" value={addressForm.label} onChange={handleAddressFormChange} placeholder="Label (e.g. Home, Office)" className="w-full border rounded px-3 py-2" />
                            <textarea name="address" value={addressForm.address} onChange={handleAddressFormChange} placeholder="Full Address" className="w-full border rounded px-3 py-2 min-h-[80px]" required />
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} /> Set as default</label>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setAddressModalOpen(false); setEditAddressIndex(null); }}>Cancel</button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={editAddressIndex !== null ? handleSaveEditAddress : handleAddAddress}>{editAddressIndex !== null ? 'Save' : 'Add'}</button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Profile; 
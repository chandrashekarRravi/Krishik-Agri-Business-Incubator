import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'https://krishik-agri-business-hub-backend.onrender.com/api';

const Register: React.FC = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [codeError, setCodeError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const sendCode = async () => {
        setError("");
        setCodeError("");
        if (!form.phone) {
            setError("Phone number is required");
            return;
        }
        const res = await fetch(`${API}/auth/send-phone-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: form.phone }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.message || "Failed to send code");
            return;
        }
        setCodeSent(true);
        setIsVerifying(true);
    };

    const verifyCode = async () => {
        setCodeError("");
        const res = await fetch(`${API}/auth/verify-phone-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: form.phone, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            setCodeError(data.message || "Invalid code");
            return;
        }
        setIsVerifying(false);
        setShowSuccess(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!codeSent) {
            await sendCode();
            return;
        }
        if (showSuccess) {
            try {
                const res = await fetch(`${API}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || "Registration failed");
                    return;
                }
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
                setForm({ name: "", email: "", phone: "", address: "", password: "" });
                navigate("/login");
            } catch (err) {
                setError("Server error. Please try again later.");
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">Phone number is required. You will receive SMS updates regarding your order details.</p>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Shipping Address</label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    onClick={sendCode}
                    disabled={isVerifying || codeSent}
                >
                    {codeSent ? "Code Sent" : "Send Verification Code"}
                </button>
                {isVerifying && (
                    <div className="mt-4">
                        <label className="block mb-1 font-medium">Enter 4-digit code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            maxLength={4}
                            className="w-full border rounded px-3 py-2"
                        />
                        <button
                            type="button"
                            className="w-full bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700 transition"
                            onClick={verifyCode}
                        >
                            Verify Code
                        </button>
                        {codeError && <p className="text-red-500 text-sm">{codeError}</p>}
                    </div>
                )}
                {showSuccess && (
                    <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                        Registration completed! Please login and have a good experience.
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    disabled={!showSuccess}
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register; 
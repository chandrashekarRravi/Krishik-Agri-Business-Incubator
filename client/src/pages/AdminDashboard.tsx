import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    category: string;
    startup: string;
    price: number;
    description?: string;
    quantity?: number;
    contact: {
        name: string;
        phone: string;
        email: string;
    };
}

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    productName: string;
    user: string;
    status: string;
    quantity?: number;
    total?: number;
    createdAt?: string;
}

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
    const [tab, setTab] = useState<'products' | 'users' | 'orders' | 'startups'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [startups, setStartups] = useState<string[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showBulkUploadInfo, setShowBulkUploadInfo] = useState(false);
    const [schemaFormat, setSchemaFormat] = useState<any>(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        category: '',
        startup: '',
        quantity: '',
        price: '',
        contact: { name: '', phone: '', email: '' },
        image: null as File | null,
        newCategory: '',
        newStartup: '',
        quantityUnit: 'kg', // Added for quantity unit
        priceUnit: '₹' // Added for price unit
    });
    const [newOrderStatus, setNewOrderStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Filter states
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStartup, setFilterStartup] = useState<string>('all');
    const [filterAlphabet, setFilterAlphabet] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Orders filter states
    const [filterOrderStatus, setFilterOrderStatus] = useState<string>('all');
    const [searchOrderTerm, setSearchOrderTerm] = useState<string>('');

    // Users filter states
    const [searchUserTerm, setSearchUserTerm] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // 1. Add state for editing product
    const [showEditProduct, setShowEditProduct] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);

    // 1. Add new tab state
    const [startupsList, setStartupsList] = useState<any[]>([]);
    const [showAddStartup, setShowAddStartup] = useState(false);
    const [showEditStartup, setShowEditStartup] = useState(false);
    const [editStartup, setEditStartup] = useState<any>(null);
    const [startupLoading, setStartupLoading] = useState(false);

    // Add state for search and focus area filter
    const [startupSearch, setStartupSearch] = useState('');
    const [startupFocusArea, setStartupFocusArea] = useState('All');

    // Compute unique focus areas for filter dropdown
    const startupFocusAreas = ['All', ...Array.from(new Set(startupsList.map(s => s.focusArea)))];

    // Filtered startups based on search and focus area
    const filteredStartupsList = startupsList.filter(s => {
        const matchesSearch =
            s.name.toLowerCase().includes(startupSearch.toLowerCase()) ||
            s.focusArea.toLowerCase().includes(startupSearch.toLowerCase()) ||
            (s.contact?.name && s.contact.name.toLowerCase().includes(startupSearch.toLowerCase()));
        const matchesFocusArea =
            startupFocusArea === 'All' || s.focusArea === startupFocusArea;
        return matchesSearch && matchesFocusArea;
    });

    // Sorting state
    const [startupSortBy, setStartupSortBy] = useState<'name' | 'focusArea' | 'featured'>('name');
    const [startupSortDir, setStartupSortDir] = useState<'asc' | 'desc'>('asc');

    // Pagination state
    const [startupPage, setStartupPage] = useState(1);
    const startupsPerPage = 5;

    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [productPageSize, setProductPageSize] = useState(20);

    // Sorting function
    const sortedStartupsList = [...filteredStartupsList].sort((a, b) => {
        let valA, valB;
        if (startupSortBy === 'featured') {
            valA = a.featured ? 1 : 0;
            valB = b.featured ? 1 : 0;
        } else {
            valA = (a[startupSortBy] || '').toLowerCase();
            valB = (b[startupSortBy] || '').toLowerCase();
        }
        if (valA < valB) return startupSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return startupSortDir === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalStartupPages = Math.ceil(sortedStartupsList.length / startupsPerPage);
    const paginatedStartups = sortedStartupsList.slice((startupPage - 1) * startupsPerPage, startupPage * startupsPerPage);

    // Featured toggle
    const handleToggleFeatured = async (startup: any) => {
        try {
            const res = await fetch(`${API}/startups/${startup._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ ...startup, featured: !startup.featured })
            });
            if (res.ok) {
                toast({ title: 'Success', description: `Startup marked as ${!startup.featured ? 'featured' : 'not featured'}` });
                fetchStartups();
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed to update featured status', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to update featured status', variant: 'destructive' });
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.isAdmin) {
            window.location.href = '/';
            return;
        }
        fetchData(productPage, productPageSize);
        fetchCategoriesAndStartups();
        fetchSchemaFormat();
    }, [productPage, productPageSize]);

    const fetchSchemaFormat = async () => {
        try {
            const response = await fetch(`${API}/products/schema-format`, { headers: getAuthHeaders() });
            if (response.ok) {
                const format = await response.json();
                setSchemaFormat(format);
            }
        } catch (err) {
            console.error('Failed to fetch schema format:', err);
        }
    };

    const fetchCategoriesAndStartups = async () => {
        try {
            const [categoriesRes, startupsRes] = await Promise.all([
                fetch(`${API}/products/categories`),
                fetch(`${API}/products/startups`)
            ]);
            if (categoriesRes.ok) {
                const cats = await categoriesRes.json();
                setCategories(['All', ...cats]);
            }
            if (startupsRes.ok) {
                const starts = await startupsRes.json();
                setStartups(['All', ...starts]);
            }
        } catch (err) {
            console.error('Failed to fetch categories/startups:', err);
        }
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchData = async (pageNum = productPage, limit = productPageSize) => {
        setLoading(true);
        setError('');
        try {
            const prods = await fetch(`${API}/products?page=${pageNum}&limit=${limit}`, { headers: getAuthHeaders() });
            const productsData = prods.ok ? await prods.json() : { products: [] };
            setProducts(Array.isArray(productsData.products) ? productsData.products : []);
            setProductTotalPages(productsData.totalPages || 1);
            setProductPage(productsData.page || 1);

            const [usrs, ords] = await Promise.all([
                fetch(`${API}/auth`, { headers: getAuthHeaders() }),
                fetch(`${API}/orders?userId=all`, { headers: getAuthHeaders() })
            ]);

            const usersData = usrs.ok ? await usrs.json() : [];
            const ordersData = ords.ok ? await ords.json() : { orders: [] };

            setUsers(Array.isArray(usersData) ? usersData : []);
            setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const response = await fetch(`${API}/api/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Product deleted successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete product",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive",
            });
        }
    };

    const deleteUser = async (id: string) => {
        try {
            const response = await fetch(`${API}/api/auth/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                toast({
                    title: "Success",
                    description: "User deleted successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete user",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    const deleteOrder = async (id: string) => {
        try {
            const response = await fetch(`${API}/orders/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Order deleted successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete order",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete order",
                variant: "destructive",
            });
        }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            const response = await fetch(`${API}/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Order status updated successfully",
                });
                fetchData();
                setSelectedOrder(null);
                setNewOrderStatus('');
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update order status",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update order status",
                variant: "destructive",
            });
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const allowedTypes = ['xlsx', 'xls', 'docx', 'doc'];

        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
            toast({
                title: "Error",
                description: "Please upload .xlsx, .xls, .docx, or .doc files only",
                variant: "destructive",
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API}/products/bulk-upload`, {
                method: 'POST',
                body: formData,
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "Success",
                    description: `${result.count} products uploaded successfully from ${result.fileType} file`,
                });
                fetchData();
                fetchCategoriesAndStartups();
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to upload products",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to upload products",
                variant: "destructive",
            });
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        // Gather product data for duplicate check
        const productName = newProduct.name.trim().toLowerCase();
        const productStartup = (newProduct.newStartup ? newProduct.newStartup : (newProduct.startup === 'All' ? '' : newProduct.startup)).trim().toLowerCase();
        const productCategory = (newProduct.newCategory ? newProduct.newCategory : (newProduct.category === 'All' ? '' : newProduct.category)).trim().toLowerCase();
        const productEmail = newProduct.contact.email.trim().toLowerCase();
        const productPhone = newProduct.contact.phone.trim();
        const duplicate = products.some(p =>
            p.name.trim().toLowerCase() === productName &&
            p.startup.trim().toLowerCase() === productStartup &&
            (p.category?.trim().toLowerCase() || '') === productCategory &&
            (p.contact?.email?.trim().toLowerCase() || '') === productEmail &&
            (p.contact?.phone?.trim() || '') === productPhone
        );
        if (duplicate) {
            toast({ title: 'Error', description: 'A product with the same name, startup, category, and contact already exists.', variant: 'destructive' });
            return;
        }
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description);
        formData.append('category', newProduct.newCategory ? newProduct.newCategory : (newProduct.category === 'All' ? '' : newProduct.category));
        formData.append('startup', newProduct.newStartup ? newProduct.newStartup : (newProduct.startup === 'All' ? '' : newProduct.startup));
        formData.append('quantity', newProduct.quantity + (newProduct.quantityUnit ? ' ' + newProduct.quantityUnit : ''));
        formData.append('price', newProduct.price + (newProduct.priceUnit ? ' ' + newProduct.priceUnit : ''));
        formData.append('contact', JSON.stringify(newProduct.contact));
        if (newProduct.image) formData.append('image', newProduct.image);
        try {
            const response = await fetch(`${API}/products`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            });
            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Product added successfully",
                });
                setShowAddProduct(false);
                setNewProduct({
                    name: '',
                    description: '',
                    category: '',
                    startup: '',
                    quantity: '',
                    price: '',
                    contact: { name: '', phone: '', email: '' },
                    image: null,
                    newCategory: '',
                    newStartup: '',
                    quantityUnit: 'kg',
                    priceUnit: '₹'
                });
                fetchData();
                fetchCategoriesAndStartups();
            } else {
                let errorMsg = "Failed to add product";
                try {
                    const errData = await response.json();
                    if (errData && errData.message) errorMsg = errData.message + (errData.error ? ": " + errData.error : "");
                } catch { }
                toast({
                    title: "Error",
                    description: errorMsg,
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to add product",
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter functions
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filterCategory && filterCategory !== 'all') {
            filtered = filtered.filter(product => product.category === filterCategory);
        }

        // Filter by startup
        if (filterStartup && filterStartup !== 'all') {
            filtered = filtered.filter(product => product.startup === filterStartup);
        }

        // Filter by alphabet
        if (filterAlphabet && filterAlphabet !== 'all') {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().startsWith(filterAlphabet.toLowerCase())
            );
        }

        return filtered;
    };

    const clearFilters = () => {
        setFilterCategory('all');
        setFilterStartup('all');
        setFilterAlphabet('all');
        setSearchTerm('');
    };

    const getAlphabetOptions = () => {
        const alphabets = [...new Set(products.map(p => p.name.charAt(0).toUpperCase()))];
        return alphabets.sort();
    };

    // Orders filter functions
    const getFilteredOrders = () => {
        let filtered = [...orders];

        // Filter by search term
        if (searchOrderTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(searchOrderTerm.toLowerCase()) ||
                order.productName.toLowerCase().includes(searchOrderTerm.toLowerCase()) ||
                order.user.toLowerCase().includes(searchOrderTerm.toLowerCase())
            );
        }

        // Filter by status
        if (filterOrderStatus && filterOrderStatus !== 'all') {
            filtered = filtered.filter(order => order.status === filterOrderStatus);
        }

        return filtered;
    };

    // Users filter functions
    const getFilteredUsers = () => {
        let filtered = [...users];

        // Filter by search term
        if (searchUserTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
                user.phone.toLowerCase().includes(searchUserTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const clearOrderFilters = () => {
        setFilterOrderStatus('all');
        setSearchOrderTerm('');
    };

    const clearUserFilters = () => {
        setSearchUserTerm('');
    };

    // Utility to split value and unit
    function splitValueAndUnit(value: string, defaultUnit: string) {
        if (!value) return { value: '', unit: defaultUnit };
        const match = value.match(/^(\d+(?:\.\d+)?)(?:\s*(\D+))?$/);
        if (match) {
            return { value: match[1], unit: match[2] ? match[2].trim() : defaultUnit };
        }
        return { value, unit: defaultUnit };
    }

    // When opening Add Product modal, keep as is
    // When opening Edit Product modal, split quantity and price into number/unit
    const handleEditProduct = (p: Product) => {
        const { value: quantity, unit: quantityUnit } = splitValueAndUnit(String(p.quantity ?? ''), 'kg');
        const { value: price, unit: priceUnit } = splitValueAndUnit(String(p.price ?? ''), '₹');
        setEditProduct({
            ...p,
            quantity,
            quantityUnit,
            price,
            priceUnit,
            newCategory: '',
            newStartup: ''
        });
        setShowEditProduct(true);
    };

    // 3. Fetch startups
    const fetchStartups = async () => {
        setStartupLoading(true);
        try {
            const res = await fetch(`${API}/startups`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setStartupsList(data);
            }
        } catch {
            setStartupsList([]);
        } finally {
            setStartupLoading(false);
        }
    };

    // 4. Fetch startups on mount and when tab changes
    useEffect(() => {
        if (tab === 'startups') fetchStartups();
    }, [tab]);

    // 5. Add Startup
    const handleAddStartup = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());
        // Duplicate check (strict)
        const duplicate = startupsList.some(s =>
            s.name.trim().toLowerCase() === String(body.name).trim().toLowerCase() &&
            s.focusArea.trim().toLowerCase() === String(body.focusArea).trim().toLowerCase() &&
            s.contact?.email.trim().toLowerCase() === String(body['contact.email']).trim().toLowerCase() &&
            s.contact?.phone.trim() === String(body['contact.phone']).trim()
        );
        if (duplicate) {
            toast({ title: 'Error', description: 'A startup with the same name, focus area, and contact already exists.', variant: 'destructive' });
            return;
        }
        try {
            const res = await fetch(`${API}/startups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'Startup added successfully' });
                setShowAddStartup(false);
                fetchStartups();
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed to add startup', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to add startup', variant: 'destructive' });
        }
    };

    // 6. Edit Startup
    const handleEditStartup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStartup) return;
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());
        try {
            const res = await fetch(`${API}/startups/${editStartup._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'Startup updated successfully' });
                setShowEditStartup(false);
                setEditStartup(null);
                fetchStartups();
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed to update startup', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to update startup', variant: 'destructive' });
        }
    };

    // 7. Delete Startup
    const handleDeleteStartup = async (id: string) => {
        try {
            const res = await fetch(`${API}/startups/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'Startup deleted successfully' });
                fetchStartups();
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed to delete startup', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to delete startup', variant: 'destructive' });
        }
    };

    // Notification state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications
    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/orders/admin/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    // Mark all as read
    const markAllNotificationsRead = async () => {
        // Optionally implement a backend endpoint to mark all as read
        setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage products, users, and orders</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-8">
                    <Button
                        onClick={() => setTab('products')}
                        variant={tab === 'products' ? 'default' : 'outline'}
                        className="flex-1 text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">Products</span>
                        <span className="sm:hidden">Products</span>
                        <span className="ml-1">({products.length})</span>
                    </Button>
                    <Button
                        onClick={() => setTab('users')}
                        variant={tab === 'users' ? 'default' : 'outline'}
                        className="flex-1 text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">Users</span>
                        <span className="sm:hidden">Users</span>
                        <span className="ml-1">({users.length})</span>
                    </Button>
                    <Button
                        onClick={() => setTab('orders')}
                        variant={tab === 'orders' ? 'default' : 'outline'}
                        className="flex-1 text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">Orders</span>
                        <span className="sm:hidden">Orders</span>
                        <span className="ml-1">({orders.length})</span>
                    </Button>
                    <Button
                        onClick={() => setTab('startups')}
                        variant={tab === 'startups' ? 'default' : 'outline'}
                        className="flex-1 text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">Startups</span>
                        <span className="sm:hidden">Startups</span>
                        <span className="ml-1">({startupsList.length})</span>
                    </Button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                    </div>
                )}

                {!loading && tab === 'products' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <span>Products Management</span>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <Button
                                        onClick={() => setShowBulkUploadInfo(true)}
                                        className="w-full sm:w-auto text-sm"
                                    >
                                        <span className="hidden sm:inline">Bulk Upload (Excel/DOC)</span>
                                        <span className="sm:hidden">Bulk Upload</span>
                                    </Button>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.docx,.doc"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleBulkUpload}
                                    />
                                    <Button
                                        onClick={() => setShowAddProduct(true)}
                                        variant="outline"
                                        className="w-full sm:w-auto text-sm"
                                    >
                                        Add Product
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>

                        {/* Filters Section */}
                        <div className="px-6 pb-4 border-b">
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search products by name or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full sm:w-auto"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>

                                {/* Filter Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {/* Category Filter */}
                                    <div>
                                        <Label htmlFor="category-filter" className="text-sm font-medium">
                                            Category
                                        </Label>
                                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map(category => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Startup Filter */}
                                    <div>
                                        <Label htmlFor="startup-filter" className="text-sm font-medium">
                                            Startup
                                        </Label>
                                        <Select value={filterStartup} onValueChange={setFilterStartup}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Startups" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Startups</SelectItem>
                                                {startups.map(startup => (
                                                    <SelectItem key={startup} value={startup}>
                                                        {startup}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Alphabet Filter */}
                                    <div>
                                        <Label htmlFor="alphabet-filter" className="text-sm font-medium">
                                            Alphabet
                                        </Label>
                                        <Select value={filterAlphabet} onValueChange={setFilterAlphabet}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Letters" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Letters</SelectItem>
                                                {getAlphabetOptions().map(letter => (
                                                    <SelectItem key={letter} value={letter}>
                                                        {letter}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Results Count */}
                                    <div className="flex items-end">
                                        <div className="text-sm text-gray-600">
                                            Showing {getFilteredProducts().length} of {products.length} products
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardContent>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                {getFilteredProducts().length > 0 ? (
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3">Name</th>
                                                <th className="text-left p-3">Category</th>
                                                <th className="text-left p-3">Startup</th>
                                                <th className="text-left p-3">Price</th>
                                                <th className="text-left p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredProducts().map((p: Product) => (
                                                <tr key={p._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">{p.name}</td>
                                                    <td className="p-3">
                                                        <Badge variant="secondary">{p.category}</Badge>
                                                    </td>
                                                    <td className="p-3">{p.startup}</td>
                                                    <td className="p-3">₹{p.price}</td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(p)}>Edit</Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">
                                                                        Delete
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{p.name}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => deleteProduct(p._id)}>
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-lg mb-2">No products found</div>
                                        <div className="text-gray-400 text-sm">
                                            Try adjusting your filters or search terms
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden">
                                {getFilteredProducts().length > 0 ? (
                                    <div className="space-y-4">
                                        {getFilteredProducts().map((p: Product) => (
                                            <div key={p._id} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{p.name}</h3>
                                                        <p className="text-sm text-gray-600">{p.startup}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">₹{p.price}</div>
                                                        <Badge variant="secondary" className="mt-1">{p.category}</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(p)}>Edit</Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="sm">
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{p.name}"? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteProduct(p._id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-lg mb-2">No products found</div>
                                        <div className="text-gray-400 text-sm">
                                            Try adjusting your filters or search terms
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && tab === 'users' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Users Management</CardTitle>
                        </CardHeader>

                        {/* Users Filters Section */}
                        <div className="px-6 pb-4 border-b">
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search users by name, email, or phone..."
                                            value={searchUserTerm}
                                            onChange={(e) => setSearchUserTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={clearUserFilters}
                                        className="w-full sm:w-auto"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-end">
                                    <div className="text-sm text-gray-600">
                                        Showing {getFilteredUsers().length} of {users.length} users
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardContent>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Name</th>
                                            <th className="text-left p-3">Email</th>
                                            <th className="text-left p-3">Phone</th>
                                            <th className="text-left p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredUsers().map((u: User) => (
                                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{u.name}</td>
                                                <td className="p-3">{u.email}</td>
                                                <td className="p-3">{u.phone}</td>
                                                <td className="p-3">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{u.name}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteUser(u._id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden">
                                {getFilteredUsers().length > 0 ? (
                                    <div className="space-y-4">
                                        {getFilteredUsers().map((u: User) => (
                                            <div key={u._id} className="border rounded-lg p-4 space-y-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{u.name}</h3>
                                                    <p className="text-sm text-gray-600">{u.email}</p>
                                                    <p className="text-sm text-gray-600">{u.phone}</p>
                                                </div>
                                                <div className="flex justify-end">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{u.name}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteUser(u._id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-lg mb-2">No users found</div>
                                        <div className="text-gray-400 text-sm">
                                            Try adjusting your search terms
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && tab === 'orders' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders Management</CardTitle>
                        </CardHeader>

                        {/* Orders Filters Section */}
                        <div className="px-6 pb-4 border-b">
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search orders by order number, product, or user..."
                                            value={searchOrderTerm}
                                            onChange={(e) => setSearchOrderTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={clearOrderFilters}
                                        className="w-full sm:w-auto"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>

                                {/* Filter Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Status Filter */}
                                    <div>
                                        <Label htmlFor="status-filter" className="text-sm font-medium">
                                            Status
                                        </Label>
                                        <Select value={filterOrderStatus} onValueChange={setFilterOrderStatus}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Results Count */}
                                    <div className="flex items-end">
                                        <div className="text-sm text-gray-600">
                                            Showing {getFilteredOrders().length} of {orders.length} orders
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardContent>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Order #</th>
                                            <th className="text-left p-3">Product</th>
                                            <th className="text-left p-3">User</th>
                                            <th className="text-left p-3">Status</th>
                                            <th className="text-left p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredOrders().map((o: Order) => {
                                            const userObj = users.find(u => u._id === o.user);
                                            return (
                                                <tr key={o._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-mono text-sm">{o.orderNumber}</td>
                                                    <td className="p-3">{o.productName}</td>
                                                    <td className="p-3">
                                                        {userObj ? (
                                                            <>
                                                                <span>{userObj.name}</span>
                                                                <br />
                                                                <span className="text-xs text-gray-500">{userObj._id}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Unknown User</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge className={getStatusColor(o.status)}>
                                                            {o.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => setSelectedOrder(o)}
                                                                    >
                                                                        Update Status
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Update Order Status</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label>Current Status</Label>
                                                                            <p className="text-sm text-gray-600">{o.status}</p>
                                                                        </div>
                                                                        <div>
                                                                            <Label htmlFor="newStatus">New Status</Label>
                                                                            <Select onValueChange={setNewOrderStatus}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select new status" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                                    <SelectItem value="processing">Processing</SelectItem>
                                                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                onClick={() => updateOrderStatus(o._id, newOrderStatus)}
                                                                                disabled={!newOrderStatus}
                                                                            >
                                                                                Update
                                                                            </Button>
                                                                            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                                                                                Cancel
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">
                                                                        Delete
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete order "{o.orderNumber}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => deleteOrder(o._id)}>
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden">
                                {getFilteredOrders().length > 0 ? (
                                    <div className="space-y-4">
                                        {getFilteredOrders().map((o: Order) => {
                                            const userObj = users.find(u => u._id === o.user);
                                            return (
                                                <div key={o._id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">{o.productName}</h3>
                                                            <p className="text-sm text-gray-600">Order: {o.orderNumber}</p>
                                                            <p className="text-sm text-gray-600">
                                                                User: {userObj ? (
                                                                    <>
                                                                        {userObj.name}
                                                                        <br />
                                                                        <span className="text-xs text-gray-500">{userObj._id}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">Unknown User</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge className={getStatusColor(o.status)}>
                                                                {o.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setSelectedOrder(o)}
                                                                >
                                                                    Update Status
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Update Order Status</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label>Current Status</Label>
                                                                        <p className="text-sm text-gray-600">{o.status}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="newStatus">New Status</Label>
                                                                        <Select onValueChange={setNewOrderStatus}>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select new status" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                                <SelectItem value="processing">Processing</SelectItem>
                                                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            onClick={() => updateOrderStatus(o._id, newOrderStatus)}
                                                                            disabled={!newOrderStatus}
                                                                        >
                                                                            Update
                                                                        </Button>
                                                                        <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="sm">
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete order "{o.orderNumber}"? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteOrder(o._id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 text-lg mb-2">No orders found</div>
                                        <div className="text-gray-400 text-sm">
                                            Try adjusting your filters or search terms
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && tab === 'startups' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <span>Startups Management</span>
                                <Button onClick={() => setShowAddStartup(true)} variant="outline" className="w-full sm:w-auto text-sm">
                                    Add Startup
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {startupLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    <span className="ml-2">Loading...</span>
                                </div>
                            ) : startupsList.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 cursor-pointer" onClick={() => {
                                                    setStartupSortBy('name');
                                                    setStartupSortDir(startupSortBy === 'name' && startupSortDir === 'asc' ? 'desc' : 'asc');
                                                }}>Name {startupSortBy === 'name' ? (startupSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                                <th className="text-left p-3 cursor-pointer" onClick={() => {
                                                    setStartupSortBy('focusArea');
                                                    setStartupSortDir(startupSortBy === 'focusArea' && startupSortDir === 'asc' ? 'desc' : 'asc');
                                                }}>Focus Area {startupSortBy === 'focusArea' ? (startupSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                                <th className="text-left p-3">Description</th>
                                                <th className="text-left p-3">Contact</th>
                                                <th className="text-left p-3 cursor-pointer" onClick={() => {
                                                    setStartupSortBy('featured');
                                                    setStartupSortDir(startupSortBy === 'featured' && startupSortDir === 'asc' ? 'desc' : 'asc');
                                                }}>Featured {startupSortBy === 'featured' ? (startupSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                                <th className="text-left p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedStartups.map((s) => (
                                                <tr key={s._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-semibold">{s.name}</td>
                                                    <td className="p-3">{s.focusArea}</td>
                                                    <td className="p-3 max-w-xs truncate" title={s.description}>{s.description}</td>
                                                    <td className="p-3">
                                                        <div>{s.contact?.name}</div>
                                                        <div className="text-xs text-gray-500">{s.contact?.phone}</div>
                                                        <div className="text-xs text-gray-500">{s.contact?.email}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Button size="sm" variant={s.featured ? 'default' : 'outline'} onClick={() => handleToggleFeatured(s)}>
                                                            {s.featured ? '★' : '☆'}
                                                        </Button>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => { setEditStartup(s); setShowEditStartup(true); }}>Edit</Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">Delete</Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Startup</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{s.name}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteStartup(s._id)}>
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 text-lg mb-2">No startups found</div>
                                </div>
                            )}
                        </CardContent>
                        {/* Add pagination controls below the table */}
                        {totalStartupPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <Button size="sm" variant="outline" disabled={startupPage === 1} onClick={() => setStartupPage(startupPage - 1)}>Previous</Button>
                                {Array.from({ length: totalStartupPages }, (_, i) => (
                                    <Button key={i + 1} size="sm" variant={startupPage === i + 1 ? 'default' : 'outline'} onClick={() => setStartupPage(i + 1)}>{i + 1}</Button>
                                ))}
                                <Button size="sm" variant="outline" disabled={startupPage === totalStartupPages} onClick={() => setStartupPage(startupPage + 1)}>Next</Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Bulk Upload Info Modal */}
            {showBulkUploadInfo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg sm:text-xl font-bold">Bulk Upload Products</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBulkUploadInfo(false)}
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">📋 Supported File Formats</h3>
                                <ul className="text-blue-800 space-y-1">
                                    <li>• Excel files (.xlsx, .xls)</li>
                                    <li>• Word documents (.docx, .doc)</li>
                                </ul>
                            </div>

                            {schemaFormat && (
                                <div className="space-y-6">
                                    {/* MongoDB Schema Format Section */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                                        <h3 className="font-bold text-lg text-blue-900 mb-4">📋 Required Product Schema Format</h3>
                                        <div className="bg-white p-4 rounded border">
                                            <div className="font-mono text-sm space-y-2">
                                                <div className="text-blue-600 font-semibold">MongoDB Schema Structure:</div>
                                                <div className="pl-4">
                                                    <div>{`{`}</div>
                                                    <div className="pl-4">
                                                        <div className="text-green-600">name: <span className="text-gray-600">String (required)</span></div>
                                                        <div className="text-green-600">description: <span className="text-gray-600">String</span></div>
                                                        <div className="text-green-600">category: <span className="text-gray-600">String</span></div>
                                                        <div className="text-green-600">startup: <span className="text-gray-600">String</span></div>
                                                        <div className="text-green-600">quantity: <span className="text-gray-600">String</span></div>
                                                        <div className="text-green-600">price: <span className="text-gray-600">String</span></div>
                                                        <div className="text-green-600">contact: <span className="text-gray-600">{`{`}</span></div>
                                                        <div className="pl-4">
                                                            <div className="text-blue-600">name: <span className="text-gray-600">String</span></div>
                                                            <div className="text-blue-600">phone: <span className="text-gray-600">String</span></div>
                                                            <div className="text-blue-600">email: <span className="text-gray-600">String</span></div>
                                                        </div>
                                                        <div className="text-gray-600">{`}`}</div>
                                                        <div className="text-green-600">image: <span className="text-gray-600">String (URL only, required)</span></div>
                                                    </div>
                                                    <div>{`}`}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <h3 className="font-semibold mb-3 text-green-700">📊 Required Fields</h3>
                                            <div className="space-y-2">
                                                {schemaFormat.requiredFields.map((field: string, index: number) => (
                                                    <div key={index} className="bg-green-50 p-2 sm:p-3 rounded border border-green-200">
                                                        <span className="font-medium text-green-800 text-sm sm:text-base">{field}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-3 text-yellow-700">📝 Optional Fields</h3>
                                            <div className="space-y-2">
                                                {schemaFormat.optionalFields.map((field: string, index: number) => (
                                                    <div key={index} className="bg-yellow-50 p-2 sm:p-3 rounded border border-yellow-200">
                                                        <span className="font-medium text-yellow-800 text-sm sm:text-base">{field}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">📋 Example Format</h3>
                                        <div className="bg-gray-50 p-4 rounded overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2">name</th>
                                                        <th className="text-left p-2">description</th>
                                                        <th className="text-left p-2">category</th>
                                                        <th className="text-left p-2">startup</th>
                                                        <th className="text-left p-2">quantity</th>
                                                        <th className="text-left p-2">price</th>
                                                        <th className="text-left p-2">contact.name</th>
                                                        <th className="text-left p-2">contact.phone</th>
                                                        <th className="text-left p-2">contact.email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="p-2">Organic Fertilizer</td>
                                                        <td className="p-2">High-quality organic fertilizer</td>
                                                        <td className="p-2">Fertilizers</td>
                                                        <td className="p-2">GreenTech Solutions</td>
                                                        <td className="p-2">100</td>
                                                        <td className="p-2">500</td>
                                                        <td className="p-2">John Doe</td>
                                                        <td className="p-2">9876543210</td>
                                                        <td className="p-2">john@greentech.com</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Field Descriptions */}
                                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-4">📖 Field Descriptions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            {schemaFormat.fieldDescriptions && Object.entries(schemaFormat.fieldDescriptions as Record<string, string>).map(([field, description]) => (
                                                <div key={field} className="bg-white p-2 sm:p-3 rounded border">
                                                    <div className="font-medium text-blue-600 mb-1 text-sm sm:text-base">{field}</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">{description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
                                        <ul className="text-yellow-800 space-y-1 text-sm">
                                            <li>• Images cannot be uploaded via bulk upload (use image URLs only)</li>
                                            <li>• Product name is required for all entries</li>
                                            <li>• Contact information should be in the format: contact.name, contact.phone, contact.email</li>
                                            <li>• For DOC files, use table format with tab-separated values</li>
                                            <li>• For Excel files, use column headers matching the field names</li>
                                            <li>• Reviews, createdAt, and updatedAt are automatically generated</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full sm:flex-1"
                                >
                                    Choose File & Upload
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBulkUploadInfo(false)}
                                    className="w-full sm:flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg sm:text-xl font-bold mb-6">Add New Product</h2>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={newProduct.category}
                                        onValueChange={value => setNewProduct({ ...newProduct, category: value, newCategory: '' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="newCategory">New Category</Label>
                                    <Input
                                        id="newCategory"
                                        placeholder="Add new category"
                                        value={newProduct.newCategory}
                                        onChange={e => setNewProduct({ ...newProduct, newCategory: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startup">Startup</Label>
                                    <Select
                                        value={newProduct.startup}
                                        onValueChange={value => setNewProduct({ ...newProduct, startup: value, newStartup: '' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select startup" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {startups.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="newStartup">New Startup</Label>
                                    <Input
                                        id="newStartup"
                                        placeholder="Add new startup"
                                        value={newProduct.newStartup}
                                        onChange={e => setNewProduct({ ...newProduct, newStartup: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="quantity"
                                            type="number"
                                            value={newProduct.quantity}
                                            onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                            className="flex-1"
                                        />
                                        <Select
                                            value={newProduct.quantityUnit || 'kg'}
                                            onValueChange={value => setNewProduct({ ...newProduct, quantityUnit: value })}
                                        >
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">kg</SelectItem>
                                                <SelectItem value="g">g</SelectItem>
                                                <SelectItem value="piece">piece</SelectItem>
                                                <SelectItem value="litre">litre</SelectItem>
                                                <SelectItem value="ml">ml</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="price">Price</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="price"
                                            type="number"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="flex-1"
                                        />
                                        <Select
                                            value={newProduct.priceUnit || '₹'}
                                            onValueChange={value => setNewProduct({ ...newProduct, priceUnit: value })}
                                        >
                                            <SelectTrigger className="w-16">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="₹">₹</SelectItem>
                                                <SelectItem value="$">$</SelectItem>
                                                <SelectItem value="€">€</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="contactName">Contact Name</Label>
                                    <Input
                                        id="contactName"
                                        value={newProduct.contact.name}
                                        onChange={e => setNewProduct({
                                            ...newProduct,
                                            contact: { ...newProduct.contact, name: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contactPhone">Contact Phone</Label>
                                    <Input
                                        id="contactPhone"
                                        value={newProduct.contact.phone}
                                        onChange={e => setNewProduct({
                                            ...newProduct,
                                            contact: { ...newProduct.contact, phone: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={newProduct.contact.email}
                                        onChange={e => setNewProduct({
                                            ...newProduct,
                                            contact: { ...newProduct.contact, email: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="image">Product Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file && file.size > 2 * 1024 * 1024) { // 2MB max
                                            toast({
                                                title: "Error",
                                                description: "Image must be less than 2MB",
                                                variant: "destructive",
                                            });
                                            e.target.value = '';
                                            return;
                                        }
                                        setNewProduct({ ...newProduct, image: file });
                                    }}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                                <Button type="submit" className="w-full sm:flex-1">
                                    Add Product
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddProduct(false)}
                                    className="w-full sm:flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditProduct && editProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg sm:text-xl font-bold mb-6">Edit Product</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData();
                            formData.append('name', editProduct.name);
                            formData.append('description', editProduct.description);
                            formData.append('category', editProduct.category);
                            formData.append('startup', editProduct.startup);
                            formData.append('quantity', String(editProduct.quantity) + (editProduct.quantityUnit ? ' ' + editProduct.quantityUnit : ''));
                            formData.append('price', String(editProduct.price) + (editProduct.priceUnit ? ' ' + editProduct.priceUnit : ''));
                            formData.append('contact', JSON.stringify(editProduct.contact));
                            if (editProduct.image instanceof File) formData.append('image', editProduct.image);
                            try {
                                const response = await fetch(`${API}/api/products/${editProduct._id}`, {
                                    method: 'PUT',
                                    headers: getAuthHeaders(),
                                    body: formData
                                });
                                if (response.ok) {
                                    toast({ title: 'Success', description: 'Product updated successfully' });
                                    setShowEditProduct(false);
                                    setEditProduct(null);
                                    fetchData();
                                    fetchCategoriesAndStartups();
                                } else {
                                    let errorMsg = 'Failed to update product';
                                    try {
                                        const errData = await response.json();
                                        if (errData && errData.message) errorMsg = errData.message + (errData.error ? ': ' + errData.error : '');
                                    } catch { }
                                    toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
                                }
                            } catch (err) {
                                toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
                            }
                        }} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Product Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editProduct.name}
                                    onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editProduct.description}
                                    onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select
                                        value={editProduct.category}
                                        onValueChange={value => setEditProduct({ ...editProduct, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-newCategory">New Category</Label>
                                    <Input
                                        id="edit-newCategory"
                                        placeholder="Add new category"
                                        value={editProduct.newCategory}
                                        onChange={e => setEditProduct({ ...editProduct, newCategory: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-startup">Startup</Label>
                                    <Select
                                        value={editProduct.startup}
                                        onValueChange={value => setEditProduct({ ...editProduct, startup: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select startup" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {startups.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-newStartup">New Startup</Label>
                                    <Input
                                        id="edit-newStartup"
                                        placeholder="Add new startup"
                                        value={editProduct.newStartup}
                                        onChange={e => setEditProduct({ ...editProduct, newStartup: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-quantity">Quantity</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="edit-quantity"
                                            type="number"
                                            value={editProduct.quantity}
                                            onChange={e => setEditProduct({ ...editProduct, quantity: e.target.value })}
                                            className="flex-1"
                                        />
                                        <Select
                                            value={editProduct.quantityUnit || 'kg'}
                                            onValueChange={value => setEditProduct({ ...editProduct, quantityUnit: value })}
                                        >
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">kg</SelectItem>
                                                <SelectItem value="g">g</SelectItem>
                                                <SelectItem value="piece">piece</SelectItem>
                                                <SelectItem value="litre">litre</SelectItem>
                                                <SelectItem value="ml">ml</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="edit-price">Price</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="edit-price"
                                            type="number"
                                            value={editProduct.price}
                                            onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                                            className="flex-1"
                                        />
                                        <Select
                                            value={editProduct.priceUnit || '₹'}
                                            onValueChange={value => setEditProduct({ ...editProduct, priceUnit: value })}
                                        >
                                            <SelectTrigger className="w-16">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="₹">₹</SelectItem>
                                                <SelectItem value="$">$</SelectItem>
                                                <SelectItem value="€">€</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="edit-contactName">Contact Name</Label>
                                    <Input
                                        id="edit-contactName"
                                        value={editProduct.contact.name}
                                        onChange={e => setEditProduct({
                                            ...editProduct,
                                            contact: { ...editProduct.contact, name: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                                    <Input
                                        id="edit-contactPhone"
                                        value={editProduct.contact.phone}
                                        onChange={e => setEditProduct({
                                            ...editProduct,
                                            contact: { ...editProduct.contact, phone: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <Label htmlFor="edit-contactEmail">Contact Email</Label>
                                    <Input
                                        id="edit-contactEmail"
                                        type="email"
                                        value={editProduct.contact.email}
                                        onChange={e => setEditProduct({
                                            ...editProduct,
                                            contact: { ...editProduct.contact, email: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-image">Product Image</Label>
                                <Input
                                    id="edit-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file && file.size > 2 * 1024 * 1024) {
                                            toast({ title: 'Error', description: 'Image must be less than 2MB', variant: 'destructive' });
                                            e.target.value = '';
                                            return;
                                        }
                                        setEditProduct({ ...editProduct, image: file });
                                    }}
                                />
                                {typeof editProduct.image === 'string' && editProduct.image && (
                                    <img src={editProduct.image} alt="Current" className="mt-2 h-24 object-contain rounded" />
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                                <Button type="submit" className="w-full sm:flex-1">Update Product</Button>
                                <Button type="button" variant="outline" onClick={() => { setShowEditProduct(false); setEditProduct(null); }} className="w-full sm:flex-1">Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Startup Modal */}
            {showAddStartup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg sm:text-xl font-bold mb-6">Add New Startup</h2>
                        <form onSubmit={handleAddStartup} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div>
                                <Label htmlFor="focusArea">Focus Area</Label>
                                <Input id="focusArea" name="focusArea" required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" required />
                            </div>
                            <div>
                                <Label htmlFor="contactName">Contact Name</Label>
                                <Input id="contactName" name="contact.name" required />
                            </div>
                            <div>
                                <Label htmlFor="contactPhone">Contact Phone</Label>
                                <Input id="contactPhone" name="contact.phone" required />
                            </div>
                            <div>
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input id="contactEmail" name="contact.email" required />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                                <Button type="submit" className="w-full sm:flex-1">Add Startup</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAddStartup(false)} className="w-full sm:flex-1">Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Startup Modal */}
            {showEditStartup && editStartup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg sm:text-xl font-bold mb-6">Edit Startup</h2>
                        <form onSubmit={handleEditStartup} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" name="name" defaultValue={editStartup.name} required />
                            </div>
                            <div>
                                <Label htmlFor="edit-focusArea">Focus Area</Label>
                                <Input id="edit-focusArea" name="focusArea" defaultValue={editStartup.focusArea} required />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea id="edit-description" name="description" defaultValue={editStartup.description} required />
                            </div>
                            <div>
                                <Label htmlFor="edit-contactName">Contact Name</Label>
                                <Input id="edit-contactName" name="contact.name" defaultValue={editStartup.contact?.name} required />
                            </div>
                            <div>
                                <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                                <Input id="edit-contactPhone" name="contact.phone" defaultValue={editStartup.contact?.phone} required />
                            </div>
                            <div>
                                <Label htmlFor="edit-contactEmail">Contact Email</Label>
                                <Input id="edit-contactEmail" name="contact.email" defaultValue={editStartup.contact?.email} required />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                                <Button type="submit" className="w-full sm:flex-1">Update Startup</Button>
                                <Button type="button" variant="outline" onClick={() => { setShowEditStartup(false); setEditStartup(null); }} className="w-full sm:flex-1">Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotifications && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                            <span className="font-semibold">Notifications</span>
                            <Button size="sm" variant="ghost" onClick={markAllNotificationsRead}>Mark all as read</Button>
                        </div>
                        {notifications.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">No notifications</div>
                        ) : (
                            notifications.map((n, i) => (
                                <div key={n._id || i} className={`px-4 py-3 border-b last:border-b-0 ${!n.read ? 'bg-yellow-50' : ''}`}>
                                    <div className="text-sm text-gray-800">{n.message}</div>
                                    <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Page Size Selection */}
            {tab === 'products' && (
                <div className="flex justify-end mb-4">
                    <label className="mr-2 font-medium">Products per page:</label>
                    <select value={productPageSize} onChange={e => { setProductPageSize(Number(e.target.value)); setProductPage(1); }} className="border rounded px-2 py-1">
                        {[10, 20, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Pagination Controls */}
            {tab === 'products' && (
                <div className="flex flex-col items-center mt-4 gap-2">
                    <div className="flex gap-2">
                        <Button disabled={productPage === 1} onClick={() => setProductPage(productPage - 1)}>Previous</Button>
                        {/* Page Numbers */}
                        {Array.from({ length: productTotalPages }, (_, i) => i + 1).map(num => (
                            <Button key={num} variant={num === productPage ? 'default' : 'outline'} onClick={() => setProductPage(num)}>{num}</Button>
                        ))}
                        <Button disabled={productPage === productTotalPages} onClick={() => setProductPage(productPage + 1)}>Next</Button>
                    </div>
                    <span className="px-4 py-2">Page {productPage} of {productTotalPages}</span>
                </div>
            )}
        </div>
    );
} 
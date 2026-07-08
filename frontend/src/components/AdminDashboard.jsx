import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Check, RefreshCw, ShoppingBag, Shield, LogOut, ArrowLeft, TrendingUp, BarChart2, DollarSign } from 'lucide-react';
import { api } from '../utils/api.js';

export default function AdminDashboard({ onClose, onProductsUpdated, onLogout, currentUser }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for CRUD
  const [isEditing, setIsEditing] = useState(false); // false | 'creating' | 'updating'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Serums',
    image: '',
    ingredients: '',
    benefits: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch admin data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const prodData = await api.getProducts();
      setProducts(prodData);
      
      const ordData = await api.getAdminOrders();
      setOrders(ordData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartCreate = () => {
    setIsEditing('creating');
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Serums',
      image: '',
      ingredients: '',
      benefits: ''
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleStartUpdate = (product) => {
    setIsEditing('updating');
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      ingredients: product.ingredients,
      benefits: product.benefits
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setFormError("Price must be a valid positive number");
      return;
    }

    try {
      if (isEditing === 'creating') {
        await api.createProduct(formData);
        setFormSuccess("Product successfully created!");
      } else {
        await api.updateProduct(editingId, formData);
        setFormSuccess("Product successfully updated!");
      }

      setTimeout(() => {
        setIsEditing(false);
        fetchData();
        onProductsUpdated();
      }, 1000);
    } catch (err) {
      setFormError(err.message || "Failed to save product.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      fetchData();
      onProductsUpdated();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  // --- ANALYTICS COMPUTATIONS ---
  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? (totalRevenue / paidOrders.length) : 0;

  // Process sales grouped by the last 7 calendar days
  const getSalesTrend = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        rawDate: d.toDateString(),
        amount: 0
      });
    }

    paidOrders.forEach(o => {
      const orderDateStr = new Date(o.createdAt).toDateString();
      const matched = days.find(day => day.rawDate === orderDateStr);
      if (matched) {
        matched.amount += parseFloat(o.amount);
      }
    });

    return days;
  };

  const salesTrend = getSalesTrend();
  const maxSalesVal = Math.max(...salesTrend.map(d => d.amount), 100); // base scale

  // Graph Layout coordinates
  const graphWidth = 680;
  const graphHeight = 240;
  const paddingX = 50;
  const paddingY = 30;

  const points = salesTrend.map((day, idx) => {
    const x = paddingX + (idx * (graphWidth - 2 * paddingX) / 6);
    const y = graphHeight - paddingY - (day.amount / maxSalesVal * (graphHeight - 2 * paddingY));
    return { x, y, amount: day.amount, label: day.label };
  });

  const linePath = points.length > 0 
    ? points.reduce((path, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${graphHeight - paddingY} L ${points[0].x} ${graphHeight - paddingY} Z`
    : '';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* --- FOCUSED ADMIN NAVBAR --- */}
      <nav className="admin-nav">
        {/* Brand with Admin indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.6rem', 
            fontWeight: 600,
            letterSpacing: '0.05em' 
          }}>
            Rose Bud
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            backgroundColor: 'var(--accent-rose)',
            color: '#FFF',
            padding: '4px 8px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Shield size={10} /> Atelier Admin
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button 
            className="admin-nav-tab-btn"
            style={{
              color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-light)',
              borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-rose)' : '2px solid transparent',
            }}
            onClick={() => { setActiveTab('analytics'); setIsEditing(false); }}
          >
            Analytics Overview
          </button>
          <button 
            className="admin-nav-tab-btn"
            style={{
              color: activeTab === 'products' ? 'var(--text-primary)' : 'var(--text-light)',
              borderBottom: activeTab === 'products' ? '2px solid var(--accent-rose)' : '2px solid transparent',
            }}
            onClick={() => { setActiveTab('products'); setIsEditing(false); }}
          >
            Manage Catalog
          </button>
          <button 
            className="admin-nav-tab-btn"
            style={{
              color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-light)',
              borderBottom: activeTab === 'orders' ? '2px solid var(--accent-rose)' : '2px solid transparent',
            }}
            onClick={() => { setActiveTab('orders'); setIsEditing(false); }}
          >
            Client Orders
          </button>
        </div>

        {/* Admin actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onClick={onLogout}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </nav>

      {/* --- SIDEBAR PANEL CONTENT --- */}
      <div className="admin-body">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {isEditing ? (
            /* CRUD Editor Form */
            <div className="glass" style={{ padding: '40px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>
                  {isEditing === 'creating' ? "Create New Product" : "Edit Skincare Product"}
                </h3>
                <button className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>

              {formError && <div style={{ color: '#E02424', backgroundColor: '#FDF2F2', padding: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>⚠️ {formError}</div>}
              {formSuccess && <div style={{ color: 'var(--success-color)', backgroundColor: 'rgba(93, 122, 104, 0.1)', padding: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>✓ {formSuccess}</div>}

              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Rose Glow Essence" />
                  </div>
                  <div className="form-group" style={{ maxWidth: '200px' }}>
                    <label className="form-label">Price (INR)</label>
                    <input type="text" name="price" required value={formData.price} onChange={handleInputChange} className="form-input" placeholder="1590" />
                  </div>
                  <div className="form-group" style={{ maxWidth: '200px' }}>
                    <label className="form-label">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="sort-select" style={{ width: '100%' }}>
                      <option value="Mists">Mists</option>
                      <option value="Serums">Serums</option>
                      <option value="Masks">Masks</option>
                      <option value="Oils">Oils</option>
                      <option value="Creams">Creams</option>
                      <option value="Lips">Lips</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input type="url" name="image" required value={formData.image} onChange={handleInputChange} className="form-input" placeholder="https://images.unsplash.com/photo-..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} className="form-input" rows={2} placeholder="Summary of skin benefits and product texture..." />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Key Benefits</label>
                    <textarea name="benefits" required value={formData.benefits} onChange={handleInputChange} className="form-input" rows={2} placeholder="E.g., Plumps skin, brightens dark spots..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Ingredients List</label>
                    <textarea name="ingredients" required value={formData.ingredients} onChange={handleInputChange} className="form-input" rows={2} placeholder="E.g., Rose water, Hyaluronic acid, Vitamin E..." />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {isEditing === 'creating' ? "Publish Product" : "Save Changes"}
                </button>
              </form>
            </div>
          ) : (
            <>
              {activeTab === 'analytics' && (
                /* --- ANALYTICS DASHBOARD TAB WITH LINEGRAPH --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  
                  {/* Statistics Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    <div className="glass" style={{ padding: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-rose)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Earnings</span>
                        <h4 style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '2px' }}>₹{totalRevenue}</h4>
                      </div>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-rose)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</span>
                        <h4 style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '2px' }}>{paidOrders.length} Completed</h4>
                      </div>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-rose)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Ticket Value</span>
                        <h4 style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '2px' }}>₹{avgOrderValue.toFixed(0)}</h4>
                      </div>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-rose)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart2 size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog Items</span>
                        <h4 style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '2px' }}>{products.length} Products</h4>
                      </div>
                    </div>
                  </div>

                  {/* LINEGRAPH SALES TREND BLOCK */}
                  <div className="glass" style={{ padding: '40px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)' }}>Sales Trends</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily revenue tracking over the last 7 calendar days.</p>
                    </div>

                    {/* SVG Line Graph Container */}
                    <div style={{ width: '100%', overflowX: 'auto', paddingTop: '10px' }}>
                      <svg 
                        viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
                        style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
                      >
                        <defs>
                          {/* Linear Gradient for Graph Area Fill */}
                          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-rose)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--accent-rose)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Y-Axis Grid Helper Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = paddingY + (ratio * (graphHeight - 2 * paddingY));
                          const valLabel = Math.round(maxSalesVal - (ratio * maxSalesVal));
                          return (
                            <g key={i}>
                              <line 
                                x1={paddingX} 
                                y1={y} 
                                x2={graphWidth - paddingX} 
                                y2={y} 
                                stroke="var(--border-color)" 
                                strokeDasharray="4 4" 
                                strokeWidth={1}
                              />
                              <text 
                                x={paddingX - 10} 
                                y={y + 4} 
                                fontSize="9" 
                                fill="var(--text-light)" 
                                textAnchor="end"
                                fontFamily="monospace"
                              >
                                ₹{valLabel}
                              </text>
                            </g>
                          );
                        })}

                        {/* Area Polygon Fill */}
                        {points.length > 1 && (
                          <path 
                            d={areaPath} 
                            fill="url(#graphGradient)" 
                          />
                        )}

                        {/* Stroke Trend Line */}
                        {points.length > 1 && (
                          <path 
                            d={linePath} 
                            fill="none" 
                            stroke="var(--accent-rose)" 
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Graph points & Labels */}
                        {points.map((p, idx) => (
                          <g key={idx}>
                            {/* Circle Dot marker */}
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={4.5} 
                              fill="var(--bg-primary)" 
                              stroke="var(--accent-rose)" 
                              strokeWidth={2}
                            />
                            {/* Hover tooltip label representation */}
                            {p.amount > 0 && (
                              <text 
                                x={p.x} 
                                y={p.y - 10} 
                                fontSize="9" 
                                fontWeight="600" 
                                fill="var(--accent-rose)" 
                                textAnchor="middle"
                              >
                                ₹{p.amount.toFixed(0)}
                              </text>
                            )}
                            {/* X-Axis day labels */}
                            <text 
                              x={p.x} 
                              y={graphHeight - 10} 
                              fontSize="9.5" 
                              fill="var(--text-light)" 
                              textAnchor="middle"
                            >
                              {p.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                /* --- MANAGE PRODUCTS GRID --- */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Catalog Size: {products.length} Products</span>
                    <button className="btn-primary flex-center" onClick={handleStartCreate} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      <Plus size={16} /> Add Product
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {products.map(p => (
                      <div 
                        key={p._id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '20px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-secondary)',
                          gap: '20px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexGrow: 1, minWidth: 0 }}>
                          <img src={p.image} alt={p.name} style={{ width: '60px', height: '70px', objectFit: 'cover', border: '1px solid var(--border-color)', borderRadius: '2px' }} />
                          <div style={{ minWidth: 0 }}>
                            <h4 style={{ fontSize: '1.3rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}</h4>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                              {p.category} — ₹{p.price}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            className="btn-outline flex-center" 
                            onClick={() => handleStartUpdate(p)}
                            style={{ padding: '10px', color: 'var(--text-secondary)' }}
                            aria-label="Edit product"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-outline flex-center" 
                            onClick={() => handleDelete(p._id)}
                            style={{ padding: '10px', color: '#E02424', borderColor: 'rgba(224, 36, 36, 0.2)' }}
                            aria-label="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                /* --- MANAGE ORDERS TABLE --- */
                <div>
                  <div style={{ marginBottom: '25px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>All Register Transactions: {orders.length}</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="flex-center glass" style={{ height: '300px', flexDirection: 'column', color: 'var(--text-light)', gap: '16px' }}>
                      <span style={{ fontSize: '2.5rem' }}>📦</span>
                      <h3>No Orders Registered</h3>
                      <p>Orders will show here once clients complete mock or Razorpay payments.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {orders.map(o => (
                        <div 
                          key={o.orderId} 
                          style={{ 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '4px',
                            padding: '24px',
                            backgroundColor: 'var(--bg-secondary)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <strong>Order Ref:</strong> <code style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{o.orderId}</code>
                            </div>
                            <div>
                              <strong>Payment ID:</strong> <code style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{o.paymentId || 'N/A'}</code>
                            </div>
                            <div>
                              <span style={{ 
                                color: '#FFF', 
                                backgroundColor: o.status === 'paid' ? 'var(--success-color)' : '#E02424',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}>
                                {o.status}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                            <div>
                              <h5 style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Customer & Shipping</h5>
                              <strong>{o.shippingDetails?.name}</strong> <br />
                              {o.shippingDetails?.email} <br />
                              {o.shippingDetails?.address}, {o.shippingDetails?.city} - {o.shippingDetails?.postalCode}
                            </div>

                            <div>
                              <h5 style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Items Summary</h5>
                              <ul style={{ paddingLeft: '16px' }}>
                                {o.items?.map((item, idx) => (
                                  <li key={idx}>
                                    {item.name} (x{item.quantity}) — ₹{item.price}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <h5 style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Total Earnings</h5>
                              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                                ₹{o.amount}
                              </span>
                              <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '6px' }}>
                                {new Date(o.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

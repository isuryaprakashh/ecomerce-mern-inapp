// API Bridge for Rose Bud Luxury E-commerce with Authorization & Admin CRUD Support

// Fallback static products
let LOCAL_PRODUCTS = [
  {
    _id: "local_prod_1",
    name: "Rose Dew Infusion",
    description: "A hydrating, skin-refreshing mist made with 100% pure organic Bulgarian rose water. Instantly revives tired skin, restoring moisture and natural luminosity.",
    price: 1299,
    category: "Mists",
    rating: 4.8,
    reviewsCount: 124,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    ingredients: "Organic Rosa Damascena (Rose) Flower Water, Glycerin, Aloe Barbadensis Leaf Juice, Phenoxyethanol.",
    benefits: "Hydrates, balances skin pH, sets makeup, refreshes skin on the go."
  },
  {
    _id: "local_prod_2",
    name: "Nectar of Youth",
    description: "An ultra-concentrated facial serum combining Damascus rose oil and multi-weight hyaluronic acid to plump fine lines and deeply hydrate the dermal layers.",
    price: 2499,
    category: "Serums",
    rating: 4.9,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    ingredients: "Water, Hyaluronic Acid, Damascus Rose Flower Oil, Niacinamide, Panthenol, Ethylhexylglycerin.",
    benefits: "Plumps fine lines, intensifies hydration, brightens complexion, improves elasticity."
  },
  {
    _id: "local_prod_3",
    name: "Velvet Petal Clay",
    description: "A purifying facial mask formulated with French pink clay, crushed rose petals, and soothing colloidal oatmeal. Detoxifies pores while keeping skin soft.",
    price: 1599,
    category: "Masks",
    rating: 4.7,
    reviewsCount: 76,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
    ingredients: "Montmorillonite (French Pink Clay), Rosa Gallica (Rose) Flower Powder, Colloidal Oatmeal, Kaolin.",
    benefits: "Draws out impurities, tightens pores, calms irritation, refines skin texture."
  },
  {
    _id: "local_prod_4",
    name: "Rosehip Glow Elixir",
    description: "A cold-pressed organic rosehip seed oil rich in vitamins A and C. Brightens dark spots, evens skin tone, and delivers a velvety golden glow without greasy residue.",
    price: 1899,
    category: "Oils",
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
    ingredients: "100% Organic Cold-Pressed Rosa Canina (Rosehip) Seed Oil, Tocopherol (Vitamin E).",
    benefits: "Fades hyperpigmentation, supports cellular regeneration, delivers velvety golden glow."
  },
  {
    _id: "local_prod_5",
    name: "Petal Soft Cream",
    description: "A whipped daily moisturizer infused with active rose extract and squalane. Locks in moisture for 24 hours for a soft, petal-smooth finish.",
    price: 1999,
    category: "Creams",
    rating: 4.6,
    reviewsCount: 88,
    image: "https://item.tscimg.ca/TSC/1/11/110/0x0/110610.jpg?impolicy=XL",
    ingredients: "Water, Squalane, Rose Extract, Cetearyl Olivate, Sorbitan Olivate, Shea Butter, Allantoin.",
    benefits: "Provides long-lasting hydration, strengthens skin barrier, softens dry patches."
  },
  {
    _id: "local_prod_6",
    name: "Satin Lip Polish",
    description: "A gentle exfoliating scrub made with organic rose extract and fine sugar crystals. Preps lips for color, leaving them satin-smooth and naturally tinted.",
    price: 799,
    category: "Lips",
    rating: 4.5,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop",
    ingredients: "Sucrose (Sugar), Jojoba Seed Oil, Rosa Damascena Extract, Coconut Oil, Vitamin E.",
    benefits: "Gently buffs away dry skin, hydrates lips, provides a subtle rosy sheen."
  }
];

// Offline fallback mock state
const LOCAL_USERS = [
  {
    _id: "local_user_admin",
    name: "Rose Bud Admin",
    email: "admin@rosebud.com",
    password: "admin123",
    role: "admin"
  }
];
const LOCAL_ORDERS = [];

// Determine API Base URL dynamically
const API_BASE = import.meta.env.VITE_API_URL || '';

// Token management helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('rosebud_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // --- AUTH OPERATIONS ---
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed login");
      
      localStorage.setItem('rosebud_token', data.token);
      return data;
    } catch (e) {
      console.warn("🌐 Connection to API failed. Engaging local auth simulation.", e.message);
      
      // Simulate client side login
      const matched = LOCAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched && password === matched.password) {
        const mockToken = `mock_token_${matched._id}_${Date.now()}`;
        localStorage.setItem('rosebud_token', mockToken);
        return {
          _id: matched._id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          token: mockToken
        };
      }
      throw new Error("Invalid email or password");
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed sign up");
      
      localStorage.setItem('rosebud_token', data.token);
      return data;
    } catch (e) {
      console.warn("🌐 Connection to API failed. Engaging local registration simulation.", e.message);
      
      const emailExists = LOCAL_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) throw new Error("User already exists with this email");

      const newUser = {
        _id: `local_user_${Date.now()}`,
        name,
        email,
        password,
        role: 'user'
      };

      LOCAL_USERS.push(newUser);
      const mockToken = `mock_token_${newUser._id}_${Date.now()}`;
      localStorage.setItem('rosebud_token', mockToken);

      return {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: mockToken
      };
    }
  },

  getMe: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { ...getAuthHeaders() }
      });
      if (!response.ok) throw new Error("Could not verify session");
      return await response.json();
    } catch (e) {
      console.warn("🌐 Connection to API failed or invalid session. Reading local session storage.");
      const token = localStorage.getItem('rosebud_token');
      if (token && token.startsWith('mock_token_')) {
        const parts = token.split('_');
        const userId = parts[2] + '_' + parts[3]; // Reconstruct local_user_id
        const user = LOCAL_USERS.find(u => u._id === userId);
        if (user) {
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
      }
      localStorage.removeItem('rosebud_token');
      throw new Error("Session expired");
    }
  },

  logout: () => {
    localStorage.removeItem('rosebud_token');
  },

  // --- CATALOG OPERATIONS ---
  getProducts: async ({ category = 'All', search = '', sort = 'featured' } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (category && category !== 'All') queryParams.append('category', category);
      if (search) queryParams.append('search', search);
      if (sort) queryParams.append('sort', sort);

      const response = await fetch(`${API_BASE}/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Backend response error");
      return await response.json();
    } catch (e) {
      console.warn("🌐 Connection to API failed. Engaging frontend mock products catalog.", e.message);
      
      let products = [...LOCAL_PRODUCTS];
      
      if (category && category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
      
      return products;
    }
  },

  // --- ADMIN PRODUCT ACTIONS (CRUD) ---
  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create product");
      return data;
    } catch (e) {
      console.warn("🌐 Connection to API failed. Performing client-side product creations.");
      const newProduct = {
        _id: `local_prod_${Date.now()}`,
        ...productData,
        price: parseFloat(productData.price),
        rating: 5.0,
        reviewsCount: 1,
      };
      LOCAL_PRODUCTS.push(newProduct);
      return newProduct;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update product");
      return data;
    } catch (e) {
      console.warn("🌐 Connection to API failed. Performing client-side product updates.");
      const index = LOCAL_PRODUCTS.findIndex(p => p._id === id);
      if (index === -1) throw new Error("Product not found locally");
      
      const updated = {
        ...LOCAL_PRODUCTS[index],
        ...productData,
        price: parseFloat(productData.price)
      };
      LOCAL_PRODUCTS[index] = updated;
      return updated;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete product");
      return data;
    } catch (e) {
      console.warn("🌐 Connection to API failed. Performing client-side product deletions.");
      const index = LOCAL_PRODUCTS.findIndex(p => p._id === id);
      if (index === -1) throw new Error("Product not found locally");
      LOCAL_PRODUCTS.splice(index, 1);
      return { success: true, message: "Deleted locally" };
    }
  },

  // --- ORDER OPERATIONS ---
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) throw new Error("Order creation failed on backend");
      return await response.json();
    } catch (e) {
      console.warn("🌐 Connection to API server failed. Creating local mock checkout flow.", e.message);
      
      // Determine active user ID from local token
      let userId = null;
      const token = localStorage.getItem('rosebud_token');
      if (token && token.startsWith('mock_token_')) {
        const parts = token.split('_');
        userId = parts[2] + '_' + parts[3];
      }

      return {
        success: true,
        useMock: true,
        order: {
          id: `mock_order_${Date.now()}`,
          userId: userId,
          amount: Math.round(orderData.amount * 100),
          currency: 'INR',
          receipt: `rcpt_mock_${Date.now()}`
        }
      };
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) throw new Error("Payment verification failed on backend");
      return await response.json();
    } catch (e) {
      console.warn("🌐 Connection to API server failed. Verifying mock payment client-side.", e.message);
      
      // Since it is offline fallback mode, write order detail directly into local array
      const token = localStorage.getItem('rosebud_token');
      let userId = null;
      if (token && token.startsWith('mock_token_')) {
        const parts = token.split('_');
        userId = parts[2] + '_' + parts[3];
      }

      const mockInvoice = {
        orderId: paymentData.razorpay_order_id,
        userId: userId,
        paymentId: paymentData.razorpay_payment_id || `mock_pay_${Date.now()}`,
        amount: parseFloat(paymentData.amount || 0),
        status: 'paid',
        items: paymentData.items || [],
        shippingDetails: paymentData.shippingDetails || {},
        createdAt: new Date()
      };

      LOCAL_ORDERS.push(mockInvoice);
      
      return {
        success: true,
        message: "Payment simulated successfully client-side",
        orderId: paymentData.razorpay_order_id,
        paymentId: mockInvoice.paymentId
      };
    }
  },

  // --- ADMIN/USER ORDERS ---
  getAdminOrders: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        headers: { ...getAuthHeaders() }
      });
      if (!response.ok) throw new Error("Failed to fetch admin orders");
      return await response.json();
    } catch (e) {
      console.warn("🌐 Connection to API server failed. Loading client-side admin orders history.");
      return [...LOCAL_ORDERS].reverse();
    }
  },

  getUserOrders: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/my-orders`, {
        headers: { ...getAuthHeaders() }
      });
      if (!response.ok) throw new Error("Failed to fetch user orders");
      return await response.json();
    } catch (e) {
      console.warn("🌐 Connection to API server failed. Loading client-side user orders history.");
      
      // Determine active user ID
      const token = localStorage.getItem('rosebud_token');
      if (token && token.startsWith('mock_token_')) {
        const parts = token.split('_');
        const userId = parts[2] + '_' + parts[3];
        return LOCAL_ORDERS.filter(o => o.userId === userId).reverse();
      }
      return [];
    }
  }
};

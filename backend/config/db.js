import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

let isMongoConnected = false;

// Default seed products to use if database is empty or connection fails
export const seedProducts = [
  {
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
    name: "Rosehip Glow Elixir",
    description: "A cold-pressed organic rosehip seed oil rich in vitamins A and C. Brightens dark spots, evens skin tone, and delivers a velvety golden glow without greasy residue.",
    price: 1899,
    category: "Oils",
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
    ingredients: "100% Organic Cold-Pressed Rosa Canina (Rosehip) Seed Oil, Tocopherol (Vitamin E).",
    benefits: "Fades hyperpigmentation, supports cellular regeneration, deeply nourishes skin barrier."
  },
  {
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

export const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.warn("⚠️ MONGODB_URI is not defined in env. Running in MEMORY-ONLY mode.");
    isMongoConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(dbUri);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;

    // Seed database if empty
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedProducts);
      console.log("🌱 Database seeded with luxury Rose Bud products.");
    }

    // Seed default admin if none exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        name: 'Rose Bud Admin',
        email: 'admin@rosebud.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log("🌱 Database seeded with default admin: admin@rosebud.com / admin123");
    }
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log("⚠️ Running in MEMORY-ONLY fallback mode due to database connection failure.");
    isMongoConnected = false;
    return false;
  }
};

export const checkMongoConnection = () => isMongoConnected;

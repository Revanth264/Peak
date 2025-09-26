import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------------------------------------------
 Utilities & Hooks
------------------------------------------------------------------*/
const cls = (...xs) => xs.filter(Boolean).join(" ");
const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const useLocal = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [key, val]);
  return [val, setVal];
};

const parseHashQueryString = (hash, key) => {
  const i = (hash || "").indexOf("?");
  if (i === -1) return "";
  const p = new URLSearchParams(hash.slice(i + 1));
  return p.get(key) || "";
};
const getHashQuery = (key) => parseHashQueryString(window.location.hash, key);

const useRoute = () => {
  const [path, setPath] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setPath(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return [path, (p) => (window.location.hash = p)];
};

const useIntersectionObserver = (options) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(new IntersectionObserver(([entry]) => setEntry(entry), options));

  useEffect(() => {
    const { current: currentObserver } = observer;
    currentObserver.disconnect();

    if (node) currentObserver.observe(node);

    return () => currentObserver.disconnect();
  }, [node]);

  return [setNode, entry];
};

/* ----------------------------------------------------------------
 Data
------------------------------------------------------------------*/
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "figures", label: "Anime Figures", subCategories: ["Nendoroid", "Scale Figures", "Prize Figures"] },
  { id: "metal", label: "Metal Prints", subCategories: ["Shonen", "Cyberpunk", "Fantasy"] },
  { id: "apparel", label: "Apparel", subCategories: ["T-Shirts", "Hoodies", "Caps"] },
  { id: "merch", label: "Anime Merch", subCategories: ["Pins", "Stickers", "Keychains"] },
];

const MOCK_PRODUCTS = [
  // Anime Figures (7)
  {
    id: "f1",
    title: "Joy Warrior • 10cm Figure",
    price: 3499,
    rating: 4.8,
    inStock: true,
    category: "figures",
    subCategory: "Nendoroid",
    images: ["https://images.unsplash.com/photo-1546778313-bbaf8fcf2d1b?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1613431352419-bf953a33930b?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1611933613283-a75d35da362a?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1549422240-1da0a887a05a?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1604942325992-07b8b7913303?q=80&w=1200&auto=format&fit=crop"],
    hotspots: [{ x: '55%', y: '30%', text: 'Hand-painted metallic finish' }, { x: '40%', y: '70%', text: 'Dynamic flowing cape' }]
  },
  {
    id: "f2",
    title: "Sea Empress • 12cm Figure",
    price: 3999,
    rating: 4.7,
    inStock: true,
    category: "figures",
    subCategory: "Scale Figures",
    images: ["https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=1200&auto=format&fit=crop"],
  },
  { id: "f3", title: "Shadow Ninja • 15cm Figure", price: 4999, rating: 4.9, inStock: true, category: "figures", subCategory: "Scale Figures", images: ["https://images.unsplash.com/photo-1608889476518-738c92f14184?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1534775853821-e24397969a5a?q=80&w=1200&auto=format&fit=crop"] },
  { id: "f4", title: "Cosmic Guardian • Prize Figure", price: 2499, rating: 4.5, inStock: true, category: "figures", subCategory: "Prize Figures", images: ["https://images.unsplash.com/photo-1566576912381-de05e3532b48?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1636572331336-2af88521889a?q=80&w=1200&auto=format&fit=crop"] },
  { id: "f5", title: "Forest Spirit • Nendoroid", price: 3199, rating: 4.6, inStock: false, category: "figures", subCategory: "Nendoroid", images: ["https://images.unsplash.com/photo-1578632204528-91a704301114?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1578632204528-91a704301114?q=80&w=1200&auto=format&fit=crop"] },
  { id: "f6", title: "Mecha Pilot • 1/7 Scale", price: 8999, rating: 5.0, inStock: true, category: "figures", subCategory: "Scale Figures", images: ["https://images.unsplash.com/photo-1531993202325-16d4826bac0b?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1618998129841-33165b53443a?q=80&w=1200&auto=format&fit=crop"] },
  { id: "f7", title: "Casual Hero • Prize Figure", price: 2199, rating: 4.3, inStock: true, category: "figures", subCategory: "Prize Figures", images: ["https://images.unsplash.com/photo-1508341591423-43470441f51c?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1508341591423-43470441f51c?q=80&w=1200&auto=format&fit=crop"] },

  // Metal Prints (5)
  {
    id: "m1",
    title: "Eclipse Dragon • Metal Print",
    price: 2999,
    rating: 4.6,
    inStock: false,
    category: "metal",
    subCategory: "Fantasy",
    images: ["https://images.unsplash.com/photo-1520975682031-ae5dbd6799dc?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1520975682031-ae5dbd6799dc?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    id: "m2",
    title: "Neon City • Metal Print",
    price: 4499,
    rating: 4.9,
    inStock: true,
    category: "metal",
    subCategory: "Cyberpunk",
    images: ["https://images.unsplash.com/photo-1512850183-6d7990f42385?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1512850183-6d7990f42385?q=80&w=1200&auto=format&fit=crop"],
  },
  { id: "m3", title: "Crimson Samurai • Metal Print", price: 3499, rating: 4.8, inStock: true, category: "metal", subCategory: "Shonen", images: ["https://images.unsplash.com/photo-1610208156854-a45b7337583a?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1610208156854-a45b7337583a?q=80&w=1200&auto=format&fit=crop"] },
  { id: "m4", title: "Floating Castle • Metal Print", price: 3999, rating: 4.7, inStock: true, category: "metal", subCategory: "Fantasy", images: ["https://images.unsplash.com/photo-1600305591986-7c1c2055152b?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1600305591986-7c1c2055152b?q=80&w=1200&auto=format&fit=crop"] },
  { id: "m5", title: "Glitch Tech • Metal Print", price: 3199, rating: 4.5, inStock: true, category: "metal", subCategory: "Cyberpunk", images: ["https://images.unsplash.com/photo-1555431182-0c18404a7e93?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1555431182-0c18404a7e93?q=80&w=1200&auto=format&fit=crop"] },
  
  // Apparel (6)
  {
    id: "a1",
    title: "Peakime Mono Tee",
    price: 1299,
    rating: 4.5,
    inStock: true,
    category: "apparel",
    subCategory: "T-Shirts",
    images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    id: "a2",
    title: "Katana Hoodie (Black)",
    price: 2499,
    rating: 4.7,
    inStock: true,
    category: "apparel",
    subCategory: "Hoodies",
    images: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"],
  },
  { id: "a3", title: "Oni Demon Tee", price: 1399, rating: 4.6, inStock: true, category: "apparel", subCategory: "T-Shirts", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop"] },
  { id: "a4", title: "Kitsune Mask Hoodie", price: 2599, rating: 4.8, inStock: true, category: "apparel", subCategory: "Hoodies", images: ["https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop"] },
  { id: "a5", title: "Anime Club Cap", price: 899, rating: 4.4, inStock: true, category: "apparel", subCategory: "Caps", images: ["https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1200&auto=format&fit=crop"] },
  { id: "a6", title: "Ramen Lover Tee", price: 1299, rating: 4.9, inStock: true, category: "apparel", subCategory: "T-Shirts", images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop"] },

  // Anime Merch (5)
  {
    id: "x1",
    title: "Enamel Pin Set • 5 pc",
    price: 799,
    rating: 4.4,
    inStock: true,
    category: "merch",
    subCategory: "Pins",
    images: ["https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    id: "x2",
    title: "Holo Sticker Pack • 12 pc",
    price: 499,
    rating: 4.3,
    inStock: true,
    category: "merch",
    subCategory: "Stickers",
    images: ["https://images.unsplash.com/photo-1588628566587-dbd17676b9cb?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1588628566587-dbd17676b9cb?q=80&w=1200&auto=format&fit=crop"],
  },
  { id: "x3", title: "Chibi Character Keychains", price: 599, rating: 4.7, inStock: true, category: "merch", subCategory: "Keychains", images: ["https://images.unsplash.com/photo-1611606013254-0329ef349b1a?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1611606013254-0329ef349b1a?q=80&w=1200&auto=format&fit=crop"] },
  { id: "x4", title: "Legendary Sword Pin", price: 399, rating: 4.8, inStock: true, category: "merch", subCategory: "Pins", images: ["https://images.unsplash.com/photo-1508482209041-333a3885f833?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1508482209041-333a3885f833?q=80&w=1200&auto=format&fit=crop"] },
  { id: "x5", title: "Manga Panel Sticker Set", price: 549, rating: 4.6, inStock: true, category: "merch", subCategory: "Stickers", images: ["https://images.unsplash.com/photo-1613740203058-70183e8741e5?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1613740203058-70183e8741e5?q=80&w=1200&auto=format&fit=crop"] },
];

/* ----------------------------------------------------------------
 Recommendation Algorithm Hook
------------------------------------------------------------------*/
const useUserActivity = () => {
  const [activity, setActivity] = useLocal("pk_user_activity", {
    viewedProducts: [], // Stores {id, category, subCategory}
  });

  const logProductView = (product) => {
    if (!product) return;
    setActivity(prev => {
      const newView = { id: product.id, category: product.category, subCategory: product.subCategory };
      const updatedViews = [newView, ...prev.viewedProducts.filter(p => p.id !== product.id)].slice(0, 20);
      return { ...prev, viewedProducts: updatedViews };
    });
  };

  const getRecommendations = (count = 4) => {
    const { viewedProducts } = activity;

    if (viewedProducts.length === 0) {
      return MOCK_PRODUCTS.slice().sort((a, b) => b.rating - a.rating).slice(0, count);
    }

    const interestProfile = viewedProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      acc[p.subCategory] = (acc[p.subCategory] || 0) + 2;
      return acc;
    }, {});

    const viewedIds = new Set(viewedProducts.map(p => p.id));

    const recommended = MOCK_PRODUCTS
      .filter(p => !viewedIds.has(p.id))
      .map(p => {
        const score = (interestProfile[p.category] || 0) + (interestProfile[p.subCategory] || 0);
        return { ...p, relevanceScore: score };
      })
      .filter(p => p.relevanceScore > 0)
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.rating - a.rating;
      });

    return recommended.slice(0, count);
  };

  return { logProductView, getRecommendations, hasActivity: activity.viewedProducts.length > 0 };
};

/* ----------------------------------------------------------------
 Header helpers
------------------------------------------------------------------*/
function NavLink({ to, label, path, onClick, ...props }) {
  const active = path === to || (to !== "#/" && path.startsWith(to));
  return (
    <a
      href={to}
      onClick={onClick}
      className={cls(
        "relative px-2 py-2 text-[15px] transition-colors group",
        active ? "text-black font-semibold" : "text-black/70 hover:text-black"
      )}
      {...props}
    >
      <span>{label}</span>
      <span className={cls(
        "absolute left-2 right-2 -bottom-[2px] h-[2px] rounded bg-black transition-transform duration-300",
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      )} style={{ transformOrigin: 'center' }} />
    </a>
  );
}

function ProfileMenu({ user, onLogout, points }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 100);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      ref={ref}
      className="relative z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href="#/account"
        className="flex items-center gap-1 text-sm text-black/70 hover:text-black bg-transparent transition-colors"
        title="Account"
      >
        <span>Hi, {user?.name || "Guest"}</span>
        <span className="text-[18px]" aria-hidden>
          👤
        </span>
      </a>

      <div
        className={cls(
          "absolute right-0 mt-1 w-56 rounded-2xl border border-black/10 bg-white shadow-xl p-2 z-50 transition-all duration-200",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="px-3 py-2">
            <div className="text-xs text-black/60">Peak Points</div>
            <div className="font-semibold text-lg">{points}</div>
        </div>
        <div className="h-px bg-black/10 my-1"/>
        <a href="#/account?tab=profile" className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">
          Profile
        </a>
        <a href="#/account?tab=addresses" className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">
          Saved Addresses
        </a>
        <a href="#/account?tab=orders" className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">
          Orders
        </a>
        <a href="#/wishlist" className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">
          Wishlist
        </a>
        {user ? (
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            Logout
          </button>
        ) : (
          <a href="#/login" className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">
            Login / Register
          </a>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 DESKTOP-ONLY: Apple-style Mega Menu (auto-sized dropdown)
------------------------------------------------------------------*/
function StoreMegaMenu({ open, setOpen }) {
  const menuData = [
    {
      heading: "Shop by Category",
      links: [
        { label: "Shop All Products", isTitle: true, id: "all" },
        { label: "Anime Figures", isTitle: true, id: "figures" },
        { label: "Metal Prints", isTitle: true, id: "metal" },
        { label: "Apparel", isTitle: true, id: "apparel" },
        { label: "Collectibles & Merch", isTitle: true, id: "merch" },
      ],
    },
    {
      heading: "Quick Links",
      links: [
        { label: "Track Your Order", href: "#/account?tab=orders", icon: "📦" },
        { label: "New Arrivals", id: "all", icon: "✨" },
        { label: "Best Sellers", id: "all", icon: "🔥" },
        { label: "Contact Support", href: "#/contact", icon: "💬" },
      ],
    },
    { heading: "Featured Drop", product: MOCK_PRODUCTS[0] },
  ];

  const go = (id) => {
    localStorage.setItem("pk_store_cat", id);
    window.dispatchEvent(new CustomEvent("category-change"));
    window.location.hash = "#/store";
    setOpen(false);
  };

  return (
    <div
      className={cls(
        "hidden md:flex fixed left-0 right-0 top-14 z-40 justify-center transition-all duration-300 ease-in-out",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cls(
          "w-full max-w-6xl rounded-2xl border border-neutral-800",
          "bg-neutral-900/95 shadow-2xl px-8 py-8"
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8">
          {menuData.map((col, i) => (
            <div
              key={col.heading}
              className={cls(
                "transition-all duration-300 ease-in-out",
                open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
                col.heading === "Shop by Category" ? "md:col-span-2" : "",
                i > 0 && "md:border-l md:border-neutral-800 md:pl-8"
              )}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <h3 className="text-xs font-semibold text-neutral-400 mb-6 uppercase tracking-wider">{col.heading}</h3>

              {col.links && (
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href || "#/store"}
                        onClick={(e) => {
                          if (link.id) { e.preventDefault(); go(link.id); }
                          else { setOpen(false); }
                        }}
                        className={cls(
                          "flex items-center gap-3 transition-colors duration-200 group",
                          link.isTitle
                            ? "text-lg font-semibold text-white/90 hover:text-white"
                            : "text-sm text-neutral-300 hover:text-white"
                        )}
                      >
                        {link.icon && (
                            <span className={cls("text-lg transition-transform", link.icon === '📦' ? 'group-hover:animate-wiggle' : 'group-hover:scale-110')}>{link.icon}</span>
                        )}
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {col.product && (
                <a
                  href="#/store"
                  onClick={(e) => { e.preventDefault(); go(col.product.category); }}
                  className="group block"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-3">
                    <img
                      src={col.product.images[0]}
                      alt={col.product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                    {col.product.title}
                  </h4>
                  <p className="text-sm text-neutral-300">{currency(col.product.price)}</p>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 TopBar
------------------------------------------------------------------*/
function TopBar({ path, cartCount, wishlistCount, user, setUser, onSearch, storeOpen, setStoreOpen, handleStoreMouseEnter, handleStoreMouseLeave, points, cartJiggle }) {
  const [openSearch, setOpenSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [q, setQ] = useState("");
  const modalRef = useRef(null);
  const [recent, setRecent] = useLocal("pk_recent_searches", []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenSearch(true);
      }
      if (e.key === "Escape") {
        setOpenSearch(false);
        setMobileMenu(false);
        setStoreOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setStoreOpen]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = openSearch || mobileMenu || storeOpen ? "hidden" : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openSearch, mobileMenu, storeOpen]);

  useEffect(() => {
    if (!openSearch) return;
    const onDown = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpenSearch(false);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [openSearch]);

  const submit = () => {
    const term = q.trim();
    if (!term) return setOpenSearch(false);
    setRecent((prev) => {
      const next = [term, ...prev.filter((x) => x.toLowerCase() !== term.toLowerCase())];
      return next.slice(0, 8);
    });
    setOpenSearch(false);
    window.location.hash = `#/store?q=${encodeURIComponent(term)}`;
    onSearch?.(term);
  };

  const logout = () => {
    localStorage.removeItem("pk_user");
    setUser(null);
    window.location.hash = "#/";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/85 border-b border-black/5 font-inter">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center">
          <div className="flex-1 flex items-center">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 -ml-2 hover:bg-black/5 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={cls("h-0.5 bg-black transition-all duration-300", mobileMenu && "rotate-45 translate-y-1.5")}></span>
                <span className={cls("h-0.5 bg-black transition-all duration-300", mobileMenu && "opacity-0")}></span>
                <span className={cls("h-0.5 bg-black transition-all duration-300", mobileMenu && "-rotate-45 -translate-y-1.5")}></span>
              </div>
            </button>

            <button
              onClick={() => (window.location.hash = "#/")}
              className="font-semibold tracking-tight text-[18px] md:text-lg hover:opacity-80 bg-transparent transition-opacity"
              aria-label="Peakime Home"
            >
              Peakime
            </button>

            <nav className="hidden md:flex items-center gap-2 relative ml-8">
              <NavLink to="#/" label="Home" path={path} />
              <div
                onMouseEnter={handleStoreMouseEnter}
                onMouseLeave={handleStoreMouseLeave}
                className="relative inline-flex"
              >
                <NavLink
                  to="#/store"
                  label="Store"
                  path={path}
                  onClick={() => setStoreOpen(false)}
                />
                <StoreMegaMenu open={storeOpen} setOpen={setStoreOpen} />
              </div>
              <NavLink to="#/media" label="Media" path={path} />
              <NavLink to="#/blog" label="Blog" path={path} />
              <NavLink to="#/careers" label="Careers" path={path} />
              <NavLink to="#/contact" label="Contact" path={path} />
              <NavLink to="#/community" label="Community" path={path} />
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpenSearch(true)}
              className="p-0 m-0 bg-transparent hover:opacity-80 focus:outline-none transition-all active:scale-90 hover:scale-110"
              aria-label="Search"
              title="Search"
            >
              <span className="text-[18px] leading-none select-none">🔍</span>
            </button>

            {user ? (
              <ProfileMenu user={user} onLogout={logout} points={points} />
            ) : (
              <a className="text-sm underline hover:no-underline" href="#/login">
                Login / Register
              </a>
            )}

            <a href="#/wishlist" className="relative px-2 py-1 text-sm rounded-lg hover:bg-black/5 transition-colors">
              <span aria-hidden>♡</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-black text-white rounded-full px-1.5 py-0.5 animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </a>

            <a href="#/cart" className="relative px-2 py-1 text-sm rounded-lg hover:bg-black/5 transition-colors" aria-label="Cart">
              <span className={cls("transition-transform duration-300 inline-block", cartJiggle && "animate-cart-jiggle")}>🛍️</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-black text-white rounded-full px-1.5 py-0.5 animate-pulse">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>

      <div className={cls(
        "md:hidden absolute top-14 left-0 right-0 bg-white border-b border-black/5 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        mobileMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <nav className="p-4 space-y-2">
          <a href="#/" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Home</a>
          <a href="#/store" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Store</a>
          <a href="#/media" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Media</a>
          <a href="#/blog" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Blog</a>
          <a href="#/careers" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Careers</a>
          <a href="#/contact" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Contact</a>
          <a href="#/community" onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg hover:bg-black/5 transition-colors">Community</a>
        </nav>
      </div>

      {openSearch && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-24 animate-fadeIn z-[60]" role="dialog" aria-modal>
          <div
            ref={modalRef}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-black/10 animate-slideDown"
          >
            <div className="p-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && submit()}
                  placeholder="Search products, posts…"
                  className="w-full outline-none text-lg px-3 py-2 rounded-xl bg-black/5"
                />
                <kbd className="text-xs text-black/50">Esc</kbd>
              </div>
            </div>
            {recent.length > 0 && (
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wide text-black/50">Recent searches</div>
                  <button onClick={() => setRecent([])} className="text-xs underline text-black/50 hover:text-black">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pb-2">
                  {recent.map((r, i) => (
                    <a
                      key={i}
                      href={`#/store?q=${encodeURIComponent(r)}`}
                      className="px-3 py-1.5 rounded-full border text-sm hover:bg-black/5 transition-colors"
                    >
                      {r}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs text-black/50">Tip: try "figure", "hoodie", "metal print"…</span>
              <button onClick={() => setOpenSearch(false)} className="text-sm px-3 py-1 rounded-lg border hover:bg-black/5">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ----------------------------------------------------------------
 Store
------------------------------------------------------------------*/
function ProductCard({ p, onAdd, onFav, favd, onOpen, onQuickView }) {
  const [beat, setBeat] = useState(false);
  const [added, setAdded] = useState(false);
  const cardRef = useRef(null);

  const handleFavClick = () => {
    onFav(p);
    if (!favd) {
      setBeat(true);
      setTimeout(() => setBeat(false), 400);
    }
  };
  
  const handleAddClick = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    const rotateY = (x / (width / 2)) * 10;
    const rotateX = -(y / (height / 2)) * 10;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }

  return (
    <div 
      ref={cardRef}
      className="group border border-black/10 rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-lg product-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative overflow-hidden" >
        <button className="w-full aspect-[4/3]" onClick={() => onOpen(p)}>
          <img
            src={p.images[0]}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </button>
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onQuickView(p)}
            title="Quick View"
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-black shadow-md hover:bg-white transition-colors flex items-center justify-center"
          >
            👁️
          </button>
          <button
            onClick={handleFavClick}
            title="Wishlist"
            className={cls(
              "w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors flex items-center justify-center",
              favd ? "text-red-500" : "text-black hover:bg-white",
              beat && "animate-beat"
            )}
          >
            {favd ? "♥" : "♡"}
          </button>
        </div>
      </div>
      <div className="p-3" >
        <button onClick={() => onOpen(p)} className="text-sm text-left font-medium hover:underline line-clamp-1">
          {p.title}
        </button>
        <div className="flex items-center justify-between pt-1">
          <div className="text-base font-semibold">{currency(p.price)}</div>
          <StarRating rating={p.rating} reviewCount={p.reviews?.length || 0} />
        </div>
        {p.inStock ? (
          <button onClick={handleAddClick} className="w-full mt-2 text-sm px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 transition-all active:scale-95 btn-shine">
            {added ? 'Added ✓' : 'Add to Cart' }
          </button>
        ) : (
          <button disabled className="w-full mt-2 text-sm px-3 py-2 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed">
            Out of Stock
          </button>
        )}

      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden bg-white p-2">
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg shimmer" />
      <div className="p-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 shimmer" />
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3 shimmer" />
        <div className="h-9 bg-gray-200 rounded-xl w-full shimmer" />
      </div>
    </div>
  );
}

function ImageLightbox({ src, onClose }) {
    useEffect(() => {
      const handleEsc = (e) => {
          if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!src) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center animate-fadeIn"
        onClick={onClose}
      >
        <img 
          src={src} 
          alt="Enlarged product view" 
          className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain animate-scaleIn" 
          onClick={(e) => e.stopPropagation()}
        />
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl hover:opacity-75 transition-opacity">&times;</button>
      </div>
    );
}

function RecommendationSection({ title, products, onOpen }) {
  if (!products || products.length === 0) return null;
  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map(product => (
          <a key={product.id} href={`#/store`} onClick={(e) => { e.preventDefault(); onOpen(product); }} className="group text-left">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <p className="text-xs mt-2 truncate font-medium">{product.title}</p>
            <p className="text-xs font-semibold">{currency(product.price)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function ProductDetail({ p, onClose, onAdd, onFav, favd, on360View, reviews, onProductSelect }) {
  const productReviews = useMemo(() => {
    if (!p) return [];
    return reviews.filter(r => r.productId === p.id);
  }, [p, reviews]);

  const [lightboxImage, setLightboxImage] = useState(null);

  const similarProducts = useMemo(() => {
    if (!p) return [];
    return MOCK_PRODUCTS.filter(
      (prod) => prod.category === p.category && prod.id !== p.id
    ).slice(0, 4);
  }, [p]);

  const recommendedProducts = useMemo(() => {
    if (!p) return [];
    const otherCategories = MOCK_PRODUCTS.filter(
      (prod) => prod.category !== p.category && prod.id !== p.id
    );
    return otherCategories
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [p]);

  if (!p) return null;

  return (
    <>
    <div
      className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-[60] animate-fadeIn"
      role="dialog"
      aria-modal
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/10 animate-slideDown max-h-[90vh]">
        <div className="grid md:grid-cols-2">
          <div className="relative group">
            <img 
                src={p.images[0]} 
                alt={p.title} 
                className="w-full h-96 object-cover md:h-full max-h-[560px] cursor-zoom-in" 
                onClick={() => setLightboxImage(p.images[0])}
            />
            {p.hotspots && p.hotspots.map((h, i) => (
              <div key={i} className="absolute group" style={{ top: h.y, left: h.x }}>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse cursor-pointer"/>
                <div className="absolute bottom-full mb-2 w-max p-2 text-xs bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {h.text}
                </div>
              </div>
            ))}
            {p.images.length > 1 && (
              <button onClick={() => on360View(p)} className="absolute bottom-4 right-4 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm text-black shadow-md hover:bg-white transition-colors text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
                360° View
              </button>
            )}
          </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[560px]">
            <h3 className="text-2xl font-semibold tracking-tight animate-stagger" style={{animationDelay: '100ms'}}>{p.title}</h3>
            <div className="text-black/70 text-sm animate-stagger" style={{animationDelay: '150ms'}}>Category: {CATEGORIES.find((c) => c.id === p.category)?.label}</div>
            <div className="text-3xl font-semibold animate-stagger" style={{animationDelay: '200ms'}}>{currency(p.price)}</div>
            <p className="text-sm text-black/70 leading-relaxed animate-stagger" style={{animationDelay: '250ms'}}>
              Designed with premium materials. Limited-run drop curated for collectors. Ships in 3–5 days.
            </p>
            <div className="flex gap-2 pt-2 animate-stagger" style={{animationDelay: '300ms'}}>
              <button onClick={() => onAdd(p)} className="flex-1 text-sm px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 active:scale-95 transition-transform">
                Add to Cart
              </button>
              <button
                onClick={() => onFav(p)}
                className={cls("px-4 py-3 rounded-xl border text-sm transition active:scale-95", favd ? "bg-black text-white" : "hover:bg-black/5")}
              >
                {favd ? "Added" : "Wishlist"}
              </button>
            </div>
            <div className="border-t pt-4 animate-stagger" style={{animationDelay: '350ms'}}>
              <h4 className="font-semibold mb-2">Customer Reviews ({productReviews.length})</h4>
              {productReviews.length > 0 ? (
                <div className="space-y-4">
                  {productReviews.map((r, i) => (
                    <div key={i} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} />
                        <span className="font-medium text-sm">{r.author}</span>
                      </div>
                      <p className="text-sm mt-2 text-black/80">"{r.comment}"</p>
                      {r.images && r.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {r.images.map((img, idx) => <img key={idx} src={img} className="w-20 h-20 object-cover rounded-lg" alt="User review"/>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-black/60">No reviews yet.</p>}
            </div>
            <div className="animate-stagger" style={{animationDelay: '400ms'}}><RecommendationSection title="Similar Products" products={similarProducts} onOpen={onProductSelect} /></div>
            <div className="animate-stagger" style={{animationDelay: '450ms'}}><RecommendationSection title="You Might Also Like" products={recommendedProducts} onOpen={onProductSelect} /></div>
            <button onClick={onClose} className="text-sm underline mt-4 w-full text-center">Close</button>
          </div>
        </div>
      </div>
    </div>
    {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </>
  );
}

function StarRating({ rating, reviewCount, interactive=false, onRate, size='text-base' }) {
    return (
      <div className="flex items-center gap-1">
        <div className={cls("flex text-black/90", size)}>
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={cls(i < rating ? 'text-black' : 'text-gray-300', interactive && "cursor-pointer")}
              onClick={() => interactive && onRate(i + 1)}
            >★</span>
          ))}
        </div>
          {reviewCount !== undefined && <span className="text-xs text-black/60">({reviewCount})</span>}
      </div>
    );
}

function View360Modal({ product, onClose }) {
  const [imageIndex, setImageIndex] = useState(0);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const images = product?.images ?? [];
  const imageCount = images.length;

  useEffect(() => {
    setImageIndex(0);
  }, [product]);

  const getPageX = useCallback((event) => {
    if ("touches" in event && event.touches.length > 0) {
      return event.touches[0].pageX;
    }
    return event.pageX;
  }, []);

  const handleMouseDown = useCallback((event) => {
    isDragging.current = true;
    const pageX = getPageX(event);
    lastX.current = pageX;
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  }, [getPageX]);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging.current || imageCount === 0) return;
    const currentX = getPageX(event);
    const dx = currentX - lastX.current;

    if (Math.abs(dx) > 10) {
      setImageIndex((prev) => (prev + (dx > 0 ? -1 : 1) + imageCount) % imageCount);
      lastX.current = currentX;
    }
  }, [getPageX, imageCount]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  }, []);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return undefined;

    const moveHandler = (event) => handleMouseMove(event);
    const upHandler = () => handleMouseUp();

    currentRef.addEventListener("mousemove", moveHandler);
    currentRef.addEventListener("touchmove", moveHandler);
    window.addEventListener("mouseup", upHandler);
    window.addEventListener("touchend", upHandler);

    return () => {
      currentRef.removeEventListener("mousemove", moveHandler);
      currentRef.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
      window.removeEventListener("touchend", upHandler);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!product || imageCount === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[70] animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="relative select-none cursor-grab"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <img
          src={images[imageIndex]}
          alt={`${product.title} view ${imageIndex + 1}`}
          className="max-w-[80vw] max-h-[90vh] rounded-2xl"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {imageIndex + 1} / {imageCount}
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-2xl text-white/50">‹</div>
        <div className="absolute top-1/2 -translate-y-1/2 right-4 text-2xl text-white/50">›</div>
      </div>
      <button onClick={onClose} className="mt-4 text-white/80 hover:text-white transition-colors">
        Close
      </button>
    </div>
  );
}

function StorePage({ query, wishlist, setWishlist, onAddToCart, reviews, logProductView }) {
  const [active, setActive] = useState("all");
  const [detail, setDetail] = useState(null);
  const [quickView, setQuickView] = useState(null);
  const [view360, setView360] = useState(null);
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCategoryChange = () => {
      const saved = localStorage.getItem("pk_store_cat");
      if (saved) {
        setActive(saved);
        if (window.location.hash.includes('?q=')) {
            window.location.hash = '#/store';
        }
        localStorage.removeItem("pk_store_cat");
      }
    };

    handleCategoryChange();
    window.addEventListener('category-change', handleCategoryChange);
    return () => window.removeEventListener('category-change', handleCategoryChange);
  }, []);

  const toggleFav = (p) =>
    setWishlist((prev) => (prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]));

  useEffect(() => {
    if (query) setActive("all");
  }, [query]);

  const products = useMemo(() => {
    let list = [...MOCK_PRODUCTS];
    if (active !== "all") list = list.filter((p) => p.category === active);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [active, query, sort]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [active, query, sort]);

  const handleProductSelect = (product) => {
    setDetail(null);
    setQuickView(null);
    setTimeout(() => {
        setDetail(product);
        logProductView(product);
    }, 100);
  }
  
  const openDetail = (product) => {
    setDetail(product);
    logProductView(product);
  }
  
  const openQuickView = (product) => {
    setQuickView(product);
    logProductView(product);
  }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-left">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Store</h1>
            <p className="text-sm text-black/60 mt-1">Curated anime figures, metal prints, apparel, and collectibles.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
              <option value="featured">Featured</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-left">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={cls(
                "px-4 py-2 rounded-full text-sm border transition-all hover:scale-105 active:scale-100",
                active === c.id ? "bg-black text-white shadow-lg" : "hover:bg-black/5 hover:border-black/30"
              )}
            >
              {c.label}
            </button>
          ))}
          {query && <span className="ml-auto text-sm text-black/60">Search results for "{query}"</span>}
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            products.map((p, i) => (
              <div key={p.id} className="animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard
                  p={p}
                  onOpen={openDetail}
                  onQuickView={openQuickView}
                  onAdd={onAddToCart}
                  onFav={toggleFav}
                  favd={!!wishlist.find((w) => w.id === p.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <ProductDetail
        p={detail}
        reviews={reviews}
        onProductSelect={handleProductSelect}
        onClose={() => setDetail(null)}
        on360View={(pp) => { setDetail(null); setView360(pp); }}
        onAdd={onAddToCart}
        onFav={toggleFav}
        favd={detail && !!wishlist.find((w) => w.id === detail.id)}
      />
      <ProductDetail
        p={quickView}
        reviews={reviews}
        onProductSelect={handleProductSelect}
        onClose={() => setQuickView(null)}
        on360View={(pp) => { setQuickView(null); setView360(pp); }}
        onAdd={onAddToCart}
        onFav={toggleFav}
        favd={quickView && !!wishlist.find((w) => w.id === quickView.id)}
      />
      {view360 && <View360Modal product={view360} onClose={() => setView360(null)} />}
    </main>
  );
}

/* ----------------------------------------------------------------
 Wishlist, Cart, Checkout, Address Form
------------------------------------------------------------------*/
function WishlistPage({ wishlist, setWishlist, onAddToCart }) {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-6 text-left">Wishlist</h1>
        {wishlist.length === 0 ? (
          <p className="text-black/60 text-left">Your wishlist is empty.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((p, i) => (
              <div key={p.id} className="border rounded-2xl overflow-hidden animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <img src={p.images[0]} alt="" className="w-full aspect-[4/3] object-cover" />
                <div className="p-3">
                  <div className="font-medium text-sm line-clamp-2">{p.title}</div>
                  <div className="text-sm text-black/70 mt-1">{currency(p.price)}</div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onAddToCart(p)} className="flex-1 text-sm px-3 py-2 rounded-xl bg-black text-white active:scale-95 transition-transform">
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setWishlist((prev) => prev.filter((x) => x.id !== p.id))}
                      className="px-3 py-2 rounded-xl border text-sm active:scale-95 transition-transform"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CartPage({ cart, setCart }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = cart.length ? 149 : 0;
  const total = subtotal + shipping;
  const setQty = (id, newQty) => {
    if (newQty < 1) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
    }
  };

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-6 text-left">Your Bag</h1>
        {cart.length === 0 ? (
          <p className="text-black/60 text-left">Your bag is empty.</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((i, idx) => (
                <div key={i.id} className="flex gap-4 border rounded-2xl p-3 items-center animate-stagger" style={{ animationDelay: `${idx * 80}ms` }}>
                  <img src={i.images[0]} alt="" className="w-28 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-black/60">{currency(i.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="w-9 h-9 rounded-full border text-lg">-</button>
                    <div className="w-8 text-center">{i.qty}</div>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="w-9 h-9 rounded-full border text-lg">+</button>
                  </div>
                  <button onClick={() => setCart((prev) => prev.filter((x) => x.id !== i.id))} className="px-3 py-2 rounded-xl border">Remove</button>
                </div>
              ))}
            </div>
            <aside className="border rounded-2xl p-4 h-fit space-y-3">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Shipping</span><span>{currency(shipping)}</span></div>
              <div className="h-px bg-black/10" />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{currency(total)}</span></div>
              <a href="#/checkout" className="block text-center mt-3 px-4 py-3 rounded-xl bg-black text-white">Checkout</a>
              <p className="text-xs text-black/60">Demo checkout. Connect your payment provider here.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function AddressForm({ onCancel, onSave, setToast }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  const save = () => {
    if (!name || !phone || !line1 || !city || !state || !pin) {
      setToast({ message: "Please fill all required fields.", type: 'error' });
      return;
    }
    onSave({ name, phone, line1, line2, city, state, pin });
  };
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="bg-black/5 rounded-xl p-3" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="bg-black/5 rounded-xl p-3" />
      <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Address line 1" className="bg-black/5 rounded-xl p-3 sm:col-span-2" />
      <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Address line 2 (optional)" className="bg-black/5 rounded-xl p-3 sm:col-span-2" />
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="bg-black/5 rounded-xl p-3" />
      <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="bg-black/5 rounded-xl p-3" />
      <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN code" className="bg-black/5 rounded-xl p-3" />
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border">Cancel</button>
        <button onClick={save} className="px-4 py-2 rounded-xl bg-black text-white">Save address</button>
      </div>
    </div>
  );
}

function CheckoutPage({ cart, setCart, points, setPoints, setToast }) {
  const [addresses, setAddresses] = useLocal("pk_addresses", []);
  const [selected, setSelected] = useState(addresses[0]?.id || null);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [usePoints, setUsePoints] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = cart.length ? 149 : 0;
  const pointsDiscount = usePoints ? Math.min(points, subtotal * 0.1) : 0;
  const total = subtotal + shipping - pointsDiscount;

  const placeOrder = () => {
    if (addresses.length > 0 && !selected) {
      setToast({ message: "Please select a delivery address.", type: 'error' });
      return;
    }
    if (addresses.length === 0 && !adding) {
      setToast({ message: "Please add a delivery address first.", type: 'error' });
      return;
    }
    const addr = addresses.find((a) => a.id === selected);
    const order = {
      id: `PK-${Date.now()}`,
      items: cart,
      total,
      address: addr,
      ts: Date.now(),
      status: 'Delivered', // Simulate delivered status
    };
    localStorage.setItem("pk_last_order", JSON.stringify(order));
    const prev = JSON.parse(localStorage.getItem("pk_orders") || "[]");
    localStorage.setItem("pk_orders", JSON.stringify([order, ...prev]));
    setCart([]);
    if(usePoints) setPoints(p => p - pointsDiscount);
    setPoints(p => p + Math.floor(total / 100)); // Earn points on purchase
    window.location.hash = "#/order-success";
  };

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            <div className="border rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Delivery address</h2>
                {!adding && (<button onClick={() => setAdding(true)} className="text-sm underline">Add new</button>)}
              </div>
              {addresses.length === 0 && !adding && <p className="text-sm text-black/60">No addresses yet.</p>}
              {addresses.length > 0 && !adding && (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label key={a.id} className="flex gap-3 items-start border rounded-xl p-3 hover:bg-black/5 cursor-pointer">
                      <input type="radio" name="addr" checked={selected === a.id} onChange={() => setSelected(a.id)} className="mt-1" />
                      <div>
                        <div className="font-medium">{a.name} · {a.phone}</div>
                        <div className="text-sm text-black/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {adding && (<AddressForm onCancel={() => setAdding(false)} onSave={(addr) => { const a = { ...addr, id: crypto.randomUUID() }; const next = [...addresses, a]; setAddresses(next); setSelected(a.id); setAdding(false); }} setToast={setToast} />)}
            </div>

            <div className="border rounded-2xl p-4 bg-white">
              <h2 className="text-lg font-semibold mb-3">Items</h2>
              <div className="space-y-3">
                {cart.map((i) => (
                  <div key={i.id} className="flex gap-3 items-center">
                    <img src={i.images[0]} alt="" className="w-16 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{i.title}</div>
                      <div className="text-xs text-black/60">Qty {i.qty}</div>
                    </div>
                    <div className="text-sm">{currency(i.price * i.qty)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="border rounded-2xl p-4 h-fit space-y-3">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{currency(shipping)}</span></div>
            {points > 0 && (
            <div className="flex justify-between text-sm items-center pt-2">
              <label htmlFor="points" className="flex items-center gap-2">
                <input type="checkbox" id="points" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} /> Use {points} Peak Points
              </label>
              <span className="text-green-600">-{currency(pointsDiscount)}</span>
            </div>
            )}
            <div className="h-px bg-black/10" />
            <div className="flex justify-between font-semibold"><span>Total</span><span>{currency(total)}</span></div>
            <button onClick={placeOrder} className="w-full mt-3 px-4 py-3 rounded-xl bg-black text-white">Place Order</button>
            <p className="text-xs text-black/60">Demo checkout. Connect your payment provider here.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Confetti() {
    return Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="confetti" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          backgroundColor: ['#fde047', '#f97316', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 4)],
        }} />
    ));
}

function OrderSuccessPage() {
  const [loading, setLoading] = useState(true);
  const order = (() => {
    try {
      return JSON.parse(localStorage.getItem("pk_last_order") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative w-full px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
      <div className="max-w-7xl">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <svg className="animate-spin h-10 w-10 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-black/60">Finalizing your order...</p>
            </div>
        ) : (
            <div className="animate-fadeInUp">
                {order ? (
                    <>
                        <Confetti />
                        <h1 className="text-2xl font-semibold">Order placed successfully</h1>
                        <p className="text-black/60">Your order <b>{order.id}</b> is confirmed.</p>
                        <div className="mt-4 border rounded-2xl p-4 bg-white">
                            <div className="text-sm">Deliver to: {order.address ? `${order.address.name}, ${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} ${order.address.pin}` : "—"}</div>
                            <div className="text-sm mt-2">Total paid: {currency(order.total)}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-semibold">Order placed</h1>
                        <p className="text-black/60">Thank you!</p>
                    </>
                )}
                <div className="mt-6 flex gap-2">
                    <a href="#/store" className="px-4 py-2 rounded-xl border">Continue shopping</a>
                    <a href="#/" className="px-4 py-2 rounded-xl bg-black text-white">Go to Home</a>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}

function LoginPage({ onLogin, setToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'demo@peakime.com' && password === 'password') {
      onLogin({ name: 'Demo User', email: 'demo@peakime.com' });
      window.location.hash = '#/account?tab=profile';
      setToast({ message: 'Login successful!', type: 'success' });
    } else {
      setToast({ message: 'Invalid email or password.', type: 'error' });
    }
  };

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto p-8 border rounded-2xl bg-white shadow-lg animate-fadeInUp">
        <h1 className="text-2xl font-semibold tracking-tight mb-4 text-left">Login</h1>
        <p className="text-sm text-black/60 mb-6 text-left">Use demo@peakime.com / password to log in.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl border bg-black/5 focus:outline-none focus:border-black transition-colors"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border bg-black/5 focus:outline-none focus:border-black transition-colors"
            required
          />
          <button type="submit" className="w-full px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 transition-opacity">
            Log In
          </button>
        </form>
        <p className="text-left text-sm mt-4 text-black/60">
          Don't have an account? <a href="#/register" className="underline hover:no-underline">Sign up here</a>
        </p>
      </div>
    </main>
  );
}

function RegisterPage({ onRegister, setToast }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        // Mock registration logic
        if (name && email && password) {
            onRegister({ name, email });
            window.location.hash = '#/login';
            setToast({ message: 'Registration successful! Please log in.', type: 'success' });
        } else {
            setToast({ message: 'Please fill out all fields.', type: 'error' });
        }
    };

    return (
        <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-md mx-auto p-8 border rounded-2xl bg-white shadow-lg animate-fadeInUp">
                <h1 className="text-2xl font-semibold tracking-tight mb-4 text-left">Register</h1>
                <p className="text-sm text-black/60 mb-6 text-left">Create a new account</p>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl border bg-black/5 focus:outline-none focus:border-black transition-colors"
                        required
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 rounded-xl border bg-black/5 focus:outline-none focus:border-black transition-colors"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-xl border bg-black/5 focus:outline-none focus:border-black transition-colors"
                        required
                    />
                    <button type="submit" className="w-full px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 transition-opacity">
                        Register
                    </button>
                </form>
                <p className="text-left text-sm mt-4 text-black/60">
                    Already have an account? <a href="#/login" className="underline hover:no-underline">Log in here</a>
                </p>
            </div>
        </main>
    );
}


/* ----------------------------------------------------------------
 Account & Review System
------------------------------------------------------------------*/
function ReviewFormModal({ product, user, onClose, onSaveReview, setToast }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imagePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        Promise.all(imagePromises).then(base64Images => {
            setImages(prev => [...prev, ...base64Images].slice(0, 3)); // Limit to 3 images
        });
    };

    const handleSubmit = () => {
        if (rating === 0 || comment.trim() === "") {
            setToast({ message: "Please provide a rating and a comment.", type: 'error' });
            return;
        }
        const review = {
            id: crypto.randomUUID(),
            productId: product.id,
            author: user?.name || "Anonymous",
            rating,
            comment,
            images,
            timestamp: new Date().toISOString(),
        };
        onSaveReview(review);
    };

    return (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-[70] animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 animate-slideDown">
                <h3 className="text-lg font-semibold mb-2 text-left">Write a review for</h3>
                <p className="text-sm text-black/70 mb-4 text-left">{product.title}</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Your Rating</label>
                        <StarRating rating={rating} onRate={setRating} interactive size="text-2xl" />
                    </div>
                    <div>
                        <label htmlFor="comment" className="text-sm font-medium">Your Review</label>
                        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows="4" className="w-full mt-1 p-2 border rounded-lg bg-black/5" placeholder="What did you like or dislike?" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Upload Photos (optional)</label>
                        <div className="mt-1 p-4 border-2 border-dashed rounded-lg text-left">
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-sm"/>
                            <div className="flex gap-2 mt-2 justify-left">
                                {images.map((img, i) => <img key={i} src={img} className="w-20 h-20 object-cover rounded-md" alt="upload preview"/>)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg bg-black text-white">Submit Review</button>
                </div>
            </div>
        </div>
    );
}

function AccountPage({ user, setUser, setReviews, setToast }) {
  const tabQS = getHashQuery("tab");
  const [tab, setTab] = useState(tabQS || "profile");
  const [addresses, setAddresses] = useLocal("pk_addresses", []);
  const [adding, setAdding] = useState(false);
  const orders = JSON.parse(localStorage.getItem("pk_orders") || "[]");
  const [reviewingProduct, setReviewingProduct] = useState(null);

  useEffect(() => {
    const updateTabFromHash = () => {
      const nextTab = getHashQuery("tab");
      if (nextTab) setTab(nextTab);
    };

    updateTabFromHash();
    window.addEventListener("hashchange", updateTabFromHash);
    return () => window.removeEventListener("hashchange", updateTabFromHash);
  }, []);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    if(email === "") setIsEmailValid(true);
    else setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  }, [email]);

  const saveProfile = () => {
    if (!isEmailValid) {
        setToast({ message: "Please enter a valid email address.", type: 'error' });
        return;
    }
    const u = { name: name || "Guest", email };
    localStorage.setItem("pk_user", JSON.stringify(u));
    setUser(u);
    setToast({ message: "Profile saved successfully!", type: 'success' });
    window.location.hash = "#/account?tab=profile";
  };

  const logout = () => {
    localStorage.removeItem("pk_user");
    setUser(null);
    window.location.hash = "#/";
  };

  const handleSaveReview = (review) => {
    setReviews(prev => [...prev.filter(r => r.productId !== review.productId || r.author !== user?.name), review]);
    setReviewingProduct(null);
    setToast({ message: "Review submitted successfully!", type: 'success' });
  };

  const TabButton = ({ id, children }) => {
    const active = tab === id;
    return (
      <button onClick={() => { setTab(id); window.location.hash = `#/account?tab=${id}`; }} className={cls("px-3 py-2 rounded-lg text-sm transition-colors", active ? "bg-black text-white" : "hover:bg-black/5 text-black/80")}>
        {children}
      </button>
    );
  };
    
  const FormInput = ({ id, placeholder, value, onChange, type="text", isValid=true }) => (
    <div className="relative">
      <input 
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cls("peer w-full bg-black/5 rounded-xl p-3 pt-5 outline-none transition-all duration-300 ease-out focus:shadow-inner placeholder:text-transparent", !isValid && "border border-red-500")}
      />
      <label htmlFor={id} className="absolute left-3 top-1 text-xs text-black/50 transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">
        {placeholder}
      </label>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity">
        {value && isValid && <span className="text-green-500">✓</span>}
        {value && !isValid && <span className="text-red-500">!</span>}
      </div>
    </div>
  );

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-6 text-left">Account</h1>
        <div className="flex gap-2 mb-4 border-b pb-2">
          <TabButton id="profile">Profile</TabButton>
          <TabButton id="addresses">Addresses</TabButton>
          <TabButton id="orders">Orders</TabButton>
        </div>

        {tab === "profile" && (
          <div className="space-y-4 border rounded-2xl p-6 bg-white max-w-md animate-fadeInUp text-left">
            <FormInput id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <FormInput id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} isValid={isEmailValid} />
            <button onClick={saveProfile} className="w-full px-4 py-3 rounded-xl bg-black text-white disabled:opacity-50" disabled={!isEmailValid}>Save</button>
            <button type="button" onClick={logout} className="w-full px-4 py-3 rounded-xl border">Log out</button>
          </div>
        )}
        {tab === "addresses" && (<div className="border rounded-2xl p-6 bg-white animate-fadeInUp text-left"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Saved addresses</h2><button onClick={() => setAdding((s) => !s)} className="px-3 py-2 rounded-xl bg-black text-white text-sm">{adding ? "Close" : "+ Add Address"}</button></div>{adding && (<div className="mb-6"><AddressForm onCancel={() => setAdding(false)} onSave={(addr) => {const a = { ...addr, id: crypto.randomUUID() }; setAddresses((prev) => [a, ...prev]); setAdding(false);}} setToast={setToast} /></div>)}{addresses.length === 0 && !adding ? (<p className="text-sm text-black/60">No addresses saved yet.</p>) : (<div className="grid sm:grid-cols-2 gap-4">{addresses.map((a) => (<div key={a.id} className="border rounded-xl p-3"><div className="font-medium">{a.name} · {a.phone}</div><div className="text-sm text-black/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}</div><div className="flex justify-end mt-2"><button onClick={() => setAddresses((prev) => prev.filter((x) => x.id !== a.id))} className="px-3 py-1.5 rounded-lg border text-sm">Remove</button></div></div>))}</div>)}</div>)}
        {tab === "orders" && (
          <div className="border rounded-2xl p-6 bg-white animate-fadeInUp text-left">
              <h2 className="text-lg font-semibold mb-3">Your Orders</h2>
              {orders.length === 0 ? (<p className="text-sm text-black/60">You don't have any orders yet.</p>) : (
                  <div className="space-y-4">
                      {orders.map((o) => (
                          <div key={o.id} className="border rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                  <div className="font-medium">{o.id}</div>
                                  <div className="text-sm">{new Date(o.ts).toLocaleString()}</div>
                              </div>
                              <div className="space-y-2">
                                  {o.items.map(item => (
                                      <div key={item.id} className="flex justify-between items-center">
                                          <div className="flex items-center gap-3">
                                            <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded-md"/>
                                            <div>
                                              <p className="text-sm font-medium">{item.title}</p>
                                              <p className="text-xs text-black/60">{currency(item.price)}</p>
                                            </div>
                                          </div>
                                          {o.status === 'Delivered' && (
                                              <button onClick={() => setReviewingProduct(item)} className="text-sm px-3 py-1.5 rounded-lg border hover:bg-black/5">Write a Review</button>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        )}
        {reviewingProduct && <ReviewFormModal product={reviewingProduct} user={user} onClose={() => setReviewingProduct(null)} onSaveReview={handleSaveReview} setToast={setToast} />}
      </div>
    </main>
  );
}

/* ----------------------------------------------------------------
 Simple shells & Animated Components
------------------------------------------------------------------*/
function AnimatedSection({ children, direction = 'up' }) {
  const [ref, entry] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const directionClass = {
    up: 'translate-y-8',
    left: '-translate-x-8',
    right: 'translate-x-8'
  }[direction];

  return (
    <div ref={ref} className={cls("transition-all duration-700 ease-out", entry?.isIntersecting ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${directionClass}`)}>
      {children}
    </div>
  );
}

function HighlightOnScroll({ children }) {
    const [ref, entry] = useIntersectionObserver({ threshold: 0.8, triggerOnce: false });
    return (
      <p ref={ref} className={cls("relative transition-colors duration-500", entry?.isIntersecting && "text-black")}>
          <span className={cls("absolute top-0 left-0 w-full h-full bg-black/10 -z-10 transition-transform duration-700 ease-out", entry?.isIntersecting ? 'scale-y-100' : 'scale-y-0')} style={{transformOrigin: 'bottom'}}/>
          {children}
      </p>
    )
}

function EmptyShell({ title }) {
  const content = { Media: { subtitle: "Exclusive content, behind-the-scenes, and creator spotlights", items: [{ icon: "📹", title: "Featured Videos", desc: "Latest drops and showcases" },{ icon: "🎤", title: "Artist Interviews", desc: "Meet the creators" },{ icon: "📦", title: "Product Showcases", desc: "Behind the scenes" },{ icon: "🌟", title: "Community Highlights", desc: "Fan features and stories" }] }, Careers: { subtitle: "Join our team and help shape the future of anime retail", items: [{ icon: "💼", title: "Open Positions", desc: "Current opportunities" },{ icon: "🏢", title: "Company Culture", desc: "Life at Peakime" },{ icon: "🎁", title: "Benefits & Perks", desc: "What we offer" },{ icon: "🚀", title: "Growth Opportunities", desc: "Build your career" }] }, Contact: { subtitle: "Get in touch with our team for support or partnerships", items: [{ icon: "💬", title: "Customer Support", desc: "24/7 assistance" },{ icon: "🤝", title: "Business Inquiries", desc: "Partnership opportunities" },{ icon: "📢", title: "Press & Media", desc: "Media kit and contacts" },{ icon: "🎯", title: "Creator Partnerships", desc: "Collaborate with us" }] }};
  const pageContent = content[title] || { subtitle: "Content coming soon", items: [{ icon: "🔄", title: "Updates coming", desc: "Stay tuned" },{ icon: "⏳", title: "Check back later", desc: "Under development" },{ icon: "🛠️", title: "Under development", desc: "Building something great" },{ icon: "✨", title: "Stay tuned", desc: "Coming soon" }]};

  return (
    <main className="animated-bg w-full">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12 text-left">
            <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="text-black/60 text-lg mt-3">{pageContent.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {pageContent.items.map((item, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-black/10 hover:border-black/30 bg-white/50 hover:bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer animate-stagger" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-4"><div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div><div className="flex-1"><h3 className="text-lg font-semibold mb-1 group-hover:underline">{item.title}</h3><p className="text-sm text-black/60">{item.desc}</p></div><span className="text-black/20 group-hover:text-black/40 transition-colors">→</span></div>
              </div>
            ))}
          </div>
          <div className="p-8 rounded-2xl bg-black/5 text-left"><p className="text-sm text-black/50 mb-4">This section is under active development. Subscribe for updates.</p><div className="flex gap-2"><input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 rounded-xl bg-white border border-black/10 outline-none focus:border-black/30 transition-all" /><button className="px-6 py-2 rounded-xl bg-black text-white hover:opacity-90 hover:scale-105 transition-all">Notify Me</button></div></div>
        </div>
    </main>
  );
}

function BlogPostPage() {
    return (
      <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-left">Top 5 Figures of the Summer</h1>
          <p className="text-black/60 mb-8 text-left">This season's must-have collectibles for any serious fan.</p>
          <div className="prose lg:prose-lg max-w-none space-y-4">
              <HighlightOnScroll>Summer is always an exciting time for new drops, and this year is no exception. We've seen some incredible new figures hit the market. Here are our top picks available right here at Peakime.</HighlightOnScroll>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-left">1. Joy Warrior • 10cm Figure</h2>
              <div className="flex gap-4 items-start mb-4">
                <img src={MOCK_PRODUCTS[0].images[0]} alt={MOCK_PRODUCTS[0].title} className="w-48 rounded-lg" />
                <HighlightOnScroll>No collection is complete without the iconic Joy Warrior. Its dynamic pose and vibrant colors make it a true centerpiece. The attention to detail is something you have to see to believe.</HighlightOnScroll>
              </div>
              <a href="#/store" onClick={() => { localStorage.setItem("pk_store_cat", "figures"); window.dispatchEvent(new CustomEvent('category-change'));}} className="text-blue-600 hover:underline text-left">Shop Joy Warrior →</a>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-left">2. Sea Empress • 12cm Figure</h2>
              <HighlightOnScroll>The elegance of the Sea Empress figure is unmatched. From the flowing hair to the intricate details on her gown, this piece is a work of art. It's a limited run, so don't miss out.</HighlightOnScroll>
          </div>
        </div>
      </main>
    );
}

function CommunityNotice() {
  return (
    <main className="animated-bg w-full">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-left">
        <div className="max-w-3xl">
          <div className="text-6xl mb-6 animate-morph inline-block">🎌</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Something Special is Coming</h1>
          <p className="text-lg text-black/60 mt-4 mb-8">We're building an exclusive space for anime enthusiasts to connect, share, and discover</p>
          <div className="grid sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm"><div className="text-2xl mb-3">💬</div><h3 className="font-medium mb-2">Forums</h3><p className="text-sm text-black/60">Discuss latest releases and classics</p></div>
            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm"><div className="text-2xl mb-3">🎨</div><h3 className="font-medium mb-2">Creator Hub</h3><p className="text-sm text-black/60">Share your art and cosplay</p></div>
            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm"><div className="text-2xl mb-3">🏆</div><h3 className="font-medium mb-2">Events</h3><p className="text-sm text-black/60">Exclusive drops and competitions</p></div>
          </div>
          <div className="inline-flex gap-3 items-center px-6 py-3 rounded-full border border-black/10 bg-white"><span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-sm">Currently in development</span></div>
          <div className="mt-12"><p className="text-sm text-black/50 mb-4">Be the first to know when we launch</p><div className="flex gap-2 max-w-md"><input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-xl bg-white border border-black/10 outline-none focus:border-black/30" /><button className="px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 transition-opacity">Join Waitlist</button></div></div>
        </div>
      </div>
    </main>
  );
}

function HomePage({ getRecommendations, hasActivity }) {
  const featuredProducts = MOCK_PRODUCTS.slice(0, 4);
  const recommendedProducts = getRecommendations(4);
  const line1 = "Anime Culture,";
  const line2 = "Redefined";
  
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl">
        <div className="mb-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <div>
              {line1.split('').map((char, index) => (
                <span key={index} className="inline-block animate-letter-reveal" style={{ animationDelay: `${100 + index * 50}ms`}}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </div>
            <div>
              {line2.split('').map((char, index) => (
                <span key={index} className="inline-block animate-letter-reveal" style={{ animationDelay: `${100 + (line1.length + index) * 50}ms`}}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </div>
          </h1>
          <p className="text-xl text-black/60 max-w-2xl mx-auto mb-8 animate-fadeInUp" style={{ animationDelay: '800ms' }}>
            Premium collectibles, exclusive drops, and curated merchandise for true anime enthusiasts
          </p>
          <div className="flex gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '1000ms' }}>
            <a href="#/store" className="px-8 py-3 rounded-xl bg-black text-white hover:opacity-90 hover:scale-105 transition-all" onClick={() => localStorage.setItem("pk_store_cat", "all")}>Shop Collection</a>
            <a href="#/community" className="px-8 py-3 rounded-xl border border-black/20 hover:bg-black/5 hover:scale-105 transition-all">Join Community</a>
          </div>
        </div>

        <AnimatedSection direction="up">
          <section className="mb-24 text-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Featured Drops</h2>
              <a href="#/store" className="text-sm underline hover:no-underline" onClick={() => localStorage.setItem("pk_store_cat", "all")}>View all</a>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 [>_*]:min-w-0">
              {featuredProducts.map((p) => (
                <a key={p.id} href="#/store" className="group block min-w-0" onClick={() => localStorage.setItem("pk_store_cat", "all")}>
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl mb-3">
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                  </div>
                  <h3 className="font-medium group-hover:underline transition-all truncate">{p.title}</h3>
                  <p className="text-black/60">{currency(p.price)}</p>
                </a>
              ))}
            </div>
          </section>
        </AnimatedSection>
        
        <AnimatedSection>
        <section className="mb-24 text-left">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{hasActivity ? "Recommended for You" : "Best Sellers"}</h2>
            <a href="#/store" className="text-sm underline hover:no-underline" onClick={() => localStorage.setItem("pk_store_cat", "all")}>View all</a>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 [>_*]:min-w-0">
            {recommendedProducts.map((p) => (
              <a key={p.id} href="#/store" className="group block min-w-0" onClick={() => localStorage.setItem("pk_store_cat", "all")}>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl mb-3">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                </div>
                <h3 className="font-medium group-hover:underline transition-all truncate">{p.title}</h3>
                <p className="text-black/60">{currency(p.price)}</p>
              </a>
            ))}
          </div>
        </section>
        </AnimatedSection>

        <AnimatedSection direction="left">
          <section className="mb-24 text-left">
            <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <a key={cat.id} href="#/store" className="p-6 rounded-2xl border border-black/10 hover:border-black/30 hover:shadow-lg hover:-translate-y-1 transition-all text-left group relative overflow-hidden liquid-hover" onClick={() => localStorage.setItem("pk_store_cat", cat.id)}>
                  <span className="font-medium relative z-10">{cat.label}</span>
                </a>
              ))}
            </div>
          </section>
        </AnimatedSection>
        
        <AnimatedSection direction="right">
          <section className="text-center py-16 px-8 rounded-3xl bg-gradient-to-br from-black/5 to-transparent">
            <h2 className="text-2xl font-semibold mb-3">Stay in the Loop</h2>
            <p className="text-black/60 mb-6 max-w-md mx-auto">Get exclusive access to limited drops and community updates</p>
            <div className="flex gap-2 max-w-md mx-auto"><input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-xl bg-white border border-black/10 outline-none focus:border-black/30 transition-all" /><button className="px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 hover:scale-105 transition-all">Subscribe</button></div>
          </section>
        </AnimatedSection>
      </div>
    </main>
  );
}

function Toast({ toastInfo, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toastInfo) {
      setVisible(true);
      const timer = setTimeout(() => {setVisible(false);}, 3000);
      const dismissTimer = setTimeout(onDismiss, 3300);
      return () => { clearTimeout(timer); clearTimeout(dismissTimer); };
      }
  }, [toastInfo, onDismiss]);

  if (!toastInfo) return null;

  const color = toastInfo.type === 'error' ? 'bg-red-500' : 'bg-black';

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out" style={{opacity: visible ? 1 : 0, transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 20px)'}}>
      <div className={cls("relative flex items-center gap-4 text-white rounded-xl shadow-lg px-4 py-3 overflow-hidden", color)}>
        {toastInfo.item && <img src={toastInfo.item.images[0]} alt={toastInfo.item.title} className="w-12 h-12 object-cover rounded-md" />}
        <div>
          <div className="font-semibold">{toastInfo.message}</div>
          {toastInfo.item && <div className="text-sm text-neutral-300">{toastInfo.item.title}</div>}
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-white/30" style={{animation: 'toast-progress 3s linear forwards'}} />
      </div>
    </div>
  );
}

function MarqueeBanner() {
    return (
        <div className="bg-zinc-100 py-3 overflow-hidden">
            <div className="marquee-content flex gap-12">
                {Array.from({length: 4}).map((_, i) => (
                    <React.Fragment key={i}>
                        <span className="text-sm text-black/60 flex-shrink-0">Free Shipping on Orders Over ₹2000</span>
                        <span className="text-black/20">◆</span>
                        <span className="text-sm text-black/60 flex-shrink-0">New Metal Prints Available Now</span>
                        <span className="text-black/20">◆</span>
                        <span className="text-sm text-black/60 flex-shrink-0">Join the Peakime Community</span>
                        <span className="text-black/20">◆</span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

/* ----------------------------------------------------------------
 App
------------------------------------------------------------------*/
export default function App() {
  const [path] = useRoute();
  const qParam = getHashQuery("q");
  const [cart, setCart] = useLocal("pk_cart", []);
  const [wishlist, setWishlist] = useLocal("pk_wishlist", []);
  const [user, setUser] = useLocal("pk_user", null);
  const [points, setPoints] = useLocal("pk_points", 0);
  const [reviews, setReviews] = useLocal("pk_reviews", []);
  const [storeOpen, setStoreOpen] = useState(false);
  const storeMenuTimeoutRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [cartJiggle, setCartJiggle] = useState(false);
  const { logProductView, getRecommendations, hasActivity } = useUserActivity();

  const handleStoreMouseEnter = () => { clearTimeout(storeMenuTimeoutRef.current); setStoreOpen(true); };
  const handleStoreMouseLeave = () => { storeMenuTimeoutRef.current = setTimeout(() => { setStoreOpen(false); }, 200); };

  useEffect(() => { setStoreOpen(false); }, [path]);
  useEffect(() => { /* No-op for scroll lock */ }, [storeOpen]);

  // Handle login redirects for protected pages
  useEffect(() => {
    const protectedPaths = ['#/account', '#/wishlist', '#/checkout']; // Removed '#/cart'
    const currentPathBase = path.split('?')[0];
    if (protectedPaths.includes(currentPathBase) && !user) {
      window.location.hash = '#/login';
      setToast({ message: 'You must be logged in to access this page.', type: 'error' });
    }
  }, [path, user]);

  const onSearch = () => {};
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const next = [...prev];
      const f = next.find((i) => i.id === item.id);
      if (f) f.qty += 1; else next.push({ ...item, qty: 1 });
      return next;
    });
    setToast({ message: "Added to Bag!", item, type: 'success' });
    setCartJiggle(true);
    setTimeout(() => setCartJiggle(false), 500);
  };

  let page = null;
  const pageKey = path.split('?')[0];

  if (path.startsWith("#/store")) page = <StorePage key={pageKey} query={qParam} wishlist={wishlist} setWishlist={setWishlist} onAddToCart={handleAddToCart} reviews={reviews} logProductView={logProductView} />;
  else if (path === "#/wishlist") page = <WishlistPage key={pageKey} wishlist={wishlist} setWishlist={setWishlist} onAddToCart={handleAddToCart} />;
  else if (path === "#/cart") page = <CartPage key={pageKey} cart={cart} setCart={setCart} />;
  else if (path === "#/checkout") page = <CheckoutPage key={pageKey} cart={cart} setCart={setCart} points={points} setPoints={setPoints} setToast={setToast} />;
  else if (path === "#/order-success") page = <OrderSuccessPage key={pageKey} />;
  else if (path === "#/media") page = <EmptyShell key={pageKey} title="Media" />;
  else if (path === "#/blog") page = <BlogPostPage key={pageKey} />;
  else if (path === "#/careers") page = <EmptyShell key={pageKey} title="Careers" />;
  else if (path === "#/contact") page = <EmptyShell key={pageKey} title="Contact" />;
  else if (path === "#/community") page = <CommunityNotice key={pageKey} />;
  else if (path === "#/login") page = <LoginPage onLogin={setUser} setToast={setToast} />;
  else if (path === "#/register") page = <RegisterPage onRegister={setUser} setToast={setToast} />;
  else if (path.startsWith("#/account")) page = <AccountPage key={pageKey} user={user} setUser={setUser} setReviews={setReviews} setToast={setToast} />;
  else page = <HomePage key={pageKey} getRecommendations={getRecommendations} hasActivity={hasActivity} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        html, body { 
          margin: 0; 
          width: 100%; 
          overflow-x: hidden; 
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes page-transition { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        @keyframes cart-jiggle { 0% {transform: rotate(-5deg);} 25% {transform: rotate(5deg);} 50% {transform: rotate(-5deg);} 75% {transform: rotate(5deg);} 100% {transform: rotate(0deg);} }
        @keyframes confetti-fall { from { transform: translateY(-100vh) rotate(0deg); } to { transform: translateY(100vh) rotate(720deg); } }
        @keyframes letter-reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes morph { 0%, 100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; transform: rotate(0deg); } 50% { border-radius: 30% 70% 40% 60% / 50% 60% 30% 40%; transform: rotate(5deg); } }
        @keyframes toast-progress { from { width: 100%; } to { width: 0%; } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ''; position: absolute; top: 0; transform: translateX(-100%); width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent); transition: transform 0.3s ease; }
        .btn-shine:hover::after { transform: translateX(100%); }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease forwards; }
        .animate-beat { animation: beat 0.4s ease-in-out; }
        .animate-cart-jiggle { animation: cart-jiggle 0.5s ease-in-out; }
        .animate-stagger { animation: fadeInUp 0.5s ease forwards; opacity: 0; }
        .page-container { animation: page-transition 0.4s ease-out; }
        .confetti { position: absolute; top: 0; width: 10px; height: 20px; animation: confetti-fall 5s linear infinite; }
        .animate-letter-reveal { opacity: 0; animation: letter-reveal 0.5s forwards; }
        .animate-morph { animation: morph 8s ease-in-out infinite; }
        .liquid-hover::before { content: ''; position: absolute; top: 50%; left: 50%; width: 120%; padding-top: 120%; background-color: rgba(0,0,0,0.05); border-radius: 50%; transform: translate(-50%, -50%) scale(0); transition: transform 0.4s ease; }
        .liquid-hover:hover::before { transform: translate(-50%, -50%) scale(1.2); }
        .peer:placeholder-shown ~ label { color: transparent; }
        .animate-toast-progress { animation: toast-progress 3s linear forwards; }
        .product-card { transition: transform 0.3s ease; will-change: transform; transform-style: preserve-3d; }
        .shimmer { background: linear-gradient(to right, #f0f0f0 4%, #e0e0e0 25%, #f0f0f0 36%); background-size: 1000px 100%; animation: shimmer 2s infinite linear; }
        .marquee-content { animation: marquee 30s linear infinite; }
        .animated-bg { background: linear-gradient(90deg, #F8F8F8, #FFFFFF, #F8F8F8); background-size: 400% 400%; animation: bg-pan 15s ease infinite; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
      
      `}</style>
      
      <div className="min-h-screen bg-white text-black font-inter selection:bg-black selection:text-white">
        <TopBar path={path} cartCount={cart.length} wishlistCount={wishlist.length} user={user} setUser={setUser} onSearch={onSearch} storeOpen={storeOpen} setStoreOpen={setStoreOpen} handleStoreMouseEnter={handleStoreMouseEnter} handleStoreMouseLeave={handleStoreMouseLeave} points={points} cartJiggle={cartJiggle} />
        <StoreMegaMenu open={storeOpen} setOpen={setStoreOpen} />
        <div key={pageKey} className="page-container pt-14">{page}</div>
        <Toast toastInfo={toast} onDismiss={() => setToast(null)} />
        <MarqueeBanner />
        <footer className="bg-zinc-100 mt-16 pt-16 pb-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl flex flex-wrap gap-8 mb-8 text-left justify-between">
              <div className="flex-1 min-w-[150px]"><h3 className="font-semibold mb-4">Shop</h3><ul className="space-y-2 text-black/70"><li><a href="#/store" className="hover:text-black" onClick={() => localStorage.setItem("pk_store_cat", "figures")}>Anime Figures</a></li><li><a href="#/store" className="hover:text-black" onClick={() => localStorage.setItem("pk_store_cat", "metal")}>Metal Prints</a></li><li><a href="#/store" className="hover:text-black" onClick={() => localStorage.setItem("pk_store_cat", "apparel")}>Apparel</a></li><li><a href="#/store" className="hover:text-black" onClick={() => localStorage.setItem("pk_store_cat", "merch")}>Collectibles</a></li></ul></div>
              <div className="flex-1 min-w-[150px]"><h3 className="font-semibold mb-4">Support</h3><ul className="space-y-2 text-black/70"><li><a href="#/contact" className="hover:text-black">Contact Us</a></li><li><a href="#/account?tab=orders" className="hover:text-black">Order Status</a></li><li><a href="#/shipping" className="hover:text-black">Shipping & Returns</a></li><li><a href="#/faq" className="hover:text-black">FAQ</a></li></ul></div>
              <div className="flex-1 min-w-[150px]"><h3 className="font-semibold mb-4">Company</h3><ul className="space-y-2 text-black/70"><li><a href="#/blog" className="hover:text-black">Blog</a></li><li><a href="#/careers" className="hover:text-black">Careers</a></li><li><a href="#/about" className="hover:text-black">About Peakime</a></li><li><a href="#/community" className="hover:text-black">Community</a></li></ul></div>
            </div>
            <div className="border-t border-black/10 pt-8 text-sm text-black/60"><div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between"><div>© {new Date().getFullYear()} Peakime. All Rights Reserved. Demo for portfolio.</div><div className="flex gap-4"><a href="#/privacy" className="hover:text-black transition-colors">Privacy Policy</a><a href="#/terms" className="hover:text-black transition-colors">Terms of Service</a></div></div></div>
          </div>
        </footer>
      </div>
    </>
  );
}

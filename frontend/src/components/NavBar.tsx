import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, Menu, X, MessageSquare, LogOut, Instagram, Sun, Moon } from 'lucide-react';
import LogOutModal from './LogOutModal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    const checkAuth = () => {
      const authUser = localStorage.getItem("authUser");
      setIsAuthenticated(!!authUser);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        localStorage.removeItem('authUser');
        localStorage.removeItem('joinedRooms');
        setIsAuthenticated(false);
        setShowLogoutModal(false);
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/75 dark:bg-[#0c0d12]/80 border-b border-slate-200/50 dark:border-slate-800/60 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <img
            src="/logo-horizontal.png"
            alt="Anime Club NITH"
            className="h-8 w-auto shrink-0 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">

          <Link
            to="/blogs"
            className={`font-medium text-sm transition-colors ${isActive('/blogs') ? 'text-pink-500' : 'text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400'}`}
          >
            Blogs
          </Link>

          {isAuthenticated ? (
            <Link to="/room">
              <button className="btn-pink-modern flex items-center gap-2 py-2 px-4 text-sm">
                <MessageSquare size={14} />
                Community Chat
              </button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`font-medium text-sm transition-colors ${isActive('/login') ? 'text-pink-500' : 'text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400'}`}
              >
                Login
              </Link>

              <Link to="/signup">
                <button className="btn-pink-modern py-2 px-4 text-sm">
                  Sign Up
                </button>
              </Link>
            </>
          )}

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Get the App Link */}
          <Link
            to="/download"
            className="font-medium text-sm text-pink-500 hover:text-pink-400 transition-colors"
          >
            Get the App
          </Link>

          {/* GitHub Link */}
          <a
            href="https://github.com/anime-club-nith"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            title="Anime Club NITH on GitHub"
          >
            <Github size={18} />
          </a>

          {/* Instagram Link */}
          <a
            href="https://instagram.com/animeclub_nith"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            title="Anime Club NITH on Instagram"
          >
            <Instagram size={18} />
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Logout Icon - Only for authenticated users */}
          {isAuthenticated && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 dark:hover:text-red-400"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-pink-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 p-5 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
          <Link to="/blogs" className="font-medium text-sm text-slate-700 dark:text-slate-300 hover:text-pink-500 py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
          {isAuthenticated ? (
            <Link to="/room" className="py-1" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full btn-pink-modern flex items-center justify-center gap-2 text-sm">
                <MessageSquare size={14} />
                Community Chat
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-medium text-sm text-slate-700 dark:text-slate-300 hover:text-pink-500 py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="py-1" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full btn-pink-modern text-sm">Sign Up</button>
              </Link>
            </>
          )}
          <Link to="/download" className="font-medium text-sm text-pink-500 hover:text-pink-400 py-1.5" onClick={() => setIsMobileMenuOpen(false)}>
            Get the App
          </Link>
          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-1" />
          <div className="flex items-center gap-5 pt-1">
            <a href="https://github.com/anime-club-nith" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 flex items-center gap-2">
              <Github size={18} /> <span>GitHub</span>
            </a>
            <a href="https://instagram.com/animeclub_nith" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 flex items-center gap-2">
              <Instagram size={18} /> <span>Instagram</span>
            </a>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="text-red-500 hover:text-red-600 flex items-center gap-2 py-1.5 text-sm font-medium cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogOutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </nav>
  );
}
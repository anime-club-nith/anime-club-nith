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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-[#0c0d12] border-b-4 border-black dark:border-white transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <img
            src="/logo-dark.png"
            alt="Anime Club NITH"
            className="h-9 w-auto dark:hidden"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <img
            src="/logo-light.png"
            alt="Anime Club NITH"
            className="h-9 w-auto hidden dark:block"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-xl font-black text-black dark:text-white uppercase tracking-tighter hover:text-pink-500 transition-colors">
            Anime Club <span className="text-pink-500">NITH</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">

          <Link
            to="/blogs"
            className={`font-black uppercase text-xs tracking-widest transition-colors ${isActive('/blogs') ? 'text-pink-500' : 'text-black dark:text-white hover:text-pink-500'}`}
          >
            Blogs
          </Link>

          {isAuthenticated ? (
            <Link to="/room">
              <button className="border-4 border-black dark:border-white px-4 py-2 font-black uppercase text-xs bg-pink-500 hover:bg-pink-400 text-black dark:text-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] transition active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 cursor-pointer">
                <MessageSquare size={14} />
                Community Chat
              </button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`font-black uppercase text-xs tracking-widest transition-colors ${isActive('/login') ? 'text-pink-500' : 'text-black dark:text-white hover:text-pink-500'}`}
              >
                Login
              </Link>

              <Link to="/signup">
                <button className="border-4 border-black dark:border-white px-4 py-2 font-black uppercase text-xs bg-pink-500 hover:bg-pink-400 text-black dark:text-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] transition active:translate-x-[2px] active:translate-y-[2px] cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </>
          )}

          <div className="h-5 w-[4px] bg-black dark:bg-white mx-1" />

          {/* Get the App Link */}
          <a
            href="https://github.com/anime-club-nith"
            target="_blank"
            rel="noopener noreferrer"
            className="font-black uppercase text-xs tracking-widest text-pink-500 hover:text-pink-600 transition-colors"
          >
            Get the App
          </a>

          {/* GitHub Link */}
          <a
            href="https://github.com/anime-club-nith"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:text-pink-500 transition-colors"
            title="Anime Club NITH on GitHub"
          >
            <Github size={20} />
          </a>

          {/* Instagram Link */}
          <a
            href="https://instagram.com/animeclub_nith"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:text-pink-500 transition-colors"
            title="Anime Club NITH on Instagram"
          >
            <Instagram size={20} />
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 cursor-pointer border-4 border-black dark:border-white bg-pink-100 hover:bg-pink-200 dark:bg-[#2b1724] dark:hover:bg-[#3d2033] text-black dark:text-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={3} /> : <Moon size={18} strokeWidth={3} />}
          </button>

          {/* Logout Icon - Only for authenticated users */}
          {isAuthenticated && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center w-10 h-10 cursor-pointer border-4 border-black dark:border-white bg-red-100 hover:bg-red-200 text-black dark:text-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="Logout"
            >
              <LogOut size={18} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 cursor-pointer border-4 border-black dark:border-white bg-pink-100 hover:bg-pink-200 dark:bg-[#2b1724] dark:hover:bg-[#3d2033] text-black dark:text-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={3} /> : <Moon size={18} strokeWidth={3} />}
          </button>

          <button
            className="p-2 text-black dark:text-white hover:text-pink-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0c0d12] border-b-4 border-black dark:border-white p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
          <Link to="/blogs" className="font-black uppercase text-xs tracking-widest text-black dark:text-white hover:text-pink-500 py-2" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
          {isAuthenticated ? (
            <Link to="/room" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full border-4 border-black dark:border-white px-4 py-2 font-black uppercase text-xs bg-pink-500 hover:bg-pink-400 text-black dark:text-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] flex items-center justify-center gap-2 cursor-pointer">
                <MessageSquare size={14} />
                Community Chat
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-black uppercase text-xs tracking-widest text-black dark:text-white hover:text-pink-500 py-2" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full border-4 border-black dark:border-white px-4 py-2 font-black uppercase text-xs bg-pink-500 hover:bg-pink-400 text-black dark:text-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </>
          )}
          <a href="https://github.com/anime-club-nith" target="_blank" rel="noopener noreferrer" className="font-black uppercase text-xs tracking-widest text-pink-500 hover:text-pink-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>
            Get the App
          </a>
          <div className="h-[4px] bg-black dark:bg-white w-full my-2" />
          <div className="flex items-center gap-6 pt-2">
            <a href="https://github.com/anime-club-nith" target="_blank" rel="noopener noreferrer" className="font-black uppercase text-xs text-black dark:text-white hover:text-pink-500 flex items-center gap-2">
              <Github size={20} /> <span className="text-xs tracking-widest">GitHub</span>
            </a>
            <a href="https://instagram.com/animeclub_nith" target="_blank" rel="noopener noreferrer" className="font-black uppercase text-xs text-black dark:text-white hover:text-pink-500 flex items-center gap-2">
              <Instagram size={20} /> <span className="text-xs tracking-widest">Instagram</span>
            </a>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="text-red-600 hover:text-red-700 flex items-center gap-2 py-2 font-black uppercase text-xs tracking-widest cursor-pointer"
            >
              <LogOut size={18} strokeWidth={3} /> Logout
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
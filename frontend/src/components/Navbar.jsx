import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define routes for each link
  const navLinks = [
    { name: 'Demos', path: '/demos' },
    { name: 'Find Jobs', path: '/find-jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Candidates', path: '/candidates' },
    { name: 'Blog', path: '/blog' },
    { name: 'Pages', path: '/pages' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-card/95 backdrop-blur-md shadow-soft py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-foreground tracking-tight">
          DeshSkill
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-foreground/80 hover:text-foreground transition-colors text-sm font-medium ${isActive ? "font-bold text-foreground" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Profile Picture or Icon */}
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                {user.profile_image ? (
                  <img
                    src={user.profile_image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-1 text-gray-600" />
                )}
              </div>

              {/* User Name */}
              {/* <span className="hidden md:inline text-sm font-medium text-foreground">
                {user.name || user.email}
              </span> */}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg border border-red-400 text-red-500 text-sm font-medium hover:bg-red-500 hover:text-white hover:cursor-pointer transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              className="px-5 py-2.5 rounded-lg border border-foreground/20 text-background text-sm font-medium hover:bg-foreground hover:text-background transition-all duration-200 bg-[#001F3F]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

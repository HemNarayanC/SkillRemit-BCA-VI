import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-card/95 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'
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
                `text-foreground/80 hover:text-foreground transition-colors text-sm font-medium ${
                  isActive ? 'font-bold text-foreground' : ''
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Sign In Button */}
        <Link
          to="/auth/login"
          className="px-5 py-2.5 rounded-lg border border-foreground/20 text-background text-sm font-medium hover:bg-foreground hover:text-background transition-all duration-200"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

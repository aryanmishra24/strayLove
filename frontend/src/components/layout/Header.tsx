import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin, isVolunteer } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log('[Header] Auth state:', { user, isAuthenticated, isAdmin: isAdmin(), isVolunteer: isVolunteer() });

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Animals', href: '/animals' },
    { name: 'Community Updates', href: '/community' },
    { name: 'Map', href: '/map' },
    { name: 'Search', href: '/search' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Straylove
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {/* Role-based navigation */}
            {isAdmin() && (
              <Link
                to="/admin/approvals"
                className={`text-sm font-medium transition-colors ${isActive('/admin/approvals') ? 'text-primary' : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'}`}
              >
                Approve Reports
              </Link>
            )}
            {isVolunteer() && (
              <Link
                to="/volunteer/care-logs"
                className={`text-sm font-medium transition-colors ${isActive('/volunteer/care-logs') ? 'text-primary' : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200'}`}
              >
                Care Logs
              </Link>
            )}
          </nav>

          {/* Right side - Theme toggle and auth */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="primary"
                  size="sm"
                  as={Link}
                  to="/report"
                >
                  Report Animal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  as={Link}
                  to="/dashboard"
                >
                  Dashboard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="primary"
                  size="sm"
                  as={Link}
                  to="/login"
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  as={Link}
                  to="/register"
                >
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Role-based navigation (mobile) */}
              {isAdmin() && (
                <Link
                  to="/admin/approvals"
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Approve Reports
                </Link>
              )}
              {isVolunteer() && (
                <Link
                  to="/volunteer/care-logs"
                  className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Care Logs
                </Link>
              )}
              
              {user && isAuthenticated ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    as={Link}
                    to="/report"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Report Animal
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    as={Link}
                    to="/dashboard"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    as={Link}
                    to="/login"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    as={Link}
                    to="/register"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 
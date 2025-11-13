// src/components/Header.tsx
import { Link } from "@tanstack/react-router";
import Logo from "./Logo";

interface HeaderProps {
  user?: {
    email?: string;
    role?: string;
    name?: string;
  } | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Logo to="/" size="md" />

          {/* Navigation */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-8">
              {user.role === "ADMIN" && (
                <>
                  <Link
                    to="/admin/cois"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    COIs
                  </Link>
                  <Link
                    to="/admin/vendors"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Vendors
                  </Link>
                  <Link
                    to="/admin/buildings"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Buildings
                  </Link>
                  <Link
                    to="/admin/audit"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Audit
                  </Link>
                </>
              )}

              {user.role === "VENDOR" && (
                <>
                  <Link
                    to="/vendor"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    My COIs
                  </Link>
                  <Link
                    to="/vendor"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}

              {user.role === "GUARD" && (
                <Link
                  to="/guard/check"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Access Check
                </Link>
              )}
            </nav>
          ) : (
/*             <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/features"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                About
              </Link>
            </nav> */
            <></>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {user.name || user.email}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {user.role}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="gradient-bg text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #6366F1 100%);
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </header>
  );
}

// Simple version for auth pages
export function SimpleHeader() {
  return (
    <header className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <Logo to="/" size="md" />
      </div>
    </header>
  );
}

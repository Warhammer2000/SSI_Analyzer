import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Plus, LayoutDashboard, History, CheckSquare, LogOut, Import as ImportIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // If not authenticated and not on auth pages, don't show layout (or show minimal)
  // But App.tsx handles routing. This Layout is used inside BrowserRouter.
  // We can just conditionally render the navbar items.

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: History },
    { path: '/actions', label: 'Daily Actions', icon: CheckSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] font-sans text-[#000000e6]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e0e0e0] h-[52px] fixed top-0 w-full z-50">
        <div className="max-w-[1128px] mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-[#0a66c2] hover:text-[#004182] transition-colors">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xl font-bold tracking-tight">SSI Analyzer</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors",
                      isActive 
                        ? "text-[#191919] border-b-2 border-[#191919] rounded-none h-[52px]" 
                        : "text-[#666666] hover:bg-[#f3f2ef] hover:text-[#191919]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/new"
              className="flex items-center gap-1 bg-[#0a66c2] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#004182] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Snapshot</span>
            </Link>
            
            <Link
              to="/import"
              className="flex items-center gap-1 bg-white text-[#0a66c2] border border-[#0a66c2] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#f3f2ef] transition-colors"
            >
              <ImportIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </Link>
            
            <div className="h-6 w-px bg-[#e0e0e0]" />
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#00000099] hidden sm:inline-block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-[#00000099] hover:text-[#000000e6] transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[76px] pb-12 px-4">
        <div className="max-w-[1128px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

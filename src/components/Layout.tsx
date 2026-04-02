import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Menu, X, Home, FileText, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { id: 'home', name: 'Trang chủ', path: '/', icon: <Home size={20} /> },
    ...(profile?.role === 'student' ? [
      { id: 'application', name: 'Hồ sơ kết nạp', path: '/application', icon: <FileText size={20} /> }
    ] : []),
    ...(profile?.role === 'admin' ? [
      { id: 'admin', name: 'Quản trị hệ thống', path: '/', icon: <Shield size={20} /> }
    ] : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand-red text-white overflow-y-auto sidebar-scroll">
      <div className="p-4 border-b border-brand-red-dark">
        <Link to="/" className="flex flex-col items-center gap-2 text-center" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-16 h-16 mx-auto relative z-20 transition-transform hover:scale-105 duration-300 drop-shadow-md bg-white rounded-full p-1">
            <img 
              src="https://drive.google.com/thumbnail?id=1O7UZhqrJoTc6xac8yB05_laRxhZsfhom&sz=w1000" 
              alt="Logo Chi Bộ Sinh Viên" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col mt-2">
            <span className="font-bold text-sm leading-tight uppercase text-brand-yellow">
              Cổng Thông Tin
            </span>
            <span className="text-[10px] opacity-90 leading-tight mt-1">
              Hỗ trợ sinh viên vào Đảng
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-grow py-4 px-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            to={link.path}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
              location.pathname === link.path 
                ? 'bg-white/20 text-brand-yellow font-medium' 
                : 'hover:bg-white/10'
            }`}
          >
            {link.icon}
            <span>{link.name}</span>
            {location.pathname === link.path && <ChevronRight size={16} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-brand-red-dark space-y-3">
        {profile && (
          <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-lg">
            <div className="w-7 h-7 bg-brand-yellow rounded-full flex items-center justify-center text-brand-red font-bold text-xs shrink-0">
              {profile.fullName?.charAt(0) || profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate">
                {profile.studentId ? `${profile.studentId} - ` : ''}{profile.fullName || profile.email}
              </span>
              <span className="text-[10px] opacity-70 uppercase tracking-wider">{profile.role === 'admin' ? 'Đảng viên' : 'Sinh viên'}</span>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-brand-yellow-light text-sm"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-brand-red text-white flex items-center justify-between px-4 z-40 shadow-md">
        <button onClick={toggleSidebar} className="p-1.5 hover:bg-white/10 rounded-lg">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full p-0.5 shrink-0">
            <img 
              src="https://drive.google.com/thumbnail?id=1O7UZhqrJoTc6xac8yB05_laRxhZsfhom&sz=w1000" 
              alt="Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-xs uppercase truncate">
            Hỗ trợ sinh viên
          </span>
        </div>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 fixed inset-y-0 left-0 z-30 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50 shadow-2xl"
            >
              <div className="relative h-full">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-3 right-[-40px] p-1.5 bg-brand-red text-white rounded-r-lg shadow-lg"
                >
                  <X size={20} />
                </button>
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-grow flex flex-col lg:pl-56 pt-14 lg:pt-0">
        <main className="flex-grow p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Chi bộ Sinh viên. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, FileText, Menu, X, Rocket, BarChart } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'text-black' : 'text-gray-500 hover:text-black'}`}
        >
            {Icon && <Icon size={16} />}
            {children}
        </Link>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Rocket size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">CAMPUS LAUNCHPAD</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              <NavLink to="/dashboard" icon={null}>Dashboard</NavLink>
              <NavLink to="/jobs" icon={Briefcase}>Jobs</NavLink>
              
              {user.role === 'student' && (
                <>
                    <NavLink to="/my-applications" icon={FileText}>Applications</NavLink>
                    <NavLink to="/resume-analyzer" icon={FileText}>Analyzer</NavLink>
                </>
              )}
              
              {user.role === 'admin' && (
                  <>
                    <NavLink to="/admin" icon={FileText}>Dashboard</NavLink>
                    <NavLink to="/admin/student-status" icon={BarChart}>Status</NavLink>
                  </>
              )}
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              
              <button 
                onClick={handleLogout} 
                className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2 text-sm font-medium ml-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Log in</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm rounded-lg">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-900" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col space-y-4 shadow-xl md:hidden animate-in slide-in-from-top-5 duration-200">
            {user ? (
                <>
                    <Link to="/dashboard" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    <Link to="/jobs" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>Jobs</Link>
                    {user.role === 'student' && (
                        <>
                            <Link to="/my-applications" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>My Applications</Link>
                            <Link to="/resume-analyzer" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>Resume Analyzer</Link>
                        </>
                    )}
                    {user.role === 'admin' && (
                        <>
                            <Link to="/admin" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                            <Link to="/admin/student-status" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>Student Status</Link>
                        </>
                    )}
                    <Link to="/profile" className="py-2 text-gray-600 hover:text-black font-medium border-b border-gray-50" onClick={() => setIsOpen(false)}>Profile</Link>
                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="py-2 text-left text-red-600 font-medium">Logout</button>
                </>
            ) : (
                <div className="flex flex-col gap-3">
                    <Link to="/login" className="btn-secondary w-full justify-center" onClick={() => setIsOpen(false)}>Log in</Link>
                    <Link to="/register" className="btn-primary w-full justify-center" onClick={() => setIsOpen(false)}>Get Started</Link>
                </div>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

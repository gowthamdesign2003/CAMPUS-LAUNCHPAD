import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Update role if URL param changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'student' || roleParam === 'admin')) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const isStudent = role === 'student';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
            <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                    <Rocket size={24} />
                </div>
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-900 tracking-tight">
                Create an account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
                Join as a <span className="font-semibold text-gray-800">{isStudent ? 'Student' : 'Placement Officer'}</span>
            </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:z-10 sm:text-sm transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:z-10 sm:text-sm transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:z-10 sm:text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
            >
              Create account
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
            <Link to={`/login?role=${role}`} className="text-sm text-gray-500 hover:text-black flex items-center justify-center gap-1 mb-4">
                <ArrowLeft size={14} /> Back to Login
            </Link>
            <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to={`/login?role=${role}`} className="font-medium text-black hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

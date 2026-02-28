import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Briefcase, User, FileText, CheckCircle, Rocket, Shield, 
    Compass, Calendar, Clock, List, ExternalLink, Video, Search, Plus, 
    MoreHorizontal, Edit, Trash2, Eye, Users
} from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]); // For Admin
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      if (user?.role === 'student') {
          fetchInterviews();
      } else if (user?.role === 'admin') {
          fetchPostedJobs();
      }
  }, [user]);

  const fetchPostedJobs = async () => {
      setLoadingJobs(true);
      try {
          const { data } = await api.get('/jobs'); // Fetch all jobs for admin
          setPostedJobs(data);
      } catch (error) {
          console.error("Failed to fetch jobs", error);
      } finally {
          setLoadingJobs(false);
      }
  };

  const filteredPostedJobs = postedJobs.filter(job => 
    job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchInterviews = async () => {
      try {
          const { data } = await api.get('/applications/my');
          
          let allInterviews = [];

          data.forEach(app => {
              // 1. Check for Job-level interview rounds
              if (app.job?.interviewRounds && app.job.interviewRounds.length > 0) {
                  app.job.interviewRounds.forEach(round => {
                      if (round.date) {
                          allInterviews.push({
                              _id: `${app._id}-${round.roundName}`, // Unique key
                              appId: app._id,
                              jobRole: app.job?.role,
                              companyName: app.job?.companyName,
                              interviewDate: round.date,
                              roundName: round.roundName,
                              type: 'Scheduled Round'
                          });
                      }
                  });
              } 
              // 2. Fallback to Application-level interview date
              else if (app.interviewDate) {
                  allInterviews.push({
                      _id: app._id,
                      appId: app._id,
                      jobRole: app.job?.role,
                      companyName: app.job?.companyName,
                      interviewDate: app.interviewDate,
                      roundName: 'Interview',
                      type: 'General'
                  });
              }
          });

          // Filter for future interviews and sort
          const upcoming = allInterviews
              .filter(item => new Date(item.interviewDate) > new Date())
              .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
              
          setUpcomingInterviews(upcoming);
      } catch (error) {
          console.error("Failed to fetch interviews", error);
      }
  };

  const ActionCard = ({ to, title, description, icon: Icon, colorClass, bgClass }) => (
    <Link to={to} className="group block h-full">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col relative overflow-hidden">
            <div className={`w-14 h-14 ${bgClass} ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-black">{title}</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed flex-grow">{description}</p>
            <div className="flex items-center text-sm font-semibold text-black mt-auto">
                <span className="border-b border-black pb-0.5 group-hover:border-b-2 transition-all">Open</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
  );

  // Admin Dashboard View
  if (user?.role === 'admin') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-12 bg-black text-white p-10 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 opacity-80">
                        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
                            Admin Dashboard
                        </span>
                        <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-300 max-w-2xl text-lg">
                        Manage recruitment drives, student applications, and placement statistics from one central hub.
                    </p>
                </div>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Header Flex */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Provide Opportunities</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage job postings and student applications.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search jobs..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                        />
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    
                    {/* Post New Job Button */}
                    <button 
                        onClick={() => navigate('/admin/post-job')} 
                        className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={18} /> Post New Job
                    </button>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Package</th>
                                <th className="px-6 py-4 text-center">Applied</th>
                                <th className="px-6 py-4">Posted Date</th>
                                <th className="px-6 py-4">Deadline</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingJobs ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading jobs...</td>
                                </tr>
                            ) : filteredPostedJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No jobs found.</td>
                                </tr>
                            ) : (
                                filteredPostedJobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                    {job.companyName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{job.companyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{job.role}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{job.package}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => navigate(`/admin/applications/${job._id}`)}>
                                                {job.applicationCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigate(`/admin/applications/${job._id}`)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                    title="View Applications"
                                                >
                                                    <Users size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" 
                                                    title="View Job Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/jobs/${job._id}/edit`)}
                                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                                    title="Edit Job"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                    title="Delete Job"
                                                    onClick={async () => {
                                                        if(window.confirm('Delete this job?')) {
                                                            await api.delete(`/jobs/${job._id}`);
                                                            fetchPostedJobs();
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Static for now) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing {filteredPostedJobs.length} jobs</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-12 bg-black text-white p-10 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 opacity-80">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
                    {user?.role} Dashboard
                </span>
                <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-300 max-w-2xl text-lg">
                {user?.role === 'student' 
                    ? "Ready to take the next step in your career? Browse new opportunities or check your application status."
                    : "Manage recruitment drives, student applications, and placement statistics from one central hub."}
            </p>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Upcoming Interviews Section (Student Only) */}
      {user?.role === 'student' && upcomingInterviews.length > 0 && (
          <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <Calendar size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Upcoming Interviews</h2>
                  </div>
                  <button 
                      onClick={() => navigate('/interviews')}
                      className="text-purple-600 font-medium hover:text-purple-800 flex items-center gap-2 text-sm"
                  >
                      View All <ArrowRight size={16} />
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingInterviews.slice(0, 3).map((item) => (
                      <div key={item._id} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                          
                          <div className="relative z-10">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.jobRole}</h3>
                              <p className="text-gray-500 text-sm mb-4">{item.companyName}</p>
                              
                              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-gray-200 min-w-[60px]">
                                      <span className="text-xs font-bold text-red-500 uppercase">{new Date(item.interviewDate).toLocaleString('default', { month: 'short' })}</span>
                                      <span className="text-xl font-bold text-gray-900">{new Date(item.interviewDate).getDate()}</span>
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                          <Clock size={14} className="text-gray-400" />
                                          {new Date(item.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <span className="text-xs text-gray-500 mt-0.5">{item.roundName}</span>
                                  </div>
                              </div>

                              {item.link && (
                                  <a 
                                      href={item.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors
                                          ${item.roundName.toLowerCase().includes('mcq') || item.roundName.toLowerCase().includes('task') 
                                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}
                                      `}
                                  >
                                      {item.roundName.toLowerCase().includes('mcq') || item.roundName.toLowerCase().includes('task') 
                                          ? <ExternalLink size={14} /> 
                                          : <Video size={14} />}
                                      {item.roundName.toLowerCase().includes('mcq') || item.roundName.toLowerCase().includes('task') 
                                          ? `Start ${item.roundName}` 
                                          : "Join Meeting"}
                                  </a>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActionCard 
            to="/jobs" 
            title="Explore Opportunities" 
            description="Browse and apply to the latest job openings from top companies recruiting on campus."
            icon={Briefcase}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
        />

        {user?.role === 'student' && (
          <>
            <ActionCard 
                to="/profile" 
                title="Manage Profile" 
                description="Keep your academic details, skills, and resume up to date to increase your visibility."
                icon={User}
                colorClass="text-green-600"
                bgClass="bg-green-50"
            />
            <ActionCard 
                to="/my-applications" 
                title="Application Status" 
                description="Track the progress of your submitted applications and interview schedules."
                icon={CheckCircle}
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
            />
            <ActionCard 
                to="/resume-analyzer" 
                title="AI Resume Analyzer" 
                description="Get instant AI feedback on your resume's ATS compatibility and content."
                icon={Rocket}
                colorClass="text-orange-600"
                bgClass="bg-orange-50"
            />
            <ActionCard 
                to="/career-path" 
                title="Career Path Guide" 
                description="Get personalized career recommendations based on your skills and interests."
                icon={Compass}
                colorClass="text-teal-600"
                bgClass="bg-teal-50"
            />
            <ActionCard 
                to="/interviews" 
                title="Interview Schedule" 
                description="View all your upcoming and past interview rounds in one place."
                icon={List}
                colorClass="text-pink-600"
                bgClass="bg-pink-50"
            />
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;

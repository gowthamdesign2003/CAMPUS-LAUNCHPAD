import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, User, FileText, CheckCircle, Rocket, Shield, Compass, Calendar, Clock, List, ExternalLink, Video } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
      if (user?.role === 'student') {
          fetchInterviews();
      }
  }, [user]);

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

        {user?.role === 'admin' && (
          <ActionCard 
              to="/admin" 
              title="Admin Control Panel" 
              description="Post new jobs, manage student applications, and schedule interview rounds."
              icon={Shield}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

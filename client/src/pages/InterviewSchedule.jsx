import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Building, Briefcase, ExternalLink, Video } from 'lucide-react';
import api from '../api/axios';

const InterviewSchedule = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
                            _id: `${app._id}-${round.roundName}`,
                            appId: app._id,
                            jobRole: app.job?.role,
                            companyName: app.job?.companyName,
                            interviewDate: round.date,
                            roundName: round.roundName,
                            link: round.link
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
                    roundName: 'Interview Round',
                    link: null
                });
            }
        });

        // Sort by date
        allInterviews.sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
        
        setInterviews(allInterviews);
      } catch (error) {
        console.error("Failed to fetch interviews", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <Link to="/dashboard" className="text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Interview Schedule</h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
            View all your upcoming and past interview rounds. Make sure to be prepared and on time!
        </p>
      </div>

      {interviews.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No interviews scheduled yet</h3>
              <p className="text-gray-500 mt-1">Check back later once your applications are shortlisted.</p>
          </div>
      ) : (
          <div className="space-y-6">
              {interviews.map((item) => {
                  const interviewDate = new Date(item.interviewDate);
                  const isUpcoming = interviewDate > new Date();
                  
                  return (
                    <div key={item._id} className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md
                        ${isUpcoming ? 'border-purple-100 shadow-sm' : 'border-gray-100 opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100'}
                    `}>
                        {/* Date Box */}
                        <div className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[100px] text-center
                            ${isUpcoming ? 'bg-purple-50 text-purple-900' : 'bg-gray-100 text-gray-600'}
                        `}>
                            <span className="text-sm font-bold uppercase tracking-wider">{interviewDate.toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-3xl font-bold my-1">{interviewDate.getDate()}</span>
                            <span className="text-sm font-medium">{interviewDate.getFullYear()}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-grow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{item.jobRole}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium mt-1">
                                        <Building size={16} />
                                        {item.companyName}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border self-start md:self-center
                                    ${isUpcoming 
                                        ? 'bg-green-50 text-green-700 border-green-100' 
                                        : 'bg-gray-100 text-gray-600 border-gray-200'}
                                `}>
                                    {isUpcoming ? 'Upcoming' : 'Completed'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>Time: <span className="font-semibold text-gray-900">{interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} className="text-gray-400" />
                                    <span>Round: <span className="font-semibold text-gray-900">{item.roundName}</span></span>
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                    {item.link ? (
                                        item.roundName.toLowerCase().includes('mcq') || item.roundName.toLowerCase().includes('task') || item.roundName.toLowerCase().includes('test') ? (
                                            <>
                                                <ExternalLink size={16} className="text-blue-600" />
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                                                    Start {item.roundName}
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                <Video size={16} className="text-purple-600" />
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 hover:underline">
                                                    Join Meeting
                                                </a>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>Location: <span className="font-semibold text-gray-900">Check Email / Portal</span></span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Button (if any) */}
                        {isUpcoming && (
                            <div className="flex items-center justify-center md:border-l border-gray-100 md:pl-6">
                                <Link to={`/my-applications`} className="btn-secondary whitespace-nowrap text-sm">
                                    View Application
                                </Link>
                            </div>
                        )}
                    </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default InterviewSchedule;
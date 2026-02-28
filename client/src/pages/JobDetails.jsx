import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    Briefcase, Building, Calendar, CheckCircle, ArrowLeft, Clock, 
    MapPin, Globe, DollarSign, BookOpen, GraduationCap, Zap, Users
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    if (user?.role === 'student') {
        fetchAppliedJobs();
    }
  }, [id, user, navigate]);

  const fetchAppliedJobs = async () => {
      try {
          const { data } = await api.get('/applications/my');
          const ids = data.map(app => app.job?._id);
          setAppliedJobIds(ids);
          
          const currentApp = data.find(app => app.job?._id === id);
          if (currentApp) {
              setApplicationStatus(currentApp.status);
          }
      } catch (error) {
          console.error("Failed to fetch applications", error);
      }
  };

  const isEligible = (job) => {
      if (!user?.profile) return true;
      const { cgpa = 0, department = '' } = user.profile;
      const { cgpa: jobCgpa = 0, department: jobDepts = [] } = job.eligibilityCriteria || {};

      if (Number(cgpa) < Number(jobCgpa)) return false;
      if (jobDepts.length > 0 && !jobDepts.some(d => d.toLowerCase() === department.toLowerCase())) return false;

      return true;
  };

  const calculateMatchScore = (job) => {
      if (!user?.profile) return 0;
      const eligible = isEligible(job);
      let score = 0;
      const { skills = [], cgpa = 0, department = '' } = user.profile;
      const { skills: jobSkills = [], cgpa: jobCgpa = 0, department: jobDepts = [] } = job.eligibilityCriteria || {};

      let skillsScore = 0;
      if (jobSkills.length > 0) {
          const matchedSkills = jobSkills.filter(skill => 
              skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
          );
          skillsScore = (matchedSkills.length / jobSkills.length) * 60;
      } else {
          skillsScore = 60;
      }

      let academicScore = 0;
      if (Number(cgpa) >= Number(jobCgpa)) academicScore += 20;
      if (jobDepts.length === 0 || jobDepts.some(d => d.toLowerCase() === department.toLowerCase())) academicScore += 20;

      score = skillsScore + academicScore;
      if (!eligible) return Math.min(Math.round(score), 40);
      return Math.round(score);
  };

  const handleApply = async () => {
      try {
          await api.post('/applications', { jobId: job._id });
          toast.success('Applied successfully!');
          fetchAppliedJobs();
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to apply');
      }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!job) return null;

  const matchScore = calculateMatchScore(job);
  const userEligible = isEligible(job);
  const isApplied = appliedJobIds.includes(job._id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/jobs" className="text-gray-500 hover:text-black mb-6 inline-flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                          <Building size={40} className="text-white" />
                      </div>
                      <div>
                          <h1 className="text-3xl font-bold mb-2">{job.role}</h1>
                          <div className="flex items-center gap-4 text-gray-300 text-sm">
                              <span className="flex items-center gap-1.5"><Building size={14} /> {job.companyName}</span>
                              <span className="flex items-center gap-1.5"><MapPin size={14} /> On-Site / Remote</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wide">
                                  {job.status}
                              </span>
                          </div>
                      </div>
                  </div>

                  {user?.role === 'student' && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[140px]">
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-300 uppercase">Match Score</span>
                              <Zap size={16} className={matchScore >= 80 ? 'text-green-400' : matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'} fill="currentColor" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">{matchScore}%</div>
                          <div className="w-full bg-white/20 rounded-full h-1.5">
                              <div 
                                  className={`h-full rounded-full ${matchScore >= 80 ? 'bg-green-400' : matchScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                  style={{ width: `${matchScore}%` }}
                              ></div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 p-8 border-r border-gray-100">
                  <section className="mb-10">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <BookOpen size={20} className="text-gray-400" /> Job Description
                      </h2>
                      <div className="prose prose-sm text-gray-600 max-w-none leading-relaxed">
                          {job.description}
                      </div>
                  </section>

                  <section className="mb-10">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <GraduationCap size={20} className="text-gray-400" /> Eligibility Criteria
                      </h2>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                  <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Minimum CGPA</span>
                                  <span className="text-lg font-bold text-gray-900">{job.eligibilityCriteria?.cgpa || 'N/A'}</span>
                              </div>
                              <div>
                                  <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Departments</span>
                                  <div className="flex flex-wrap gap-2">
                                      {job.eligibilityCriteria?.department?.map(dept => (
                                          <span key={dept} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700">
                                              {dept}
                                          </span>
                                      )) || 'Open for All'}
                                  </div>
                              </div>
                              <div className="sm:col-span-2">
                                  <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Required Skills</span>
                                  <div className="flex flex-wrap gap-2">
                                      {job.eligibilityCriteria?.skills?.map(skill => (
                                          <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                                              {skill}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </section>

                  {(user?.role === 'admin' || (user?.role === 'student' && ['shortlisted', 'interview', 'selected'].includes(applicationStatus))) && (
                      <section>
                          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Calendar size={20} className="text-gray-400" /> Interview Process
                          </h2>
                          <div className="space-y-4">
                              {job.interviewRounds?.map((round, idx) => (
                                  <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-gray-500">
                                          {idx + 1}
                                      </div>
                                      <div className="flex-grow">
                                          <h4 className="font-bold text-gray-900">{round.roundName}</h4>
                                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                              {round.date && <span>Date: {new Date(round.date).toLocaleDateString()}</span>}
                                              {round.time && <span>Time: {round.time}</span>}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </section>
                  )}
              </div>

              {/* Sidebar */}
              <div className="p-8 bg-gray-50/50">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                      <h3 className="font-bold text-gray-900 mb-4">Job Summary</h3>
                      <div className="space-y-4">
                          <div className="flex items-start gap-3">
                              <DollarSign size={18} className="text-gray-400 mt-0.5" />
                              <div>
                                  <span className="block text-xs text-gray-500">Salary Package</span>
                                  <span className="font-bold text-gray-900">{job.package}</span>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <Clock size={18} className="text-gray-400 mt-0.5" />
                              <div>
                                  <span className="block text-xs text-gray-500">Application Deadline</span>
                                  <span className="font-bold text-gray-900">{new Date(job.deadline).toLocaleDateString()}</span>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <Users size={18} className="text-gray-400 mt-0.5" />
                              <div>
                                  <span className="block text-xs text-gray-500">Posted By</span>
                                  <span className="font-bold text-gray-900">Placement Cell</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {user?.role === 'student' && (
                      <div className="sticky top-8">
                          <button 
                              onClick={handleApply}
                              disabled={job.status !== 'open' || isApplied || !userEligible}
                              className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                                  isApplied
                                      ? 'bg-green-600 text-white cursor-default hover:bg-green-700'
                                      : !userEligible
                                          ? 'bg-red-500 text-white cursor-not-allowed opacity-80'
                                          : job.status === 'open'
                                              ? 'bg-black text-white hover:bg-gray-800 hover:shadow-xl'
                                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                              {isApplied ? (
                                  <><CheckCircle size={24} /> Applied Successfully</>
                              ) : !userEligible ? (
                                  'Not Eligible to Apply'
                              ) : job.status === 'open' ? (
                                  'Apply Now'
                              ) : (
                                  'Applications Closed'
                              )}
                          </button>
                          
                          {!userEligible && !isApplied && (
                              <p className="text-xs text-center text-red-500 mt-3 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                                  You do not meet the eligibility criteria for this role.
                              </p>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default JobDetails;
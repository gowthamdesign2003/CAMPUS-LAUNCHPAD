import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Briefcase, Building, Calendar, CheckCircle, Edit, Trash2, ArrowRight, Clock, Users } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roleFilter, setRoleFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'student') {
        fetchAppliedJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch jobs');
    }
  };

  const fetchAppliedJobs = async () => {
      try {
          const { data } = await api.get('/applications/my');
          const ids = data.map(app => app.job?._id);
          setAppliedJobIds(ids);
      } catch (error) {
          console.error("Failed to fetch applications", error);
      }
  };

  const calculateMatchScore = (job) => {
      if (!user?.profile) return 0;

      let score = 0;
      const { skills = [], cgpa = 0, department = '' } = user.profile;
      const { skills: jobSkills = [], cgpa: jobCgpa = 0, department: jobDepts = [] } = job.eligibilityCriteria || {};

      // 1. Skills Match (60%)
      if (jobSkills.length > 0) {
          const matchedSkills = jobSkills.filter(skill => 
              skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
          );
          score += (matchedSkills.length / jobSkills.length) * 60;
      } else {
          score += 60; // No skills required = full match
      }

      // 2. CGPA Match (20%)
      if (Number(cgpa) >= Number(jobCgpa)) {
          score += 20;
      }

      // 3. Department Match (20%)
      if (jobDepts.length === 0 || jobDepts.some(d => d.toLowerCase() === department.toLowerCase())) {
          score += 20;
      }

      return Math.round(score);
  };

  const isEligible = (job) => {
      if (!user?.profile) return true; // Can't determine, default to true or handle appropriately
      const { cgpa = 0, department = '' } = user.profile;
      const { cgpa: jobCgpa = 0, department: jobDepts = [] } = job.eligibilityCriteria || {};

      // Check CGPA
      if (Number(cgpa) < Number(jobCgpa)) return false;

      // Check Department
      if (jobDepts.length > 0 && !jobDepts.some(d => d.toLowerCase() === department.toLowerCase())) return false;

      return true;
  };

  const handleApply = async (jobId) => {
      try {
          await api.post('/applications', { jobId });
          toast.success('Applied successfully!');
          fetchAppliedJobs(); // Refresh applied status
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to apply');
      }
  }

  const handleDelete = async (jobId) => {
      if (window.confirm('Are you sure you want to delete this job?')) {
          try {
              await api.delete(`/jobs/${jobId}`);
              toast.success('Job deleted successfully');
              fetchJobs();
          } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to delete job');
          }
      }
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
      const matchesRole = roleFilter 
          ? job.role.toLowerCase().includes(roleFilter.toLowerCase()) 
          : true;
      const matchesPackage = packageFilter 
          ? job.package.toLowerCase().includes(packageFilter.toLowerCase()) 
          : true;
      return matchesRole && matchesPackage;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Opportunities</h1>
            <p className="text-gray-500 mt-1">Find and apply for the best roles matching your skills.</p>
        </div>
        {user?.role === 'admin' && (
            <button 
                onClick={() => navigate('/admin')}
                className="btn-primary flex items-center gap-2"
            >
                <Edit size={18} /> Post New Job
            </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <div className="relative">
                <input
                    type="text"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-all"
                />
                <Briefcase size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
        </div>
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Package</label>
            <div className="relative">
                <input
                    type="text"
                    value={packageFilter}
                    onChange={(e) => setPackageFilter(e.target.value)}
                    placeholder="e.g. 12 LPA"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-all"
                />
                <Briefcase size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
        </div>
        {(roleFilter || packageFilter) && (
            <div className="flex items-end">
                <button
                    onClick={() => { setRoleFilter(''); setPackageFilter(''); }}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden group">
            
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                            <Building size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{job.role}</h3>
                            <p className="text-sm text-gray-500 font-medium">{job.companyName}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        job.status === 'open' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        {job.status}
                    </span>
                </div>

                {/* AI Eligibility Score (Student Only) */}
                {user?.role === 'student' && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">AI Eligibility Match</span>
                            <span className={`text-sm font-bold ${
                                calculateMatchScore(job) >= 80 ? 'text-green-600' : 
                                calculateMatchScore(job) >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {calculateMatchScore(job)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    calculateMatchScore(job) >= 80 ? 'bg-green-500' : 
                                    calculateMatchScore(job) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${calculateMatchScore(job)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                    <div className="flex items-center gap-1.5">
                        <Briefcase size={14} />
                        <span>{job.package || 'Not disclosed'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}</span>
                    </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {job.description}
                </p>
                
                {/* Skills Tags */}
                {job.eligibilityCriteria?.skills && job.eligibilityCriteria.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {job.eligibilityCriteria.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                                {skill}
                            </span>
                        ))}
                        {job.eligibilityCriteria.skills.length > 4 && (
                            <span className="px-2 py-1 rounded-md text-xs text-gray-400">+{job.eligibilityCriteria.skills.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Interview Rounds Display */}
                {job.interviewRounds && job.interviewRounds.length > 0 && (
                    <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold text-xs uppercase tracking-wide">
                            <Calendar size={14} /> Interview Schedule
                        </div>
                        <div className="space-y-3">
                            {job.interviewRounds.map((round, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                                    <span className="font-semibold text-gray-900">{round.roundName}</span>
                                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                                        {round.date && (
                                            <span>{new Date(round.date).toLocaleDateString()}</span>
                                        )}
                                        {round.time && (
                                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{round.time}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                {user?.role === 'admin' ? (
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick={() => navigate(`/jobs/${job._id}/edit`)}
                            className="flex-1 btn-secondary py-2 text-xs"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(job._id)}
                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 rounded-md text-xs font-bold transition-colors border border-red-100"
                        >
                            Delete
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => handleApply(job._id)}
                        disabled={job.status !== 'open' || appliedJobIds.includes(job._id) || !isEligible(job)}
                        className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            appliedJobIds.includes(job._id)
                                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                : !isEligible(job)
                                    ? 'bg-red-50 text-red-700 border border-red-200 cursor-not-allowed'
                                    : job.status === 'open'
                                        ? 'bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {appliedJobIds.includes(job._id) ? (
                            <>
                                <CheckCircle size={16} /> Applied
                            </>
                        ) : !isEligible(job) ? (
                            'Not Eligible'
                        ) : job.status === 'open' ? (
                            <>Apply Now <ArrowRight size={16} /></>
                        ) : (
                            'Applications Closed'
                        )}
                    </button>
                )}
            </div>
          </div>
        ))}
        
        {filteredJobs.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Briefcase size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
                <p className="text-gray-500">
                    {roleFilter || packageFilter 
                        ? "Try adjusting your filters to see more results." 
                        : "Check back later for new opportunities."}
                </p>
                {(roleFilter || packageFilter) && (
                    <button
                        onClick={() => { setRoleFilter(''); setPackageFilter(''); }}
                        className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
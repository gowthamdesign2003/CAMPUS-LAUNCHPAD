import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Briefcase, Building, Calendar, CheckCircle, Edit, Trash2, ArrowRight, Clock, Users, Zap, Search, ChevronDown, X, MapPin } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roleFilter, setRoleFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // 'role', 'package', 'date', 'location', 'company' or null

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch jobs');
    }
  }, []);

  const fetchAppliedJobs = useCallback(async () => {
      try {
          const { data } = await api.get('/applications/my');
          const ids = data.map(app => app.job?._id);
          setAppliedJobIds(ids);
      } catch (error) {
          console.error("Failed to fetch applications", error);
      }
  }, []);

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'student') {
        fetchAppliedJobs();
    }
  }, [user, fetchJobs, fetchAppliedJobs]);

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

  const calculateMatchScore = (job) => {
      if (!user?.profile) return 0;

      // First check strict eligibility
      const eligible = isEligible(job);

      let score = 0;
      const { skills = [], cgpa = 0, department = '' } = user.profile;
      const { skills: jobSkills = [], cgpa: jobCgpa = 0, department: jobDepts = [] } = job.eligibilityCriteria || {};

      // 1. Skills Match (60%)
      let skillsScore = 0;
      if (jobSkills.length > 0) {
          const matchedSkills = jobSkills.filter(skill => 
              skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
          );
          skillsScore = (matchedSkills.length / jobSkills.length) * 60;
      } else {
          skillsScore = 60; // No skills required = full match
      }

      // 2. CGPA Match (20%)
      let academicScore = 0;
      if (Number(cgpa) >= Number(jobCgpa)) {
          academicScore += 20;
      }

      // 3. Department Match (20%)
      if (jobDepts.length === 0 || jobDepts.some(d => d.toLowerCase() === department.toLowerCase())) {
          academicScore += 20;
      }

      score = skillsScore + academicScore;

      // If strictly not eligible (failed mandatory criteria), cap score at 40% (Red)
      if (!eligible) {
          return Math.min(Math.round(score), 40);
      }

      return Math.round(score);
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

  const nowRef = useRef(Date.now());
  const filteredJobs = jobs.filter(job => {
      const matchesRole = roleFilter 
          ? job.role.toLowerCase().includes(roleFilter.toLowerCase()) || 
            job.companyName.toLowerCase().includes(roleFilter.toLowerCase()) ||
            (job.eligibilityCriteria?.skills && job.eligibilityCriteria.skills.some(skill => skill.toLowerCase().includes(roleFilter.toLowerCase())))
          : true;
      const matchesPackage = packageFilter 
          ? parseInt(job.package) >= parseInt(packageFilter)
          : true;
      const matchesDate = dateFilter
          ? (new Date(job.createdAt) >= new Date(nowRef.current - parseInt(dateFilter) * 24 * 60 * 60 * 1000))
          : true;
      const matchesLocation = locationFilter
          ? (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()))
          : true;
      const matchesCompany = companyFilter
          ? job.companyName.toLowerCase().includes(companyFilter.toLowerCase())
          : true;
          
      return matchesRole && matchesPackage && matchesDate && matchesLocation && matchesCompany;
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
                onClick={() => navigate('/admin/post-job')}
                className="btn-primary flex items-center gap-2"
            >
                <Edit size={18} /> Post New Job
            </button>
        )}
      </div>

      {/* LinkedIn Style Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
             {/* Search Bar */}
             <div className="relative w-full md:w-96">
                <input
                    type="text"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    placeholder="Search by title, skill, or company"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            </div>

            {/* Pill Filters */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Package Filter Pill */}
                <div className="relative">
                    <button 
                        onClick={() => setActiveFilter(activeFilter === 'package' ? null : 'package')}
                        className={`px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 transition-all ${
                            packageFilter || activeFilter === 'package'
                                ? 'bg-green-700 text-white border-green-700 hover:bg-green-800'
                                : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-100 hover:border-gray-500'
                        }`}
                    >
                        Package {packageFilter && `(${packageFilter})`}
                        <ChevronDown size={14} className={`transition-transform ${activeFilter === 'package' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown for Package */}
                    {activeFilter === 'package' && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Package (LPA)</label>
                            <input
                                type="text"
                                value={packageFilter}
                                onChange={(e) => setPackageFilter(e.target.value)}
                                placeholder="e.g. 10"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black"
                                autoFocus
                            />
                            <div className="flex justify-end mt-3 gap-2">
                                <button 
                                    onClick={() => { setPackageFilter(''); setActiveFilter(null); }}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={() => setActiveFilter(null)}
                                    className="px-3 py-1 bg-green-700 text-white text-xs font-bold rounded-md hover:bg-green-800"
                                >
                                    Show results
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Posted Filter Pill */}
                <div className="relative">
                    <button 
                        onClick={() => setActiveFilter(activeFilter === 'date' ? null : 'date')}
                        className={`px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 transition-all ${
                            dateFilter || activeFilter === 'date'
                                ? 'bg-green-700 text-white border-green-700 hover:bg-green-800'
                                : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-100 hover:border-gray-500'
                        }`}
                    >
                        Date Posted {dateFilter && '(Applied)'}
                        <ChevronDown size={14} className={`transition-transform ${activeFilter === 'date' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeFilter === 'date' && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Posted Within</label>
                            <div className="space-y-2">
                                {[
                                    { label: 'Any Time', value: '' },
                                    { label: 'Past 24 hours', value: '1' },
                                    { label: 'Past Week', value: '7' },
                                    { label: 'Past Month', value: '30' }
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="dateFilter"
                                            checked={dateFilter === option.value}
                                            onChange={() => setDateFilter(option.value)}
                                            className="text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end mt-3 gap-2">
                                <button 
                                    onClick={() => setActiveFilter(null)}
                                    className="px-3 py-1 bg-green-700 text-white text-xs font-bold rounded-md hover:bg-green-800"
                                >
                                    Show results
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Company Filter Pill */}
                <div className="relative">
                    <button 
                        onClick={() => setActiveFilter(activeFilter === 'company' ? null : 'company')}
                        className={`px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 transition-all ${
                            companyFilter || activeFilter === 'company'
                                ? 'bg-green-700 text-white border-green-700 hover:bg-green-800'
                                : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-100 hover:border-gray-500'
                        }`}
                    >
                        Company {companyFilter && `(${companyFilter})`}
                        <ChevronDown size={14} className={`transition-transform ${activeFilter === 'company' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeFilter === 'company' && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company Name</label>
                            <input
                                type="text"
                                value={companyFilter}
                                onChange={(e) => setCompanyFilter(e.target.value)}
                                placeholder="e.g. Zoho"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black"
                                autoFocus
                            />
                            <div className="flex justify-end mt-3 gap-2">
                                <button 
                                    onClick={() => { setCompanyFilter(''); setActiveFilter(null); }}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={() => setActiveFilter(null)}
                                    className="px-3 py-1 bg-green-700 text-white text-xs font-bold rounded-md hover:bg-green-800"
                                >
                                    Show results
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Location Filter Pill */}
                <div className="relative">
                    <button 
                        onClick={() => setActiveFilter(activeFilter === 'location' ? null : 'location')}
                        className={`px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 transition-all ${
                            locationFilter || activeFilter === 'location'
                                ? 'bg-green-700 text-white border-green-700 hover:bg-green-800'
                                : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-100 hover:border-gray-500'
                        }`}
                    >
                        Location {locationFilter && `(${locationFilter})`}
                        <ChevronDown size={14} className={`transition-transform ${activeFilter === 'location' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeFilter === 'location' && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City / Region</label>
                            <input
                                type="text"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                placeholder="e.g. Coimbatore"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black"
                                autoFocus
                            />
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 font-medium">
                                <Edit size={12} />
                                <span>Within 80 km</span>
                            </div>

                            <div className="flex justify-end mt-3 gap-2">
                                <button 
                                    onClick={() => { setLocationFilter(''); setActiveFilter(null); }}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={() => setActiveFilter(null)}
                                    className="px-3 py-1 bg-green-700 text-white text-xs font-bold rounded-md hover:bg-green-800"
                                >
                                    Show results
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {(roleFilter || packageFilter || dateFilter || companyFilter || locationFilter) && (
                    <button 
                        onClick={() => { setRoleFilter(''); setPackageFilter(''); setDateFilter(''); setCompanyFilter(''); setLocationFilter(''); }}
                        className="ml-2 text-sm font-semibold text-gray-500 hover:text-black flex items-center gap-1"
                    >
                        Reset <X size={14} />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden group">
            
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                            <Building size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{job.role}</h3>
                            <p className="text-sm text-gray-500 font-medium">{job.companyName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                            job.status === 'open' 
                                ? 'bg-green-50 text-green-700 border-green-100' 
                                : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                            {job.status}
                        </span>
                        
                        {user?.role === 'student' && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                                calculateMatchScore(job) >= 80 ? 'bg-green-50 text-green-700 border-green-100' : 
                                calculateMatchScore(job) >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                <Zap size={12} className="inline" />
                                {calculateMatchScore(job)}% Match
                            </span>
                        )}
                    </div>
                </div>

                <div 
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="cursor-pointer group-hover:opacity-90 transition-opacity"
                >
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-5">
                        <div className="flex items-center gap-1.5">
                            <Briefcase size={14} />
                            <span>{job.package || 'Not disclosed'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>{job.location || 'Location N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users size={14} />
                            <span>{job.openings || 'Multiple'} Openings</span>
                        </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {job.description}
                    </p>
                    
                    {/* Skills Tags */}
                    {job.eligibilityCriteria?.skills && job.eligibilityCriteria.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {job.eligibilityCriteria.skills.slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                    {skill}
                                </span>
                            ))}
                            {job.eligibilityCriteria.skills.length > 4 && (
                                <span className="px-2 py-1 rounded-md text-[11px] text-gray-400">+{job.eligibilityCriteria.skills.length - 4}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Interview Rounds Display */}
                {job.interviewRounds && job.interviewRounds.length > 0 && (
                    <div className="mb-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-xs uppercase tracking-wide">
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
                                            <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">{round.time}</span>
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

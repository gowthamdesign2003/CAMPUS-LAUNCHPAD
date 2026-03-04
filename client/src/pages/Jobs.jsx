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

  const nowRef = useRef(0);
  useEffect(() => {
    nowRef.current = Date.now();
  }, []);
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

      {/* Jobs List */}
      <div className="flex flex-col gap-6">
        {filteredJobs.map((job) => (
          <div key={job._id} className="bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-gray-300/80 transition-all duration-300 flex group">
            {/* Left Column: Company Name */}
            <div className="w-44 flex-shrink-0 bg-gray-50/60 border-r border-gray-200/80 flex items-center justify-center p-5">
                <div className="text-center">
                    <h4 className="font-bold text-gray-800 text-lg tracking-tight">{job.companyName}</h4>
                    {job.companyWebsite && (
                        <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 font-medium">
                            View Website
                        </a>
                    )}
                </div>
            </div>

            {/* Right Column: Job Details */}
            <div className="p-5 flex-grow flex flex-col">
                {/* Top section: Badges and actions */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize tracking-wide ring-1 ${
                            job.status === 'open' 
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80' 
                                : 'bg-rose-50 text-rose-700 ring-rose-200/80'
                        }`}>
                            {job.status}
                        </span>
                        {user?.role === 'student' && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ring-1 ${
                                calculateMatchScore(job) >= 80 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80' : 
                                calculateMatchScore(job) >= 50 ? 'bg-amber-50 text-amber-700 ring-amber-200/80' : 'bg-rose-50 text-rose-700 ring-rose-200/80'
                            }`}>
                                <Zap size={13} className="shrink-0 -ml-0.5" />
                                {calculateMatchScore(job)}% Match
                            </span>
                        )}
                    </div>
                    {/* Action icons can go here if needed */}
                </div>

                {/* Main Info */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${job._id}`)}>{job.role}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                            <div className="inline-flex items-center gap-1.5"><MapPin size={14} /> {job.location || 'Not specified'}</div>
                            <div className="inline-flex items-center gap-1.5"><Briefcase size={14} /> {job.package || 'Not disclosed'}</div>
                            <div className="inline-flex items-center gap-1.5"><Clock size={14} /> {job.deadline ? `Apply by ${new Date(job.deadline).toLocaleDateString()}` : 'No Deadline'}</div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-4">
                        {user?.role === 'admin' ? (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => navigate(`/jobs/${job._id}/edit`)}
                                    className="h-10 px-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(job._id)}
                                    className="h-10 px-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => navigate(`/jobs/${job._id}`)}
                                className="h-11 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gray-900 text-white hover:bg-gray-700"
                            >
                                View Job <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-grow" />

                {/* Footer: Skills and Apply button */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                    {job.eligibilityCriteria?.skills && job.eligibilityCriteria.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {job.eligibilityCriteria.skills.slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200/80">
                                    {skill}
                                </span>
                            ))}
                            {job.eligibilityCriteria.skills.length > 4 && (
                                <span className="px-2 py-1 rounded-md text-xs text-gray-400 font-medium">+{job.eligibilityCriteria.skills.length - 4} more</span>
                            )}
                        </div>
                    ) : <div />}
                    {user?.role === 'student' && (
                         <button 
                            onClick={() => handleApply(job._id)}
                            disabled={job.status !== 'open' || appliedJobIds.includes(job._id) || !isEligible(job)}
                            className={`h-9 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                appliedJobIds.includes(job._id)
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : !isEligible(job)
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : job.status === 'open'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                        >
                            {appliedJobIds.includes(job._id) ? (
                                <><CheckCircle size={14} /> Applied</>
                            ) : !isEligible(job) ? (
                                'Not Eligible'
                            ) : job.status === 'open' ? (
                                'Apply Now'
                            ) : (
                                'Closed'
                            )}
                        </button>
                    )}
                </div>
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

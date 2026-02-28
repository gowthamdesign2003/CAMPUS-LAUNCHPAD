import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, X, Edit, Trash2, Building, Briefcase, Calendar, Clock, Check, Users, BarChart } from 'lucide-react';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    companyName: '',
    role: '',
    description: '',
    package: '',
    cgpa: '',
    department: '',
    skills: [],
    deadline: '',
    interviewRounds: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [roundInput, setRoundInput] = useState({
      roundName: '',
      date: '',
      time: '',
      link: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch jobs');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
        const jobData = {
            companyName: newJob.companyName,
            role: newJob.role,
            description: newJob.description,
            package: newJob.package,
            eligibilityCriteria: {
                cgpa: Number(newJob.cgpa),
                department: newJob.department ? newJob.department.split(',').map(d => d.trim()) : [],
                skills: newJob.skills
            },
            deadline: newJob.deadline,
            interviewRounds: newJob.interviewRounds
        };

        await api.post('/jobs', jobData);
        toast.success('Job posted successfully!');
        setShowCreateForm(false);
        fetchJobs();
        setNewJob({
            companyName: '',
            role: '',
            description: '',
            package: '',
            cgpa: '',
            department: '',
            skills: [],
            deadline: '',
            interviewRounds: []
        });
        setSkillInput('');
        setRoundInput({ roundName: '', date: '', time: '', link: '' });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create job');
    }
  };

  const handleChange = (e) => {
      setNewJob({ ...newJob, [e.target.name]: e.target.value });
  }

  const handleAddSkill = () => {
      if (skillInput.trim() && !newJob.skills.includes(skillInput.trim())) {
          setNewJob({ ...newJob, skills: [...newJob.skills, skillInput.trim()] });
          setSkillInput('');
      }
  };

  const removeSkill = (skillToRemove) => {
      setNewJob({ ...newJob, skills: newJob.skills.filter(s => s !== skillToRemove) });
  };

  const handleAddRound = () => {
    if (roundInput.roundName) {
        setNewJob({ ...newJob, interviewRounds: [...newJob.interviewRounds, roundInput] });
        setRoundInput({ roundName: '', date: '', time: '', link: '' });
    }
  };

  const removeRound = (index) => {
      const updatedRounds = [...newJob.interviewRounds];
      updatedRounds.splice(index, 1);
      setNewJob({ ...newJob, interviewRounds: updatedRounds });
  };

  const handleDeleteJob = async (jobId) => {
      if(window.confirm("Are you sure you want to delete this job?")) {
          try {
              await api.delete(`/jobs/${jobId}`);
              toast.success("Job deleted");
              fetchJobs();
          } catch (error) {
              toast.error("Failed to delete job");
          }
      }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage jobs, applications, and recruitment drives.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/admin/student-status')}
                className="btn-secondary flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
                <BarChart size={20} /> Student Status
            </button>
            <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
                {showCreateForm ? <X size={20} /> : <Plus size={20} />}
                {showCreateForm ? 'Cancel' : 'Post New Job'}
            </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 mb-10 animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100">Create New Job Posting</h2>
            <form onSubmit={handleCreateJob} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                        <input type="text" name="companyName" value={newJob.companyName} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. Google" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Role</label>
                        <input type="text" name="role" value={newJob.role} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. Software Engineer" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea name="description" value={newJob.description} onChange={handleChange} required rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Job description and responsibilities..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Package (LPA)</label>
                        <input type="text" name="package" value={newJob.package} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. 12 LPA" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Min CGPA</label>
                        <input type="number" step="0.01" name="cgpa" value={newJob.cgpa} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. 7.5" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                        <input type="date" name="deadline" value={newJob.deadline} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                    </div>
                    <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">Departments (comma separated)</label>
                         <input type="text" name="department" value={newJob.department} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="CSE, ECE, MECH" />
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={skillInput} 
                            onChange={(e) => setSkillInput(e.target.value)} 
                            className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                            placeholder="Add a skill..."
                        />
                        <button type="button" onClick={handleAddSkill} className="btn-secondary">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {newJob.skills.map((skill, idx) => (
                            <span key={idx} className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                {skill} <X size={14} className="cursor-pointer hover:text-gray-300" onClick={() => removeSkill(skill)} />
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button type="submit" className="btn-primary w-full md:w-auto px-8 py-3 rounded-xl">Post Job</button>
                </div>
            </form>
        </div>
      )}

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.role}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${job.status === 'open' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {job.status}
                        </span>
                    </div>
                    <div className="text-gray-500 font-medium mb-1">{job.companyName}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                        <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.package}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Users size={14} /> Applications: {job.applications?.length || 0}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => navigate(`/admin/applications/${job._id}`)}
                        className="flex-1 md:flex-none btn-secondary py-2 text-sm"
                    >
                        View Applications
                    </button>
                    <button 
                        onClick={() => navigate(`/jobs/${job._id}/edit`)}
                        className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Job"
                    >
                        <Edit size={20} />
                    </button>
                    <button 
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Job"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        ))}
        
        {jobs.length === 0 && (
             <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                 <p className="text-gray-500 font-medium">No active job postings. Create one to get started.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;



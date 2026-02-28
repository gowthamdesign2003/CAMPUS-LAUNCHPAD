import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Download, FileText, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, User, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // 'asc' | 'desc' | 'none'

  useEffect(() => {
    fetchJobAndApplications();
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}`)
      ]);
      setJob(jobRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchJobAndApplications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredApplications = applications.filter(app => {
      const appStatus = app.status ? app.status.toLowerCase() : 'applied';
      const matchesStatus = filterStatus === 'all' 
          ? appStatus !== 'rejected' 
          : appStatus === filterStatus;
      const matchesSearch = app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
  }).sort((a, b) => {
      if (sortOrder === 'none') return 0;
      const cgpaA = parseFloat(a.student?.cgpa || 0);
      const cgpaB = parseFloat(b.student?.cgpa || 0);
      return sortOrder === 'asc' ? cgpaA - cgpaB : cgpaB - cgpaA;
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.role}</h1>
              <p className="text-gray-500 mt-1">{job.companyName}</p>
          </div>
          <div className="flex gap-3">
              <button className="btn-secondary flex items-center gap-2">
                  <Download size={18} /> Export List
              </button>
              <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 border border-gray-200">
                  Total Applications: {applications.length}
              </div>
          </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
              <input 
                  type="text" 
                  placeholder="Search candidate name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-all"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {['all', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'].map(status => (
                  <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                          filterStatus === status 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                  >
                      {status}
                  </button>
              ))}
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          <th className="px-6 py-4">Candidate</th>
                          <th className="px-6 py-4">
                              <button 
                                  onClick={() => setSortOrder(curr => curr === 'desc' ? 'asc' : 'desc')}
                                  className="flex items-center gap-1 hover:text-black transition-colors"
                              >
                                  Academic Profile
                                  {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} className={sortOrder === 'none' ? 'text-gray-300' : ''} />}
                              </button>
                          </th>
                          <th className="px-6 py-4">Resume</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredApplications.length === 0 ? (
                          <tr>
                              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                          </tr>
                      ) : (
                          filteredApplications.map((app) => (
                              <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                              {app.student?.name?.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                              <p className="font-bold text-gray-900">{app.student?.name}</p>
                                              <p className="text-xs text-gray-500">{app.student?.email}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                      <p><span className="font-bold text-gray-900">Dept:</span> {app.student?.department || 'N/A'}</p>
                                      <p><span className="font-bold text-gray-900">CGPA:</span> {app.student?.cgpa || 'N/A'}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                      {app.student?.resumeLink ? (
                                          <a 
                                              href={app.student?.resumeLink} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                                          >
                                              <FileText size={16} /> View Resume
                                          </a>
                                      ) : (
                                          <span className="text-gray-400 text-sm italic">No Resume</span>
                                      )}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                          app.status === 'selected' ? 'bg-green-50 text-green-700 border-green-200' :
                                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                          app.status === 'interview' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                          app.status === 'shortlisted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                          'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}>
                                          {app.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <select 
                                          value={app.status}
                                          onChange={(e) => updateStatus(app._id, e.target.value)}
                                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-black bg-white"
                                      >
                                          <option value="Applied">Applied</option>
                                          <option value="Shortlisted">Shortlisted</option>
                                          <option value="Interview">Interview</option>
                                          <option value="Selected">Selected</option>
                                          <option value="Rejected">Rejected</option>
                                      </select>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default JobApplications;
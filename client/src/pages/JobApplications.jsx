import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const JobApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
      try {
          const { data } = await api.get(`/jobs/${jobId}`);
          setJob(data);
      } catch (error) {
          console.error(error);
      }
  }

  const fetchApplications = async () => {
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplications(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch applications');
    }
  };

  const updateStatus = async (id, status) => {
      if (!id) {
          toast.error('Invalid Application ID');
          return;
      }
      try {
          await api.put(`/applications/${id}`, { status });
          toast.success(`Status updated to ${status}`);
          fetchApplications();
      } catch (error) {
          console.error("Update Status Error:", error);
          toast.error(error.response?.data?.message || 'Failed to update status');
      }
  }

  const exportToExcel = () => {
      if (applications.length === 0) {
          toast.info("No applications to export");
          return;
      }

      const dataToExport = applications.map(app => ({
          'Candidate Name': app.student?.name || 'N/A',
          'Email': app.student?.email || 'N/A',
          'Department': app.student?.department || 'N/A',
          'CGPA': app.student?.cgpa || 'N/A',
          'Status': app.status,
          'Resume Link': app.resumeLink ? (app.resumeLink.startsWith('http') ? app.resumeLink : `http://localhost:5001${app.resumeLink}`) : 'N/A',
          'Applied Date': new Date(app.createdAt).toLocaleDateString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
      
      // Generate filename with job role and date
      const fileName = `${job?.role || 'Job'}_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      toast.success("Spreadsheet downloaded successfully");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
          <Link to="/admin" className="text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">{job?.role}</h2>
                <p className="text-gray-500 text-lg">{job?.companyName}</p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={exportToExcel}
                    className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
                    title="Export to Excel"
                >
                    <FileSpreadsheet size={16} /> Export List
                </button>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded text-sm text-gray-600">
                    Total Applications: <span className="font-bold text-black">{applications.length}</span>
                </div>
            </div>
          </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Profile</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resume</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="font-medium text-gray-900">{app.student?.name}</div>
                                <div className="text-sm text-gray-500">{app.student?.email}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                                <div><span className="font-medium">Dept:</span> {app.student?.department || 'N/A'}</div>
                                <div><span className="font-medium">CGPA:</span> {app.student?.cgpa || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-6">
                                {app.resumeLink ? (
                                    <a 
                                        href={app.resumeLink.startsWith('http') ? app.resumeLink : `http://localhost:5001${app.resumeLink}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Resume <Download size={14} />
                                    </a>
                                ) : (app.student?.resumeLink ? (
                                    <a 
                                        href={app.student.resumeLink.startsWith('http') ? app.student.resumeLink : `http://localhost:5001${app.student.resumeLink}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Resume <Download size={14} />
                                    </a>
                                ) : <span className="text-gray-400 text-sm">Not uploaded</span>)}
                            </td>
                            <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs font-semibold rounded border ${
                                    app.status === 'Selected' ? 'bg-white border-green-200 text-green-800' :
                                    app.status === 'Rejected' ? 'bg-white border-red-200 text-red-800' :
                                    'bg-white border-gray-200 text-gray-800'
                                }`}>
                                    {app.status}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <select 
                                    value={app.status} 
                                    onChange={(e) => updateStatus(app._id, e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-black bg-white"
                                >
                                    <option value="Applied">Applied</option>
                                    <option value="Shortlisted">Shortlisted</option>
                                    <option value="Interview">Interview</option>
                                    <option value="Selected">Selected</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                     {applications.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center py-12 text-gray-500">
                                No applications received yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;

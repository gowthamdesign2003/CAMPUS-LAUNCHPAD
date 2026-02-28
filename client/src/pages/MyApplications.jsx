import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FileText, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/my');
      setApplications(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch applications');
    }
  };

  const getStatusConfig = (status) => {
      switch(status) {
          case 'Applied': return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
          case 'Shortlisted': return { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle };
          case 'Interview': return { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Calendar };
          case 'Selected': return { color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle };
          case 'Rejected': return { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle };
          default: return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle };
      }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of your job applications and interviews.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="py-5 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Company & Role</th>
                        <th className="py-5 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applied On</th>
                        <th className="py-5 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-5 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Interview Details</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {applications.map((app) => {
                        const statusConfig = getStatusConfig(app.status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                            <tr key={app._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-5 px-6">
                                    <div className="font-bold text-gray-900 text-base">{app.job?.companyName}</div>
                                    <div className="text-sm text-gray-500 font-medium">{app.job?.role}</div>
                                </td>
                                <td className="py-5 px-6">
                                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                                        <Calendar size={14} className="mr-2 text-gray-400" />
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="py-5 px-6">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                                        <StatusIcon size={14} className="mr-1.5" />
                                        {app.status}
                                    </span>
                                </td>
                                <td className="py-5 px-6">
                                    {app.job?.interviewRounds && app.job.interviewRounds.length > 0 ? (
                                        <div className="space-y-2">
                                            {app.job.interviewRounds.map((round, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{round.roundName}</span>
                                                        {round.date && <span className="text-xs text-gray-500">({new Date(round.date).toLocaleDateString()})</span>}
                                                    </div>
                                                    {round.link && (
                                                        <a href={round.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block truncate max-w-[150px]">
                                                            Join Link
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : app.interviewDate ? (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-yellow-50 text-yellow-700 p-2 rounded-lg border border-yellow-100">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 uppercase">Interview Scheduled</div>
                                                <div className="text-sm font-medium text-gray-900">{new Date(app.interviewDate).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400 font-medium">No schedule yet</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {applications.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center py-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Applications Yet</h3>
                                <p className="text-gray-500 text-sm">Start applying to jobs to see them here.</p>
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

export default MyApplications;

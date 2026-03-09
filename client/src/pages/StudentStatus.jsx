import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Users, CheckCircle, XCircle, Search, User } from 'lucide-react';

const StudentStatus = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = ['All', 'CSE', 'IT', 'AI & ML', 'CSD', 'AI & DS', 'ECE', 'MECH', 'CIVIL'];

  const fetchStudentStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/status?department=${selectedDept}`);
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch student status');
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchStudentStatus();
  }, [fetchStudentStatus]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CountUp = ({ to = 0, duration = 800 }) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
      let raf;
      const start = performance.now();
      const animate = (t) => {
        const p = Math.min(1, (t - start) / duration);
        setVal(Math.round(p * to));
        if (p < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, [to, duration]);
    return <>{val}</>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Placement Status</h1>
        <p className="text-gray-500 mt-1">Track placement progress and offer letters across departments.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-600">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl ring-1 ring-gray-900/5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Students</div>
          <div className="text-4xl font-extrabold text-gray-900">
            <CountUp to={students.length} />
          </div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1.5 bg-gray-800 rounded-full transition-all" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl ring-1 ring-gray-900/5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Placed Students</div>
          <div className="text-4xl font-extrabold text-emerald-700 flex items-baseline gap-2">
            <CountUp to={students.filter(s => s.isPlaced).length} />
            <span className="text-sm font-medium text-gray-400">
              ({students.length > 0 ? Math.round((students.filter(s => s.isPlaced).length / students.length) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-emerald-50 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-emerald-600 rounded-full transition-all"
              style={{ width: `${students.length > 0 ? Math.round((students.filter(s => s.isPlaced).length / students.length) * 100) : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl ring-1 ring-gray-900/5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Offers</div>
          <div className="text-4xl font-extrabold text-indigo-700">
            <CountUp to={students.reduce((acc, curr) => acc + (curr.offerCount || 0), 0)} />
          </div>
          <div className="mt-2 h-1.5 bg-indigo-50 rounded-full overflow-hidden">
            <div className="h-1.5 bg-indigo-600 rounded-full transition-all" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-gray-500">Loading student data...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applications</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Offers</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CGPA</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Verified</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/admin/student/${student._id}`)}>{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.email}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                        {student.department || 'N/A'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">{student.year || '-'}</td>
                                <td className="py-4 px-6">
                                    {student.isPlaced ? (
                                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                            <CheckCircle size={12} /> Placed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                                            <XCircle size={12} /> Not Placed
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="font-semibold text-gray-900">{student.applicationsCount ?? '-'}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="font-semibold text-gray-900">{student.offerCount}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm text-gray-600">{student.cgpa || '-'}</div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {student.mobile || '-'}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                      student.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-200'
                                    }`}>
                                      {student.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentStatus;

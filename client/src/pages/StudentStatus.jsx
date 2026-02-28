import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Users, Filter, CheckCircle, XCircle, Search, Download } from 'lucide-react';

const StudentStatus = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = ['All', 'CSE', 'IT', 'AI & ML', 'CSD', 'AI & DS', 'ECE', 'MECH', 'CIVIL'];

  useEffect(() => {
    fetchStudentStatus();
  }, [selectedDept]);

  const fetchStudentStatus = async () => {
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
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Placement Status</h1>
        <p className="text-gray-500 mt-1">Track placement progress and offer letters across departments.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {departments.map((dept) => (
                <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedDept === dept 
                            ? 'bg-black text-white shadow-md' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                >
                    {dept}
                </button>
            ))}
        </div>
        <div className="relative w-full md:w-64">
            <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Students</div>
              <div className="text-3xl font-bold text-gray-900">{students.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-1">Placed Students</div>
              <div className="text-3xl font-bold text-green-600">
                  {students.filter(s => s.isPlaced).length}
                  <span className="text-sm font-normal text-gray-400 ml-2">
                      ({students.length > 0 ? Math.round((students.filter(s => s.isPlaced).length / students.length) * 100) : 0}%)
                  </span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Offers</div>
              <div className="text-3xl font-bold text-blue-600">
                  {students.reduce((acc, curr) => acc + (curr.offerCount || 0), 0)}
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
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Offers</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CGPA</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="font-bold text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.email}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                        {student.department || 'N/A'}
                                    </span>
                                </td>
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
                                    <div className="font-semibold text-gray-900">{student.offerCount}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm text-gray-600">{student.cgpa || '-'}</div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {student.mobile || '-'}
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
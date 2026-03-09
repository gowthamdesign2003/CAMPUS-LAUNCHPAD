import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { 
  User, Mail, Phone, Calendar, Briefcase, Award, Trophy, 
  Flame, Zap, FileText, ChevronRight, Linkedin, ExternalLink, ArrowLeft 
} from 'lucide-react';

const StudentProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setStudent(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load student profile');
        navigate('/admin/student-status');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-medium">Loading student profile...</div>
      </div>
    );
  }

  if (!student) return null;

  const { name, email, createdAt, profile } = student;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin/student-status')}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black font-bold transition-colors"
      >
        <ArrowLeft size={20} /> BACK TO STATUS
      </button>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12 border-b border-gray-100 pb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="w-36 h-36 rounded-full border-[3px] border-blue-500 flex items-center justify-center bg-gray-50 text-blue-500 text-6xl font-bold shadow-sm overflow-hidden">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="text-center md:text-left pt-2">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{name}</h1>
            <p className="text-gray-400 font-medium text-lg mb-4">{email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span>Joined {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                profile?.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {profile?.isVerified ? 'Verified Account' : 'Pending Verification'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Academic Details Section */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Academic Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                  <Flame size={28} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{profile?.cgpa || '0.0'}</div>
                  <div className="text-gray-400 font-bold text-sm">CGPA Score</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl">
                  <Zap size={28} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{profile?.year || 'N/A'}</div>
                  <div className="text-gray-400 font-bold text-sm">Current Year</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                  <Trophy size={28} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{profile?.department || 'N/A'}</div>
                  <div className="text-gray-400 font-bold text-sm">Department</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                  <Award size={28} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{profile?.tenthPercentage || '0'}%</div>
                  <div className="text-gray-400 font-bold text-sm">10th Percentage</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                  <Award size={28} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{profile?.twelfthPercentage || '0'}%</div>
                  <div className="text-gray-400 font-bold text-sm">12th Percentage</div>
                </div>
              </div>

              {profile?.diplomaPercentage && (
                <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                    <Trophy size={28} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">{profile?.diplomaPercentage}%</div>
                    <div className="text-gray-400 font-bold text-sm">Diploma Percentage</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Achievements Section */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Achievements</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Award size={20} className="text-blue-500" /> Certificates
                </h3>
                <div className="space-y-3">
                  {profile?.certificates?.length > 0 ? profile.certificates.map((cert, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-900">{cert.name}</h4>
                          <p className="text-gray-400 text-xs font-bold uppercase">Completion Certificate</p>
                        </div>
                      </div>
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  )) : (
                    <p className="text-gray-400 font-medium italic">No certificates added yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Trophy size={20} className="text-orange-500" /> Hackathons
                </h3>
                <div className="space-y-3">
                  {profile?.hackathons?.length > 0 ? profile.hackathons.map((hack, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-900">{hack.name}</h4>
                          <p className="text-gray-400 text-xs font-bold uppercase">Hackathon Participation</p>
                        </div>
                      </div>
                      {hack.link && (
                        <a href={hack.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  )) : (
                    <p className="text-gray-400 font-medium italic">No hackathons added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-12 pt-1">
          {/* Skills Sidebar */}
          <section className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-blue-500 mb-6 uppercase tracking-wider">SKILLS</h2>
            {profile?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 font-bold italic">No skills listed.</p>
            )}
          </section>

          {/* Contact Sidebar */}
          <section className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 uppercase tracking-wider">Contact</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="block text-gray-400 text-[10px] font-bold uppercase">Mobile</span>
                  <span className="font-bold text-gray-700">{profile?.mobile || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <Mail size={20} />
                </div>
                <div className="overflow-hidden">
                  <span className="block text-gray-400 text-[10px] font-bold uppercase">Email</span>
                  <span className="font-bold text-gray-700 truncate block">{email}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Links Sidebar */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-gray-900 px-2 uppercase tracking-wider">Professional</h2>
            {profile?.resumeLink ? (
              <a 
                href={profile.resumeLink.startsWith('http') ? profile.resumeLink : `http://localhost:5001${profile.resumeLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <span className="font-bold text-gray-700">View Resume</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400" />
              </a>
            ) : (
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3 opacity-60 italic text-gray-400 font-bold">
                <FileText size={20} /> No Resume Uploaded
              </div>
            )}

            {profile?.linkedinLink && (
              <a 
                href={profile.linkedinLink.startsWith('http') ? profile.linkedinLink : `https://${profile.linkedinLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                    <Linkedin size={20} />
                  </div>
                  <span className="font-bold text-gray-700">LinkedIn Profile</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400" />
              </a>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;

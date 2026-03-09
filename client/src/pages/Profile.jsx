import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Users, BookOpen, FileText, Briefcase, Save, Upload, X, Mail, Lock, Phone, Edit3, Plus, Award, Trophy, Zap, Flame, Calendar, MapPin, ChevronRight, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
    mobile: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    diplomaPercentage: '',
    resumeLink: '',
    linkedinLink: '',
    skills: [],
    certificates: [],
    hackathons: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState({ name: '', link: '' });
  const [hackathonInput, setHackathonInput] = useState({ name: '', link: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        department: user.profile?.department || '',
        year: user.profile?.year || '',
        mobile: user.profile?.mobile || '',
        cgpa: user.profile?.cgpa || '',
        tenthPercentage: user.profile?.tenthPercentage || '',
        twelfthPercentage: user.profile?.twelfthPercentage || '',
        diplomaPercentage: user.profile?.diplomaPercentage || '',
        resumeLink: user.profile?.resumeLink || '',
        linkedinLink: user.profile?.linkedinLink || '',
        skills: user.profile?.skills || [],
        certificates: user.profile?.certificates || [],
        hackathons: user.profile?.hackathons || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddCertificate = () => {
    if (certInput.name.trim()) {
      setFormData(prev => ({ ...prev, certificates: [...prev.certificates, certInput] }));
      setCertInput({ name: '', link: '' });
    }
  };

  const removeCertificate = (index) => {
    setFormData(prev => {
      const newCerts = [...prev.certificates];
      newCerts.splice(index, 1);
      return { ...prev, certificates: newCerts };
    });
  };

  const handleAddHackathon = () => {
    if (hackathonInput.name.trim()) {
      setFormData(prev => ({ ...prev, hackathons: [...prev.hackathons, hackathonInput] }));
      setHackathonInput({ name: '', link: '' });
    }
  };

  const removeHackathon = (index) => {
    setFormData(prev => {
      const newHacks = [...prev.hackathons];
      newHacks.splice(index, 1);
      return { ...prev, hackathons: newHacks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password);
      
      if (user?.role === 'student') {
          if (formData.department) data.append('department', formData.department);
          if (formData.year) data.append('year', formData.year);
          if (formData.mobile) data.append('mobile', formData.mobile);
          if (formData.cgpa) data.append('cgpa', formData.cgpa);
          if (formData.tenthPercentage) data.append('tenthPercentage', formData.tenthPercentage);
          if (formData.twelfthPercentage) data.append('twelfthPercentage', formData.twelfthPercentage);
          if (formData.diplomaPercentage) data.append('diplomaPercentage', formData.diplomaPercentage);
          if (formData.linkedinLink) data.append('linkedinLink', formData.linkedinLink);
          if (formData.skills.length > 0) data.append('skills', JSON.stringify(formData.skills));
          if (formData.certificates.length > 0) data.append('certificates', JSON.stringify(formData.certificates));
          if (formData.hackathons.length > 0) data.append('hackathons', JSON.stringify(formData.hackathons));
          if (resumeFile) data.append('resume', resumeFile);
      }

      await updateProfile(data);
      toast.success('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '' })); 
      setResumeFile(null);
      setIsEditing(false); // Switch back to view mode after save
    } catch (error) {
        console.error(error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isEditing && user?.role === 'student') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12 border-b border-gray-100 pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Large Avatar */}
                <div className="relative group">
                    <div className="w-36 h-36 rounded-full border-[3px] border-blue-500 flex items-center justify-center bg-gray-50 text-blue-500 text-6xl font-bold shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute top-1 right-1 bg-white p-2 rounded-full border border-gray-200 shadow-sm text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-all hover:scale-110"
                    >
                        <Edit3 size={16} />
                    </button>
                    {/* Decorative heart icon from Duolingo image */}
                    <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm text-blue-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                </div>

                <div className="text-center md:text-left pt-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{formData.name}</h1>
                    <p className="text-gray-400 font-medium text-lg mb-4">{formData.email.split('@')[0]}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2026'}</span>
                        </div>
                        <div className="w-6 h-4 bg-red-100 rounded-sm border border-red-200 flex items-center justify-center overflow-hidden">
                             <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_0_1px_white]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setIsEditing(true)}
                className="mt-4 md:mt-2 px-6 py-2.5 bg-blue-500 text-white font-bold rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <Edit3 size={18} /> EDIT PROFILE
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* Academic Details Section */}
                <section>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Academic Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* CGPA Card */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-orange-100 transition-colors">
                            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                                <Flame size={28} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{formData.cgpa || '0.0'}</div>
                                <div className="text-gray-400 font-bold text-sm">CGPA Score</div>
                            </div>
                        </div>

                        {/* Current Year Card */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-yellow-100 transition-colors">
                            <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl">
                                <Zap size={28} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{formData.year || 'N/A'}</div>
                                <div className="text-gray-400 font-bold text-sm">Current Year</div>
                            </div>
                        </div>

                        {/* Department Card */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-yellow-100 transition-colors">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                                <Trophy size={28} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{formData.department || 'N/A'}</div>
                                <div className="text-gray-400 font-bold text-sm">Department</div>
                            </div>
                        </div>

                        {/* 10th Percentage Card */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-red-100 transition-colors">
                            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                <Award size={28} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{formData.tenthPercentage || '0'}%</div>
                                <div className="text-gray-400 font-bold text-sm">10th Percentage</div>
                            </div>
                        </div>

                        {/* 12th Percentage Card */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-blue-100 transition-colors">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                <Award size={28} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{formData.twelfthPercentage || '0'}%</div>
                                <div className="text-gray-400 font-bold text-sm">12th Percentage</div>
                            </div>
                        </div>

                        {/* Diploma Percentage Card */}
                        {formData.diplomaPercentage && (
                            <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-green-100 transition-colors">
                                <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                                    <Trophy size={28} />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">{formData.diplomaPercentage}%</div>
                                    <div className="text-gray-400 font-bold text-sm">Diploma Percentage</div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Achievements Section -> Certificates & Hackathons */}
                <section>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Achievements</h2>
                    <div className="space-y-6">
                        {/* Certificates */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Award size={20} className="text-blue-500" /> Certificates
                            </h3>
                            <div className="space-y-3">
                                {formData.certificates.length > 0 ? formData.certificates.map((cert, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
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

                        {/* Hackathons */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Trophy size={20} className="text-orange-500" /> Hackathons
                            </h3>
                            <div className="space-y-3">
                                {formData.hackathons.length > 0 ? formData.hackathons.map((hack, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-orange-200 transition-all shadow-sm">
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
                    <div className="flex border-b-2 border-gray-100 mb-6">
                        <button className="flex-grow pb-3 text-blue-500 font-extrabold border-b-2 border-blue-500 -mb-0.5 uppercase tracking-wider">SKILLS</button>
                    </div>
                    
                    {formData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Plus size={32} />
                            </div>
                            <p className="text-gray-400 font-bold">Add skills in Edit Profile!</p>
                        </div>
                    )}
                </section>

                {/* Contact Sidebar Section */}
                <section className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6 uppercase tracking-wider">Contact</h2>
                    <div className="space-y-4">
                        {/* Mobile Number */}
                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3 group hover:border-blue-200 transition-all">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <Phone size={20} />
                            </div>
                            <div>
                                <span className="block text-gray-400 text-[10px] font-bold uppercase">Mobile</span>
                                <span className="font-bold text-gray-700">{formData.mobile || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3 group hover:border-blue-200 transition-all">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <Mail size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <span className="block text-gray-400 text-[10px] font-bold uppercase">Email</span>
                                <span className="font-bold text-gray-700 truncate block">{formData.email}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Professional Sidebar Items */}
                <section className="space-y-4">
                    <h2 className="text-xl font-extrabold text-gray-900 px-2">Professional Links</h2>
                    
                    {formData.resumeLink ? (
                        <a 
                            href={formData.resumeLink.startsWith('http') ? formData.resumeLink : `http://localhost:5001${formData.resumeLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <span className="font-bold text-gray-700">View Resume</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </a>
                    ) : (
                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3 opacity-60">
                            <div className="p-2 bg-gray-100 text-gray-400 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <span className="font-bold text-gray-400 italic">No Resume Uploaded</span>
                        </div>
                    )}

                    {formData.linkedinLink ? (
                        <a 
                            href={formData.linkedinLink.startsWith('http') ? formData.linkedinLink : `https://${formData.linkedinLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <Linkedin size={20} />
                                </div>
                                <span className="font-bold text-gray-700">LinkedIn Profile</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </a>
                    ) : (
                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all opacity-50" onClick={() => setIsEditing(true)}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                    <Linkedin size={20} />
                                </div>
                                <span className="font-bold text-gray-700">Connect LinkedIn</span>
                            </div>
                            <Plus size={18} className="text-gray-300" />
                        </div>
                    )}
                </section>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Your Profile</h1>
            <p className="text-gray-500 mt-2">Update your personal information and academic records.</p>
        </div>
        <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-500 font-bold hover:text-black transition-colors"
        >
            CANCEL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <User size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Personal Information</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="John Doe"
                        />
                        <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password <span className="text-gray-400 font-normal text-xs ml-1">(Leave blank to keep current)</span>
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="••••••••"
                        />
                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                </div>
                
                {user?.role === 'student' && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                placeholder="+91 9876543210"
                            />
                            <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                    </div>
                )}
            </div>
        </div>

        {user?.role === 'student' && (
          <>
            {/* Academic Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Academic Details</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. CSE"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year / Semester</label>
                        <input
                            type="text"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="e.g. 4th Year"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CGPA</label>
                        <input
                            type="number"
                            step="0.01"
                            name="cgpa"
                            value={formData.cgpa}
                            onChange={handleChange}
                            placeholder="e.g. 8.5"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">10th Percentage</label>
                        <input
                            type="number"
                            step="0.01"
                            name="tenthPercentage"
                            value={formData.tenthPercentage}
                            onChange={handleChange}
                            placeholder="e.g. 95.5"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">12th Percentage</label>
                        <input
                            type="number"
                            step="0.01"
                            name="twelfthPercentage"
                            value={formData.twelfthPercentage}
                            onChange={handleChange}
                            placeholder="e.g. 88.0"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Diploma Percentage</label>
                        <input
                            type="number"
                            step="0.01"
                            name="diplomaPercentage"
                            value={formData.diplomaPercentage}
                            onChange={handleChange}
                            placeholder="e.g. 85.0 (Optional)"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Resume & Skills Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Briefcase size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Professional Profile</h3>
                </div>
                <div className="p-8 space-y-8">
                    {/* Resume Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resume (PDF)</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-grow cursor-pointer group">
                                <div className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-black transition-all">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-black mb-2 transition-colors" />
                                        <p className="text-sm text-gray-500 font-medium">
                                            {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        className="hidden" 
                                        onChange={(e) => setResumeFile(e.target.files[0])}
                                    />
                                </div>
                            </label>
                        </div>
                        {formData.resumeLink && (
                            <div className="mt-3 flex items-center gap-2 text-sm bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-100 w-fit">
                                <FileText size={16} />
                                <span>Current Resume Available</span>
                                <a 
                                    href={formData.resumeLink.startsWith('http') ? formData.resumeLink : `http://localhost:5001${formData.resumeLink}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-bold hover:underline ml-1"
                                >
                                    View
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Skills & Expertise</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="e.g. React, Python" 
                                value={skillInput} 
                                onChange={(e) => setSkillInput(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                            />
                            <button 
                                type="button" 
                                onClick={handleAddSkill}
                                className="px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        
                        {formData.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-black text-white">
                                        {skill}
                                        <button 
                                            type="button" 
                                            onClick={() => removeSkill(skill)}
                                            className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                        )}
                    </div>

                    {/* LinkedIn Link */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile Link</label>
                        <div className="relative">
                            <input
                                type="url"
                                name="linkedinLink"
                                value={formData.linkedinLink}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                placeholder="https://linkedin.com/in/username"
                            />
                            <Linkedin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Certificates Management */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Certificates</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input 
                                type="text" 
                                placeholder="Certificate Name" 
                                value={certInput.name} 
                                onChange={(e) => setCertInput({...certInput, name: e.target.value})} 
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-all" 
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    placeholder="Certificate Link (Optional)" 
                                    value={certInput.link} 
                                    onChange={(e) => setCertInput({...certInput, link: e.target.value})} 
                                    className="flex-grow px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-all" 
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddCertificate}
                                    className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                        
                        {formData.certificates.length > 0 && (
                            <div className="space-y-2">
                                {formData.certificates.map((cert, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                        <div className="flex items-center gap-3">
                                            <Award size={18} className="text-blue-500" />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{cert.name}</div>
                                                {cert.link && <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{cert.link}</div>}
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeCertificate(index)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hackathons Management */}
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Hackathons</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input 
                                type="text" 
                                placeholder="Hackathon Name" 
                                value={hackathonInput.name} 
                                onChange={(e) => setHackathonInput({...hackathonInput, name: e.target.value})} 
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-all" 
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    placeholder="Hackathon Link (Optional)" 
                                    value={hackathonInput.link} 
                                    onChange={(e) => setHackathonInput({...hackathonInput, link: e.target.value})} 
                                    className="flex-grow px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-all" 
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddHackathon}
                                    className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                        
                        {formData.hackathons.length > 0 && (
                            <div className="space-y-2">
                                {formData.hackathons.map((hack, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                        <div className="flex items-center gap-3">
                                            <Trophy size={18} className="text-orange-500" />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{hack.name}</div>
                                                {hack.link && <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{hack.link}</div>}
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeHackathon(index)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
            <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
                {isSubmitting ? (
                    'Saving...'
                ) : (
                    <>
                        <Save size={20} /> Save Changes
                    </>
                )}
            </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;

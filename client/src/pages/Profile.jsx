import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, BookOpen, FileText, Briefcase, Save, Upload, X, Mail, Lock, Phone } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
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
    skills: [],
  });
  const [skillInput, setSkillInput] = useState('');
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
        skills: user.profile?.skills || [],
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
          if (formData.skills.length > 0) data.append('skills', JSON.stringify(formData.skills));
          if (resumeFile) data.append('resume', resumeFile);
      }

      await updateProfile(data);
      toast.success('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '' })); 
      setResumeFile(null);
    } catch (error) {
        console.error(error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and academic records.</p>
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
                                placeholder="e.g. React, Python (Press Enter to add)" 
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

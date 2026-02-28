import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Briefcase, DollarSign, Calendar, MapPin, CheckSquare, List, Trash2 } from 'lucide-react';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    role: '',
    companyName: '',
    description: '',
    package: '',
    eligibilityCriteria: {
      cgpa: '',
      department: [],
      skills: []
    },
    deadline: '',
    location: '',
    openings: '',
    interviewRounds: []
  });

  const [departmentInput, setDepartmentInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [roundInput, setRoundInput] = useState({ roundName: '', date: '', time: '' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setFormData({
            ...data,
            deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
            location: data.location || '',
            openings: data.openings || '',
            eligibilityCriteria: {
                ...data.eligibilityCriteria,
                cgpa: data.eligibilityCriteria?.cgpa || '',
                department: data.eligibilityCriteria?.department || [],
                skills: data.eligibilityCriteria?.skills || []
            },
            interviewRounds: data.interviewRounds || []
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch job details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddDepartment = () => {
    if (departmentInput.trim()) {
      setFormData({
        ...formData,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          department: [...formData.eligibilityCriteria.department, departmentInput.trim()]
        }
      });
      setDepartmentInput('');
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          skills: [...formData.eligibilityCriteria.skills, skillInput.trim()]
        }
      });
      setSkillInput('');
    }
  };

  const handleAddRound = () => {
    if (roundInput.roundName.trim()) {
      setFormData({
        ...formData,
        interviewRounds: [...formData.interviewRounds, roundInput]
      });
      setRoundInput({ roundName: '', date: '', time: '' });
    }
  };

  const removeArrayItem = (type, index) => {
      if (type === 'dept') {
          const newDepts = [...formData.eligibilityCriteria.department];
          newDepts.splice(index, 1);
          setFormData({ ...formData, eligibilityCriteria: { ...formData.eligibilityCriteria, department: newDepts }});
      } else if (type === 'skill') {
          const newSkills = [...formData.eligibilityCriteria.skills];
          newSkills.splice(index, 1);
          setFormData({ ...formData, eligibilityCriteria: { ...formData.eligibilityCriteria, skills: newSkills }});
      } else if (type === 'round') {
          const newRounds = [...formData.interviewRounds];
          newRounds.splice(index, 1);
          setFormData({ ...formData, interviewRounds: newRounds });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        // Ensure numbers are sent as numbers
        openings: Number(formData.openings) || 0,
        eligibilityCriteria: {
            ...formData.eligibilityCriteria,
            cgpa: Number(formData.eligibilityCriteria.cgpa) || 0
        }
      };
      await api.put(`/jobs/${id}`, payload);
      toast.success('Job updated successfully!');
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update job');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-black text-white p-8">
              <h1 className="text-3xl font-bold">Edit Job</h1>
              <p className="text-gray-400 mt-2">Update job details and requirements.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Details */}
              <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                      <Briefcase size={20} className="text-indigo-600" /> Job Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Job Role</label>
                          <input 
                              type="text" name="role" required
                              value={formData.role} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                              placeholder="e.g. Software Engineer"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                          <input 
                              type="text" name="companyName" required
                              value={formData.companyName} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                              placeholder="e.g. Tech Corp"
                          />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Job Description</label>
                          <textarea 
                              name="description" required rows="4"
                              value={formData.description} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                              placeholder="Describe the role, responsibilities, and requirements..."
                          ></textarea>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Package (LPA)</label>
                          <div className="relative">
                              <DollarSign size={18} className="absolute left-3 top-2.5 text-gray-400" />
                              <input 
                                  type="text" name="package" required
                                  value={formData.package} onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                                  placeholder="e.g. 12 LPA"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Application Deadline</label>
                          <input 
                              type="date" name="deadline" required
                              value={formData.deadline} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                          <input 
                              type="text" name="location"
                              value={formData.location} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                              placeholder="e.g. Bangalore / Remote"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Number of Openings</label>
                          <input 
                              type="number" name="openings"
                              value={formData.openings} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                              placeholder="e.g. 10"
                          />
                      </div>
                  </div>
              </section>

              {/* Eligibility */}
              <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                      <CheckSquare size={20} className="text-green-600" /> Eligibility Criteria
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Minimum CGPA</label>
                          <input 
                              type="number" step="0.1" name="eligibilityCriteria.cgpa"
                              value={formData.eligibilityCriteria.cgpa} onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                              placeholder="e.g. 7.5"
                          />
                      </div>
                      
                      {/* Departments */}
                      <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Allowed Departments</label>
                          <div className="flex gap-2 mb-2">
                              <input 
                                  type="text" 
                                  value={departmentInput}
                                  onChange={(e) => setDepartmentInput(e.target.value)}
                                  className="flex-grow px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                                  placeholder="e.g. CSE"
                              />
                              <button type="button" onClick={handleAddDepartment} className="bg-black text-white px-4 py-2 rounded-xl font-bold">Add</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {formData.eligibilityCriteria.department.map((dept, idx) => (
                                  <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                      {dept} 
                                      <button type="button" onClick={() => removeArrayItem('dept', idx)} className="text-red-500 font-bold">&times;</button>
                                  </span>
                              ))}
                          </div>
                      </div>

                      {/* Skills */}
                      <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Required Skills</label>
                          <div className="flex gap-2 mb-2">
                              <input 
                                  type="text" 
                                  value={skillInput}
                                  onChange={(e) => setSkillInput(e.target.value)}
                                  className="flex-grow px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                                  placeholder="e.g. React.js"
                              />
                              <button type="button" onClick={handleAddSkill} className="bg-black text-white px-4 py-2 rounded-xl font-bold">Add</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {formData.eligibilityCriteria.skills.map((skill, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-100">
                                      {skill} 
                                      <button type="button" onClick={() => removeArrayItem('skill', idx)} className="text-red-500 font-bold hover:text-red-700">&times;</button>
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              </section>

              {/* Interview Rounds */}
              <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                      <List size={20} className="text-orange-600" /> Interview Process
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <input 
                          type="text" 
                          placeholder="Round Name (e.g. Aptitude)"
                          value={roundInput.roundName}
                          onChange={(e) => setRoundInput({...roundInput, roundName: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                      <input 
                          type="date" 
                          value={roundInput.date}
                          onChange={(e) => setRoundInput({...roundInput, date: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      />
                      <div className="flex gap-2">
                          <input 
                              type="time" 
                              value={roundInput.time}
                              onChange={(e) => setRoundInput({...roundInput, time: e.target.value})}
                              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          />
                          <button type="button" onClick={handleAddRound} className="bg-black text-white px-4 py-2 rounded-lg font-bold">Add</button>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      {formData.interviewRounds.map((round, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                              <div>
                                  <span className="font-bold text-gray-900 block">{idx + 1}. {round.roundName}</span>
                                  <span className="text-xs text-gray-500">{round.date} {round.time && `at ${round.time}`}</span>
                              </div>
                              <button type="button" onClick={() => removeArrayItem('round', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              </section>

              <div className="flex justify-end pt-4">
                  <button 
                      type="submit" 
                      className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
                  >
                      Update Job
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
};

export default EditJob;
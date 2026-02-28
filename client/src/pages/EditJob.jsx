import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, X, Plus } from 'lucide-react';

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        companyName: '',
        role: '',
        description: '',
        package: '',
        cgpa: '',
        deadline: '',
        status: 'open',
        skills: [],
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
        const fetchJob = async () => {
            try {
                const { data } = await api.get(`/jobs/${id}`);
                setFormData({
                    companyName: data.companyName,
                    role: data.role,
                    description: data.description,
                    package: data.package,
                    cgpa: data.eligibilityCriteria?.cgpa || '',
                    skills: data.eligibilityCriteria?.skills || [],
                    deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
                    status: data.status,
                    interviewRounds: data.interviewRounds || []
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch job details');
                navigate('/jobs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [id, navigate]);

    const handleUpdateJob = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                companyName: formData.companyName,
                role: formData.role,
                description: formData.description,
                package: formData.package,
                eligibilityCriteria: {
                    cgpa: Number(formData.cgpa),
                    department: [], // Departments logic can be enhanced if needed
                    skills: formData.skills
                },
                deadline: formData.deadline,
                status: formData.status,
                interviewRounds: formData.interviewRounds
            };

            await api.put(`/jobs/${id}`, payload);
            toast.success('Job updated successfully');
            navigate('/jobs');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update job');
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const handleAddRound = () => {
        if (!roundInput.roundName) {
            toast.error('Round name is required');
            return;
        }
        setFormData({
            ...formData,
            interviewRounds: [...formData.interviewRounds, roundInput]
        });
        setRoundInput({ roundName: '', date: '', time: '', link: '' });
    };

    const handleRemoveRound = (index) => {
        const updatedRounds = formData.interviewRounds.filter((_, i) => i !== index);
        setFormData({ ...formData, interviewRounds: updatedRounds });
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <button 
                onClick={() => navigate('/jobs')}
                className="flex items-center text-gray-600 hover:text-black mb-6"
            >
                <ArrowLeft size={20} className="mr-1" /> Back to Jobs
            </button>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Edit Job Post</h2>
                
                <form onSubmit={handleUpdateJob} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                value={formData.companyName}
                                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea 
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            rows="5"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required 
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Package (LPA)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                value={formData.package}
                                onChange={(e) => setFormData({...formData, package: e.target.value})}
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min CGPA</label>
                            <input 
                                type="number" 
                                step="0.1"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                value={formData.cgpa}
                                onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="e.g. React" 
                                value={skillInput} 
                                onChange={(e) => setSkillInput(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                            />
                            <button 
                                type="button" 
                                onClick={handleAddSkill}
                                className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {formData.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.skills.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {skill}
                                        <button 
                                            type="button" 
                                            onClick={() => removeSkill(skill)}
                                            className="ml-1.5 text-green-600 hover:text-green-800 focus:outline-none"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                            <input 
                                type="date" 
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                value={formData.deadline}
                                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select 
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Interview Rounds Section */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900">Interview Rounds</h4>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 gap-4 mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Round Name (e.g. Technical 1)" 
                                    className="p-2 border rounded text-sm focus:outline-none focus:border-black w-full"
                                    value={roundInput.roundName}
                                    onChange={(e) => setRoundInput({...roundInput, roundName: e.target.value})}
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input 
                                        type="date" 
                                        className="p-2 border rounded text-sm focus:outline-none focus:border-black"
                                        value={roundInput.date}
                                        onChange={(e) => setRoundInput({...roundInput, date: e.target.value})}
                                    />
                                    <input 
                                        type="time" 
                                        className="p-2 border rounded text-sm focus:outline-none focus:border-black"
                                        value={roundInput.time}
                                        onChange={(e) => setRoundInput({...roundInput, time: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Link" 
                                        className="p-2 border rounded text-sm focus:outline-none focus:border-black"
                                        value={roundInput.link}
                                        onChange={(e) => setRoundInput({...roundInput, link: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddRound}
                                className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Round
                            </button>
                        </div>

                        {formData.interviewRounds.length > 0 && (
                            <div className="space-y-3">
                                {formData.interviewRounds.map((round, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded shadow-sm">
                                        <div>
                                            <div className="font-semibold text-gray-900">{round.roundName}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {round.date ? new Date(round.date).toLocaleDateString() : 'Date TBD'} 
                                                {round.time && ` • ${round.time}`}
                                            </div>
                                            {round.link && (
                                                <a href={round.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline mt-1 block">
                                                    {round.link}
                                                </a>
                                            )}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveRound(index)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJob;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Compass, Award, Briefcase, CheckCircle, Code, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CareerPath = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPath, setExpandedPath] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await api.get('/users/recommendations');
      setRecommendations(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load career recommendations');
    } finally {
      setLoading(false);
    }
  };

  const togglePath = (index) => {
      setExpandedPath(expandedPath === index ? null : index);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <Link to="/dashboard" className="text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Compass size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Career Path Recommendations</h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
            Based on your skills, resume, and interests, we've analyzed the best career paths for you. 
            Here are your top matches with actionable next steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {recommendations.map((path, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                {/* Match Score Badge */}
                {path.matchCount > 0 && (
                    <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                        <CheckCircle size={12} /> {path.matchCount} Skill Matches
                    </div>
                )}
                
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{path.title}</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">{path.description}</p>
                    
                    {/* Skills Match Section */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Code size={16} className="text-gray-400" /> Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {path.matchedSkills && path.matchedSkills.length > 0 ? (
                                path.matchedSkills.map((skill, idx) => (
                                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium border border-indigo-100">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm italic">Add skills to your profile to see matches</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                        {/* Certifications */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Award size={16} className="text-orange-500" /> Recommended Certs
                            </h4>
                            <ul className="space-y-2">
                                {path.certifications.map((cert, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                                        {cert}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Projects */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Briefcase size={16} className="text-blue-500" /> Project Ideas
                            </h4>
                            <ul className="space-y-2">
                                {path.projects.map((project, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                                        {project}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Learning Path Button */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button 
                            onClick={() => navigate(`/career-path/roadmap/${path.id}`)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-100 hover:border-indigo-100 group transition-all"
                        >
                            <span className="font-bold text-sm uppercase tracking-wide flex items-center gap-2 text-gray-700 group-hover:text-indigo-700">
                                <BookOpen size={18} /> View Detailed Roadmap
                            </span>
                            <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:translate-x-1 transition-transform">
                                <ArrowLeft size={16} className="rotate-180 text-gray-400 group-hover:text-indigo-600" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default CareerPath;
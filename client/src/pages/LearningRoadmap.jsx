import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, BookOpen, CheckCircle, Code, Layers, Database, Shield, Server, Layout, PenTool, Cpu, Briefcase } from 'lucide-react';

const LearningRoadmap = () => {
  const { roleId } = useParams();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data } = await api.get(`/users/roadmap/${roleId}`);
        setRoadmapData(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load learning roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!roadmapData) {
      return (
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Roadmap Not Found</h2>
              <Link to="/career-path" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Recommendations</Link>
          </div>
      )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <Link to="/career-path" className="text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Back to Recommendations
        </Link>
        <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{roadmapData.title} Roadmap</h1>
                <p className="text-gray-500">Step-by-step learning path from Beginner to Advanced</p>
            </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>

          <div className="space-y-12">
            {roadmapData.roadmap.map((phase, index) => (
                <div key={index} className="relative md:pl-24">
                    {/* Phase Marker (Desktop) */}
                    <div className={`absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 hidden md:flex
                        ${phase.level === 'Beginner' ? 'bg-green-500' : phase.level === 'Intermediate' ? 'bg-blue-500' : 'bg-purple-500'}
                    `}>
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>

                    {/* Content Card */}
                    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                        ${phase.level === 'Beginner' ? 'border-green-100' : phase.level === 'Intermediate' ? 'border-blue-100' : 'border-purple-100'}
                    `}>
                        {/* Phase Header */}
                        <div className={`px-6 py-4 border-b flex items-center gap-3
                            ${phase.level === 'Beginner' ? 'bg-green-50 border-green-100 text-green-800' : 
                              phase.level === 'Intermediate' ? 'bg-blue-50 border-blue-100 text-blue-800' : 
                              'bg-purple-50 border-purple-100 text-purple-800'}
                        `}>
                            <Layers size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-wide">{phase.level} Level</h3>
                        </div>

                        {/* Modules Grid */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {phase.modules.map((module, mIdx) => (
                                <div key={mIdx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-start gap-2 min-h-[40px]">
                                        <Code size={18} className="mt-1 text-gray-400 flex-shrink-0" />
                                        {module.skill}
                                    </h4>
                                    <ul className="space-y-2">
                                        {module.topics.map((topic, tIdx) => (
                                            <li key={tIdx} className="text-sm text-gray-600 flex items-start gap-2">
                                                <CheckCircle size={14} className="mt-1 text-indigo-400 flex-shrink-0" />
                                                <span className="leading-snug">{topic}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
          </div>
      </div>
      
      {/* Footer Call to Action */}
      <div className="mt-16 bg-black text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to start learning?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Mastering these skills will significantly increase your chances of getting placed as a {roadmapData.title}.
              Start with the Beginner modules and work your way up!
          </p>
          <Link to="/jobs" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              <Briefcase size={18} /> View Relevant Jobs
          </Link>
      </div>
    </div>
  );
};

export default LearningRoadmap;
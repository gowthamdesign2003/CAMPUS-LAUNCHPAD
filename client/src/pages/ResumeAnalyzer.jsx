import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const ResumeAnalyzer = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [file, setFile] = useState(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysisResult(null);
        try {
            const formData = new FormData();
            if (file) {
                formData.append('resume', file);
            }
            
            // If no file, the backend will automatically check for profile resume
            const { data } = await api.post('/resume/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAnalysisResult(data);
            toast.success('Analysis complete!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Analysis failed');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">AI Resume Analyzer</h2>
                <p className="text-gray-500">Get instant feedback on your resume's ATS compatibility and content quality.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Upload Resume</h3>
                        
                        <div className="mb-4">
                            <label className="block w-full cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors">
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    className="hidden" 
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 font-medium">
                                    {file ? file.name : 'Click to upload PDF'}
                                </span>
                            </label>
                        </div>

                        {user?.profile?.resumeLink && !file && (
                            <div className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded border border-blue-100 flex items-start gap-2">
                                <FileText size={16} className="text-blue-600 mt-0.5" />
                                <div>
                                    <span className="font-medium text-blue-800">Profile Resume Available</span>
                                    <p className="text-xs mt-1">We'll analyze your existing profile resume if no new file is uploaded.</p>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="md:col-span-2">
                    {analysisResult ? (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
                                <h3 className="text-lg font-medium text-gray-500 mb-2">ATS Compatibility Score</h3>
                                <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysisResult.score)}`}>
                                    {analysisResult.score}/100
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 max-w-xs mx-auto">
                                    <div 
                                        className={`h-2.5 rounded-full ${getScoreBg(analysisResult.score).replace('bg-', 'bg-').replace('100', '500')}`} 
                                        style={{ width: `${analysisResult.score}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500">Word Count: {analysisResult.wordCount} words</p>
                            </div>

                            {/* Suggestions */}
                            {analysisResult.suggestions.length > 0 && (
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-700">
                                        <Lightbulb className="fill-yellow-100" /> Suggestions for Improvement
                                    </h3>
                                    <ul className="space-y-3">
                                        {analysisResult.suggestions.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 bg-yellow-50 p-3 rounded text-sm text-gray-700 border border-yellow-100">
                                                <span className="mt-0.5 text-yellow-500">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Mistakes */}
                            {analysisResult.mistakes.length > 0 && (
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="fill-red-100" /> Critical Issues
                                    </h3>
                                    <ul className="space-y-3">
                                        {analysisResult.mistakes.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 bg-red-50 p-3 rounded text-sm text-gray-700 border border-red-100">
                                                <span className="mt-0.5 text-red-500">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {analysisResult.mistakes.length === 0 && analysisResult.suggestions.length === 0 && (
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                                    <h3 className="font-bold text-green-800 text-lg">Excellent Resume!</h3>
                                    <p className="text-green-700">We couldn't find any major issues. Good luck!</p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-lg border border-gray-200 border-dashed text-center h-full flex flex-col justify-center items-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">No Analysis Results Yet</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                Upload a resume or use your profile resume to start the AI analysis. We'll check for formatting, keywords, and completeness.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;

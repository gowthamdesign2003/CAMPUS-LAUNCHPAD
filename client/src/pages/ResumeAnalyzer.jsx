import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertTriangle, Lightbulb, Target, BookOpen, BadgeCheck, TrendingUp } from 'lucide-react';

const ResumeAnalyzer = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('Preparing analysis…');
    const [showResults, setShowResults] = useState(false);
    const [revealStep, setRevealStep] = useState(0);
    const [startedAt, setStartedAt] = useState(null);
    const [history, setHistory] = useState(() => {
        try {
            const raw = localStorage.getItem('resumeAnalysisHistory');
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    });

    useEffect(() => {
        let timer;
        if (isLoading) {
            setProgress(0);
            let elapsed = 0;
            const TOTAL_MS = 8000;
            const stages = [
                'Extracting text…',
                'Detecting sections…',
                'Evaluating keywords…',
                'Checking ATS compatibility…',
                'Generating suggestions…',
                'Finalizing report…'
            ];
            const tips = [
                'Tip: Use strong action verbs (Implemented, Optimized, Reduced).',
                'Tip: Quantify impact with numbers and percentages.',
                'Tip: Keep to 1–2 pages with clear section headings.',
                'Tip: Add LinkedIn/GitHub if relevant for your field.',
                'Tip: Prioritize tools that match the target role.'
            ];
            timer = setInterval(() => {
                setProgress((p) => {
                    elapsed += 250;
                    const inc = 100 / (TOTAL_MS / 250);
                    const next = Math.min(p + inc, 95);
                    const stageIndex = Math.min(Math.floor(elapsed / (TOTAL_MS / stages.length)), stages.length - 1);
                    const tipIndex = Math.floor(elapsed / 1500) % tips.length;
                    setStage(`${stages[stageIndex]} — ${tips[tipIndex]}`);
                    return next;
                });
            }, 250);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isLoading]);

    // Removed auto‑analyze on load: analysis requires explicit file upload and user action

    const validateFile = useCallback((f) => {
        if (!f) return 'Please choose a file';
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const extAllowed = ['.pdf', '.doc', '.docx'];
        const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
        if (!allowed.includes(f.type) && !extAllowed.includes(ext)) {
            return 'Invalid file. Please upload PDF, DOC, or DOCX.';
        }
        if (f.size > 5 * 1024 * 1024) {
            return 'File too large. Max size is 5MB.';
        }
        return null;
    }, []);

    const handleAnalyze = async () => {
        const t0 = Date.now();
        setStartedAt(t0);
        setIsLoading(true);
        setShowResults(false);
        setRevealStep(0);
        setAnalysisResult(null);
        try {
            const formData = new FormData();
            if (!file) {
                toast.error('Please upload a resume (PDF, DOC, or DOCX) to analyze.');
                setIsLoading(false);
                return;
            }
            const err = validateFile(file);
            if (err) {
                toast.error(err);
                setIsLoading(false);
                return;
            }
            formData.append('resume', file);

            const { data } = await api.post('/resume/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAnalysisResult(data);
            const elapsed = Date.now() - t0;
            const remaining = Math.max(0, 8000 - elapsed);
            await new Promise(r => setTimeout(r, remaining));
            setProgress(100);
            setShowResults(true);
            setTimeout(() => setRevealStep(1), 50);
            setTimeout(() => setRevealStep(2), 200);
            setTimeout(() => setRevealStep(3), 400);
            setTimeout(() => setRevealStep(4), 600);
            toast.success('Analysis complete!');
            const entry = {
                ts: Date.now(),
                score: data.score,
                subscores: data.subscores || {},
                benchmark: data.benchmark || null,
                cacheKey: data.cacheKey || null
            };
            const next = [entry, ...history].slice(0, 5);
            setHistory(next);
            localStorage.setItem('resumeAnalysisHistory', JSON.stringify(next));
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
    const hasContent = !!(analysisResult && (analysisResult.wordCount || 0) >= 50);
    const floor50 = (v) => (hasContent ? Math.max(50, v || 0) : (v || 0));
    const ringScore = analysisResult ? floor50(analysisResult.score) : 0;
    const kmDisplay = analysisResult ? floor50(analysisResult.keywordMatchPercent) : 0;
    const readDisplay = analysisResult ? floor50(analysisResult.readabilityIndex) : 0;
    const secDisplay = analysisResult ? floor50(analysisResult.sectionCompletionRate) : 0;
    const contentPct = analysisResult ? Math.max(0, Math.min(100, (analysisResult.subscores?.achievements || 0) + (analysisResult.subscores?.formatting || 0))) : 0;
    const atsPct = analysisResult ? (Math.round(((analysisResult.subscores?.ats || 0) + (analysisResult.keywordMatchPercent || 0)) / 2) || 0) : 0;
    const tailoringPct = analysisResult ? (Math.min(100, Math.round((analysisResult.keywordMatchPercent || 0) * 0.9)) || 0) : 0;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">AI Resume Analyzer</span>
                </h2>
                <p className="text-gray-600 mt-2">Actionable suggestions, critical issues, and ATS-friendly insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Upload</h3>
                        
                        <div 
                            className={`mb-4 border-dashed rounded-xl p-0 ${isDragging ? 'border-2 border-black bg-gray-50' : ''}`}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const f = e.dataTransfer.files?.[0];
                                const err = validateFile(f);
                                if (err) { toast.error(err); return; }
                                setFile(f);
                            }}
                        >
                            <label className="block w-full cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors">
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        const err = validateFile(f);
                                        if (err) { toast.error(err); return; }
                                        setFile(f);
                                    }}
                                />
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 font-medium">
                                    {file ? file.name : 'Click or drag-and-drop PDF, DOC, DOCX (max 5MB, ≤5 pages)'}
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
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            aria-busy={isLoading}
                            aria-live="polite"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                        </button>
                        {isLoading && (
                            <div className="mt-3">
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                                    <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="text-xs text-gray-600 mt-1">{stage} {Math.round(progress)}%</div>
                            </div>
                        )}
                    </div>

                    {/* Targeting panel removed per requirement */}
                </div>

                <div className="md:col-span-2">
                    {isLoading && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="space-y-4">
                                    <div className="h-6 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
                                    <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
                                    <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
                                    <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-40 animate-pulse" />
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-40 animate-pulse" />
                            </div>
                        </div>
                    )}
                    {!isLoading && showResults && analysisResult ? (
                        <div className="space-y-6">
                            <div className={`bg-white p-8 rounded-2xl border border-gray-200 shadow-sm transition-opacity duration-300 ${revealStep >= 1 ? 'opacity-100' : 'opacity-0'}`} id="printable-report">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">ATS Compatibility</h3>
                                    <div className="text-sm text-gray-500">Word Count: {analysisResult.wordCount}</div>
                                </div>
                                <div className="mt-6 flex items-center gap-6">
                                    <div
                                        className="relative w-28 h-28 rounded-full"
                                        style={{
                                            background: `conic-gradient(${ringScore >= 80 ? '#16a34a' : ringScore >= 60 ? '#f59e0b' : '#ef4444'} ${ringScore}%, #e5e7eb 0)`
                                        }}
                                        aria-label="Overall score ring"
                                    >
                                        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                                            <div className={`text-2xl font-extrabold ${getScoreColor(ringScore)}`}>{ringScore}</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div 
                                                className={`h-2.5 rounded-full ${getScoreBg(ringScore).replace('100', '500')}`} 
                                                style={{ width: `${ringScore}%` }}
                                            />
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {ringScore >= 80 ? 'Strong, ATS-friendly resume' : ringScore >= 60 ? 'Good foundation; address key improvements' : 'Needs significant optimization for ATS'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Dashboard */}
                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${revealStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Relevance</span>
                                        <Target size={16} className="text-indigo-600" />
                                    </div>
                                    <div className="text-2xl font-extrabold text-gray-900">{kmDisplay}%</div>
                                    <div className="mt-2 h-2 bg-gray-100 rounded-full">
                                        <div className="h-2 bg-indigo-600 rounded-full" style={{ width: `${kmDisplay}%` }} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Readability</span>
                                        <BookOpen size={16} className="text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-extrabold text-gray-900">{readDisplay}</div>
                                    <div className="mt-2 h-2 bg-gray-100 rounded-full">
                                        <div className="h-2 bg-purple-600 rounded-full" style={{ width: `${readDisplay}%` }} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Sections Complete</span>
                                        <BadgeCheck size={16} className="text-emerald-600" />
                                    </div>
                                    <div className="text-2xl font-extrabold text-gray-900">{secDisplay}%</div>
                                    <div className="mt-2 h-2 bg-gray-100 rounded-full">
                                        <div className="h-2 bg-emerald-600 rounded-full" style={{ width: `${secDisplay}%` }} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Benchmark</span>
                                        <TrendingUp size={16} className="text-amber-600" />
                                    </div>
                                    <div className="text-2xl font-extrabold text-gray-900">{analysisResult.benchmark}</div>
                                    <div className="mt-2 text-xs text-gray-500">Relative to industry standards</div>
                                </div>
                            </div>

                            {/* Target Keyword Coverage removed */}

                            {/* Removed additional score containers per request */}

                            {analysisResult.subscores && (
                                <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-opacity duration-300 ${revealStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-gray-900">Section-wise Breakdown</h4>
                                        {analysisResult.benchmark && (
                                            <span className="text-xs px-2 py-1 rounded-full border font-bold uppercase tracking-wide">
                                                Benchmark: {analysisResult.benchmark}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(analysisResult.subscores).map(([k, v]) => (
                                            <div key={k}>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>{k}</span><span>{v}/100</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                    <div className="h-2.5 bg-black rounded-full" style={{ width: `${Math.min(100, v)}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysisResult.suggestions.length > 0 && (
                                <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-opacity duration-300 ${revealStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-3">
                                        <Lightbulb className="fill-yellow-100" /> Suggestions for Improvement
                                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{analysisResult.suggestions.length}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {analysisResult.suggestions.map((item, idx) => (
                                            <button 
                                                key={idx}
                                                className="text-left flex items-start gap-3 bg-yellow-50 p-3 rounded-lg text-sm text-gray-800 border border-yellow-100 hover:bg-yellow-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                                onClick={() => { navigator.clipboard.writeText(item); toast.info('Suggestion copied'); }}
                                                aria-label={`Suggestion ${idx+1}`}
                                            >
                                                <span className="mt-0.5 text-yellow-600">•</span>
                                                <span>{item}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysisResult.mistakes.length > 0 && (
                                <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-opacity duration-300 ${revealStep >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
                                        <AlertTriangle className="fill-red-100" /> Critical Issues
                                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{analysisResult.mistakes.length}</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {analysisResult.mistakes.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-sm text-gray-800 border border-red-100">
                                                <span className="mt-0.5 text-red-600">•</span>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Industry Recommendations */}
                            {analysisResult.industryRecommendations && analysisResult.industryRecommendations.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                                        <Lightbulb className="fill-indigo-100" /> Industry Recommendations
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.industryRecommendations.map((rec, idx) => (
                                            <span key={idx} className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {rec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysisResult.mistakes.length === 0 && analysisResult.suggestions.length === 0 && (
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                                    <h3 className="font-bold text-green-800 text-lg">Excellent Resume</h3>
                                    <p className="text-green-700">No major issues detected. Great job.</p>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => window.print()} className="btn-secondary">Export PDF</button>
                                {history.length >= 2 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">Comparison</div>
                                        <div className="text-xs text-gray-600">
                                            Latest: {history[0].score} vs Previous: {history[1].score} 
                                            <span className={`ml-2 font-bold ${history[0].score - history[1].score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {history[0].score - history[1].score >= 0 ? '+' : ''}{history[0].score - history[1].score}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl border border-gray-200 border-dashed text-center h-full flex flex-col justify-center items-center">
                            <div className="bg-gray-50 p-4 rounded-xl mb-4">
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

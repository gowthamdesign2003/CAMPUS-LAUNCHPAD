import { Link } from 'react-router-dom';
import { User, Shield, ArrowRight, Rocket, CheckCircle, BarChart, FileText } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 -mt-24 pt-24">
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 md:py-32 text-center max-w-5xl">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Campus Placement Season 2026 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
          Launch Your Career with <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">Campus Launchpad</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
          The all-in-one platform connecting students with top recruiters. Streamline your placement journey from resume to offer letter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            <a href="#get-started" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 rounded-xl">
                Get Started
                <ArrowRight size={20} className="ml-2" />
            </a>
            <a href="#features" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 rounded-xl">
                Learn More
            </a>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="bg-gray-50 py-24 border-y border-gray-100">
          <div className="container mx-auto px-6 max-w-6xl">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
                  <p className="text-gray-500 max-w-2xl mx-auto">We provide the tools to help you stand out and get hired faster.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                          <FileText size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">AI Resume Analyzer</h3>
                      <p className="text-gray-500 leading-relaxed">
                          Get instant feedback on your resume with our AI-powered ATS checker. Improve your score to get shortlisted.
                      </p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-6">
                          <Rocket size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">One-Click Apply</h3>
                      <p className="text-gray-500 leading-relaxed">
                          Apply to multiple companies instantly with your verified profile. No more repetitive form filling.
                      </p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                          <BarChart size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">Real-time Tracking</h3>
                      <p className="text-gray-500 leading-relaxed">
                          Track your application status in real-time. From 'Applied' to 'Selected', never miss an update.
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* Role Selection */}
      <div id="get-started" className="py-24 container mx-auto px-6 max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to jump in?</h2>
        <p className="text-xl text-gray-500 mb-16">Select your role to continue to the portal.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Student Option */}
            <Link to="/login?role=student" className="group block h-full">
                <div className="bg-white border-2 border-gray-100 p-10 rounded-2xl hover:border-black transition-all duration-300 h-full flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                        <User size={32} strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">Student</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        I am a student looking for job opportunities and placement drives.
                    </p>
                    <span className="inline-flex items-center text-sm font-bold text-black border-b-2 border-transparent group-hover:border-black pb-0.5 transition-all">
                        Login as Student <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </Link>

            {/* Admin Option */}
            <Link to="/login?role=admin" className="group block h-full">
                <div className="bg-white border-2 border-gray-100 p-10 rounded-2xl hover:border-black transition-all duration-300 h-full flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                        <Shield size={32} strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">Placement Officer</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        I am an administrator managing the recruitment process and students.
                    </p>
                    <span className="inline-flex items-center text-sm font-bold text-black border-b-2 border-transparent group-hover:border-black pb-0.5 transition-all">
                        Login as Admin <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </Link>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
              <div className="flex items-center justify-center gap-2 mb-4 text-black font-bold text-lg">
                  <Rocket size={20} /> CAMPUS LAUNCHPAD
              </div>
              <p>&copy; {new Date().getFullYear()} Campus Launchpad. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;

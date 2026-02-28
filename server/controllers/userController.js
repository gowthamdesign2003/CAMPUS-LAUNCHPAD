import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';

// Define Career Paths Knowledge Base with Detailed Roadmap
const careerPathsData = [
    {
        id: "backend-developer",
        title: "Backend Developer",
        keywords: ["Node", "Express", "MongoDB", "SQL", "Java", "Python", "API", "Server"],
        description: "Build robust server-side applications and manage databases.",
        certifications: ["AWS Certified Developer", "Oracle Certified Professional: Java SE Programmer", "MongoDB Certified Developer"],
        projects: ["E-commerce API", "Real-time Chat Application", "Task Management System"],
        roadmap: [
            {
                level: "Beginner",
                modules: [
                    {
                        skill: "Programming Language (Pick One)",
                        topics: ["Variables & Data Types", "Control Structures (Loops, If-Else)", "Functions & Methods", "Object-Oriented Programming (OOP)", "Exception Handling"]
                    },
                    {
                        skill: "Version Control (Git)",
                        topics: ["Basic Commands (add, commit, push)", "Branching & Merging", "Pull Requests", "Resolving Conflicts"]
                    },
                    {
                        skill: "Database Basics",
                        topics: ["Relational vs Non-Relational DBs", "Basic SQL Queries (SELECT, INSERT, UPDATE, DELETE)", "Normalization", "ACID Properties"]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        skill: "API Development",
                        topics: ["RESTful API Principles", "HTTP Methods & Status Codes", "JSON Data Format", "Postman for Testing", "Middleware"]
                    },
                    {
                        skill: "Web Frameworks (Express/Spring/Django)",
                        topics: ["Routing", "Controllers & Services", "Authentication (JWT, OAuth)", "Input Validation", "Error Handling"]
                    },
                    {
                        skill: "Database Interaction",
                        topics: ["ORMs (Mongoose, Sequelize, Hibernate)", "Migrations", "Transactions", "Indexing for Performance"]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        skill: "System Design",
                        topics: ["Microservices Architecture", "Load Balancing", "Caching Strategies (Redis)", "Message Queues (RabbitMQ/Kafka)"]
                    },
                    {
                        skill: "Deployment & DevOps",
                        topics: ["Docker & Containerization", "CI/CD Pipelines", "Cloud Services (AWS/Azure/GCP)", "Serverless Functions"]
                    },
                    {
                        skill: "Security",
                        topics: ["OWASP Top 10", "Data Encryption", "Rate Limiting", "SQL Injection Prevention"]
                    }
                ]
            }
        ]
    },
    {
        id: "frontend-developer",
        title: "Frontend Developer",
        keywords: ["React", "Vue", "Angular", "HTML", "CSS", "JavaScript", "Redux", "UI", "UX"],
        description: "Create interactive and responsive user interfaces for web applications.",
        certifications: ["Meta Frontend Developer Professional Certificate", "Certified React Developer"],
        projects: ["Personal Portfolio Website", "Dashboard with Data Visualization", "Weather App"],
        roadmap: [
            {
                level: "Beginner",
                modules: [
                    {
                        skill: "HTML5",
                        topics: ["Semantic HTML", "Forms & Validation", "Accessibility (ARIA)", "SEO Basics"]
                    },
                    {
                        skill: "CSS3",
                        topics: ["Box Model", "Flexbox", "CSS Grid", "Responsive Design (Media Queries)", "Transitions & Animations"]
                    },
                    {
                        skill: "JavaScript Fundamentals",
                        topics: ["Variables (let, const)", "Data Types", "DOM Manipulation", "Events", "ES6+ Features (Arrow Functions, Destructuring, Template Literals)"]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        skill: "Frontend Framework (React)",
                        topics: ["Components & Props", "State & Lifecycle (Hooks)", "Context API", "React Router", "Virtual DOM"]
                    },
                    {
                        skill: "CSS Frameworks",
                        topics: ["Tailwind CSS", "Bootstrap", "Material UI", "Styled Components"]
                    },
                    {
                        skill: "Build Tools & Version Control",
                        topics: ["Git & GitHub", "NPM/Yarn", "Webpack/Vite", "Linters & Formatters (ESLint, Prettier)"]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        skill: "State Management",
                        topics: ["Redux / Redux Toolkit", "Zustand", "Recoil", "Server State (React Query)"]
                    },
                    {
                        skill: "Advanced React Patterns",
                        topics: ["Higher Order Components", "Render Props", "Custom Hooks", "Performance Optimization (useMemo, useCallback)"]
                    },
                    {
                        skill: "Testing & Typescript",
                        topics: ["Jest & React Testing Library", "TypeScript Basics", "End-to-End Testing (Cypress/Playwright)"]
                    }
                ]
            }
        ]
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        keywords: ["Python", "SQL", "Tableau", "PowerBI", "Excel", "Data Analysis", "Pandas", "NumPy"],
        description: "Analyze data to help companies make better business decisions.",
        certifications: ["Google Data Analytics Professional Certificate", "Microsoft Certified: Power BI Data Analyst Associate"],
        projects: ["Sales Data Analysis Dashboard", "Customer Segmentation Analysis", "Stock Market Prediction"],
        roadmap: [
            {
                level: "Beginner",
                modules: [
                    {
                        skill: "Excel & Spreadsheets",
                        topics: ["Data Entry & Formatting", "Formulas & Functions", "Pivot Tables", "VLOOKUP/XLOOKUP", "Charts & Graphs"]
                    },
                    {
                        skill: "SQL Basics",
                        topics: ["SELECT, FROM, WHERE", "Filtering & Sorting", "Aggregations (COUNT, SUM, AVG)", "Basic Joins"]
                    },
                    {
                        skill: "Statistics 101",
                        topics: ["Mean, Median, Mode", "Standard Deviation", "Probability Basics", "Hypothesis Testing"]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        skill: "Python for Data Analysis",
                        topics: ["Python Syntax", "Pandas (DataFrames)", "NumPy (Arrays)", "Data Cleaning & Preprocessing"]
                    },
                    {
                        skill: "Data Visualization",
                        topics: ["Matplotlib & Seaborn", "Tableau / PowerBI", "Dashboard Design Principles", "Storytelling with Data"]
                    },
                    {
                        skill: "Advanced SQL",
                        topics: ["Subqueries", "Window Functions", "CTEs", "Stored Procedures"]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        skill: "Predictive Analytics",
                        topics: ["Regression Analysis", "Time Series Analysis", "Classification Basics", "Clustering"]
                    },
                    {
                        skill: "Big Data Tools",
                        topics: ["Hadoop Ecosystem", "Spark Basics", "Cloud Data Warehouses (Snowflake/BigQuery)"]
                    },
                    {
                        skill: "Business Intelligence",
                        topics: ["KPI Definition", "Data Modeling", "ETL Processes", "Stakeholder Communication"]
                    }
                ]
            }
        ]
    },
    {
        id: "machine-learning-engineer",
        title: "Machine Learning Engineer",
        keywords: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Deep Learning", "AI", "NLP"],
        description: "Design and build AI models to solve complex problems.",
        certifications: ["TensorFlow Developer Certificate", "AWS Certified Machine Learning - Specialty"],
        projects: ["Image Classification Model", "Sentiment Analysis Tool", "Recommendation System"],
        roadmap: [
             {
                level: "Beginner",
                modules: [
                    {
                        skill: "Python Programming",
                        topics: ["Data Structures", "Functions", "OOP in Python", "Libraries (NumPy, Pandas)"]
                    },
                    {
                        skill: "Math for ML",
                        topics: ["Linear Algebra (Vectors, Matrices)", "Calculus (Derivatives, Gradients)", "Probability & Statistics"]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        skill: "ML Algorithms",
                        topics: ["Linear/Logistic Regression", "Decision Trees & Random Forests", "SVMs", "K-Means Clustering"]
                    },
                    {
                        skill: "ML Libraries",
                        topics: ["Scikit-Learn", "Model Evaluation (Accuracy, Precision, Recall)", "Cross-Validation", "Hyperparameter Tuning"]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        skill: "Deep Learning",
                        topics: ["Neural Networks", "TensorFlow / PyTorch", "CNNs (Computer Vision)", "RNNs/LSTMs (NLP)"]
                    },
                    {
                        skill: "MLOps",
                        topics: ["Model Deployment", "Docker for ML", "Model Monitoring", "Cloud AI Services"]
                    }
                ]
            }
        ]
    },
    {
        id: "devops-engineer",
        title: "DevOps Engineer",
        keywords: ["AWS", "Docker", "Kubernetes", "CI/CD", "Jenkins", "Linux", "Bash", "Cloud"],
        description: "Bridge the gap between development and operations to automate deployment.",
        certifications: ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)"],
        projects: ["CI/CD Pipeline Setup", "Containerized Microservices Deployment", "Infrastructure as Code (Terraform)"],
        roadmap: [
            {
                level: "Beginner",
                modules: [
                    {
                        skill: "Operating Systems",
                        topics: ["Linux Basics", "File System Hierarchy", "Permissions", "Bash Scripting"]
                    },
                    {
                        skill: "Networking",
                        topics: ["OSI Model", "DNS, HTTP/HTTPS", "SSH", "Firewalls"]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        skill: "Containerization",
                        topics: ["Docker Basics", "Docker Compose", "Image Optimization", "Container Networking"]
                    },
                    {
                        skill: "CI/CD",
                        topics: ["Jenkins / GitHub Actions", "Pipeline as Code", "Automated Testing Integration", "Artifact Management"]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        skill: "Orchestration",
                        topics: ["Kubernetes Architecture", "Pods, Services, Deployments", "Helm Charts", "Ingress Controllers"]
                    },
                    {
                        skill: "Infrastructure as Code",
                        topics: ["Terraform", "Ansible", "CloudFormation", "State Management"]
                    },
                    {
                        skill: "Monitoring & Cloud",
                        topics: ["Prometheus & Grafana", "ELK Stack", "AWS/Azure Services", "Cost Optimization"]
                    }
                ]
            }
        ]
    },
    {
        id: "ui-ux-designer",
        title: "UI/UX Designer",
        keywords: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Wireframing", "Design"],
        description: "Design intuitive and aesthetically pleasing user experiences.",
        certifications: ["Google UX Design Professional Certificate", "Nielsen Norman Group UX Certification"],
        projects: ["Mobile App Redesign", "E-commerce Website Prototype", "Design System Creation"],
        roadmap: [
            {
                level: "Beginner",
                modules: [
                    {
                        skill: "Design Fundamentals",
                        topics: ["Color Theory", "Typography", "Layout & Grids", "Visual Hierarchy"]
                    },
                    {
                        skill: "Tools",
                        topics: ["Figma Basics", "Adobe XD", "Sketch", "Pen Tool Mastery"]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        skill: "UX Research",
                        topics: ["User Personas", "Journey Mapping", "Competitor Analysis", "User Interviews"]
                    },
                    {
                        skill: "Interaction Design",
                        topics: ["Wireframing", "Prototyping", "Micro-interactions", "Usability Testing"]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        skill: "Design Systems",
                        topics: ["Component Libraries", "Style Guides", "Atomic Design", "Documentation"]
                    },
                    {
                        skill: "Strategy & Handoff",
                        topics: ["UX Strategy", "Accessibility (WCAG)", "Developer Handoff", "Design Ops"]
                    }
                ]
            }
        ]
    }
];

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user; // Already fetched by protect middleware

  if (user) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'student') {
        response.profile = {
            department: user.department,
            year: user.year,
            mobile: user.mobile,
            cgpa: user.cgpa,
            tenthPercentage: user.tenthPercentage,
            twelfthPercentage: user.twelfthPercentage,
            diplomaPercentage: user.diplomaPercentage,
            resumeLink: user.resumeLink,
            skills: user.skills,
            isVerified: user.isVerified
        };
    }

    res.json(response);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
      const user = req.user; // Already fetched by protect middleware

      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
          user.password = req.body.password;
        }
        
        // Update Profile Fields (Only for Students)
        if (user.role === 'student') {
            const profileData = req.body.profile || req.body;
            
            if (profileData.department !== undefined) user.department = profileData.department;
            if (profileData.year !== undefined) user.year = profileData.year;
            if (profileData.mobile !== undefined) user.mobile = profileData.mobile;
            if (profileData.cgpa !== undefined) user.cgpa = profileData.cgpa;
            if (profileData.tenthPercentage !== undefined) user.tenthPercentage = profileData.tenthPercentage;
            if (profileData.twelfthPercentage !== undefined) user.twelfthPercentage = profileData.twelfthPercentage;
            if (profileData.diplomaPercentage !== undefined) user.diplomaPercentage = profileData.diplomaPercentage;
            if (profileData.resumeLink !== undefined) user.resumeLink = profileData.resumeLink;
            
            // Handle skills (could be array or JSON string)
            if (profileData.skills !== undefined) {
                if (typeof profileData.skills === 'string') {
                    try {
                        user.skills = JSON.parse(profileData.skills);
                    } catch (e) {
                        user.skills = profileData.skills.split(',').map(s => s.trim());
                    }
                } else {
                    user.skills = profileData.skills;
                }
            }

            // Handle File Upload
            if (req.file) {
                user.resumeLink = `/uploads/${req.file.filename}`;
            }
        }

        const updatedUser = await user.save();

        const response = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        };

        if (updatedUser.role === 'student') {
            response.profile = {
                department: updatedUser.department,
                year: updatedUser.year,
                mobile: updatedUser.mobile,
                cgpa: updatedUser.cgpa,
                tenthPercentage: updatedUser.tenthPercentage,
                twelfthPercentage: updatedUser.twelfthPercentage,
                diplomaPercentage: updatedUser.diplomaPercentage,
                resumeLink: updatedUser.resumeLink,
                skills: updatedUser.skills,
                isVerified: updatedUser.isVerified
            };
        }

        res.json(response);
      } else {
        res.status(404);
        throw new Error('User not found');
      }
  } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ message: "Server Error during profile update", error: error.message });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const students = await Student.find({});
  const admins = await Admin.find({});
  // Combine and format if needed, or just return students for now as "users" usually implies students in this context
  // Or return both lists
  res.json([...students, ...admins]); 
});

// @desc    Get student placement status
// @route   GET /api/users/status
// @access  Private/Admin
const getStudentPlacementStatus = asyncHandler(async (req, res) => {
    const { department } = req.query;
    
    let matchStage = { role: 'student' };
    
    // Case insensitive department match if provided
    if (department && department !== 'All') {
        // Use a more flexible regex that allows surrounding whitespace
        // and doesn't enforce strict start/end if there might be extra chars
        // Escaping special regex characters in department string is good practice
        const escapedDept = department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        matchStage.department = { $regex: new RegExp(escapedDept.trim(), 'i') };
    }

    console.log('Fetching student status with match:', matchStage);

    const students = await Student.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'applications',
                localField: '_id',
                foreignField: 'student',
                as: 'applications'
            }
        },
        {
            $addFields: {
                offerCount: {
                    $size: {
                        $filter: {
                            input: '$applications',
                            as: 'app',
                            cond: { $eq: ['$$app.status', 'Selected'] }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                isPlaced: { $gt: ['$offerCount', 0] }
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                department: 1,
                year: 1,
                mobile: 1,
                cgpa: 1,
                isPlaced: 1,
                offerCount: 1,
                applicationsCount: { $size: '$applications' }
            }
        }
    ]);

    res.json(students);
});

// @desc    Get career path recommendations
// @route   GET /api/users/recommendations
// @access  Private/Student
const getCareerRecommendations = asyncHandler(async (req, res) => {
    const student = req.user;

    // 1. Get student's skills
    const studentSkills = student.skills || [];
    
    // 2. Calculate Match Score
    const recommendations = careerPathsData.map(path => {
        let matchCount = 0;
        const matchedSkills = [];

        path.keywords.forEach(keyword => {
            // Check for partial matches (case-insensitive)
            const isMatch = studentSkills.some(skill => 
                skill.toLowerCase().includes(keyword.toLowerCase()) || 
                keyword.toLowerCase().includes(skill.toLowerCase())
            );
            if (isMatch) {
                matchCount++;
                matchedSkills.push(keyword);
            }
        });

        // Calculate a simple score (percentage of keywords matched, normalized)
        // Or just raw count. Let's use raw count for sorting.
        return {
            ...path,
            matchCount,
            matchedSkills
        };
    });

    // 3. Sort by Match Score (Descending) and return top 3
    const topRecommendations = recommendations
        .filter(rec => rec.matchCount > 0) // Only return paths with at least one skill match
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 3);
    
    // If no skills matched, return some defaults or empty
    if (topRecommendations.length === 0) {
         // Fallback: Return top 3 generic paths if no skills match
         res.json(careerPathsData.slice(0, 3).map(p => ({...p, matchCount: 0, matchedSkills: []})));
    } else {
        res.json(topRecommendations);
    }
});

// @desc    Get specific career roadmap
// @route   GET /api/users/roadmap/:roleId
// @access  Private/Student
const getCareerRoadmap = asyncHandler(async (req, res) => {
    const { roleId } = req.params;
    const path = careerPathsData.find(p => p.id === roleId);
    
    if (path) {
        res.json(path);
    } else {
        res.status(404);
        throw new Error('Career path not found');
    }
});

export { getUserProfile, updateUserProfile, getUsers, getStudentPlacementStatus, getCareerRecommendations, getCareerRoadmap };

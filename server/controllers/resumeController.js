import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is server/controllers, so root is ..
const rootDir = path.join(__dirname, '..');

// In-memory analysis cache (keyed by file content hash)
const analysisCache = new Map();
const hashBuffer = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// Basic section extraction to enable section-wise feedback
const SECTION_HEADERS = [
    { key: 'summary', labels: ['summary', 'objective', 'profile'] },
    { key: 'experience', labels: ['experience', 'work experience', 'professional experience', 'employment history'] },
    { key: 'education', labels: ['education', 'academics', 'qualification'] },
    { key: 'skills', labels: ['skills', 'technical skills', 'skills & tools', 'core skills'] },
    { key: 'certifications', labels: ['certifications', 'certificates', 'licenses'] },
    { key: 'projects', labels: ['projects', 'personal projects'] },
    { key: 'achievements', labels: ['achievements', 'awards', 'accomplishments'] },
    { key: 'contact', labels: ['contact', 'contact information'] },
];

const extractSections = (text) => {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    const content = {};
    let current = 'summary';
    content[current] = [];
    for (const line of lines) {
        if (!line) continue;
        const lower = line.toLowerCase();
        const header = SECTION_HEADERS.find(s => s.labels.some(lbl => lower === lbl || lower.startsWith(lbl + ':')));
        if (header) {
            current = header.key;
            if (!content[current]) content[current] = [];
        } else {
            if (!content[current]) content[current] = [];
            content[current].push(line);
        }
    }
    Object.keys(content).forEach(k => { content[k] = content[k].join('\n').trim(); });
    return content;
};

// Helper to analyze text
const analyzeText = (text) => {
    let score = 40; // Start with a base score so users don't get 0
    const mistakes = [];
    const suggestions = [];
    
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const lowerText = cleanText.toLowerCase();

    // 1. Check Length (Word Count)
    const wordCount = cleanText.split(' ').length;
    if (wordCount < 150) {
        score -= 10;
        mistakes.push('Resume is too short (under 150 words).');
        suggestions.push('Add more details about your projects, education, and experiences to reach at least 400-600 words.');
    } else if (wordCount > 1000) {
        score -= 5;
        suggestions.push('Resume might be too long (over 1000 words). Try to be more concise and keep it to 1-2 pages.');
    } else {
        score += 10;
    }

    // 2. Check for Key Sections
    const sections = ['education', 'experience', 'skills', 'projects', 'contact'];
    const foundSections = sections.filter(section => lowerText.includes(section));
    
    if (foundSections.length === sections.length) {
        score += 15;
    } else {
        const missing = sections.filter(s => !foundSections.includes(s));
        // Only penalize significantly if critical sections are missing
        if (missing.includes('education') || missing.includes('experience') || missing.includes('skills')) {
            mistakes.push(`Missing key sections: ${missing.join(', ')}`);
        }
        suggestions.push(`Ensure you clearly label sections like: ${missing.join(', ')}.`);
        score += (foundSections.length * 2);
    }

    // 3. Contact Info Checks
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/; // Improved phone regex
    
    if (emailRegex.test(cleanText)) {
        score += 5;
    } else {
        mistakes.push('No email address found.');
        suggestions.push('Add your professional email address clearly at the top.');
    }

    if (phoneRegex.test(cleanText) || lowerText.includes('phone') || lowerText.includes('mobile') || lowerText.includes('contact')) {
        score += 5;
    } else {
        suggestions.push('Consider adding a phone number for recruiters to contact you directly.');
    }

    // 4. Digital Presence (LinkedIn / GitHub / Portfolio)
    if (lowerText.includes('linkedin.com')) {
        score += 5;
    } else {
        suggestions.push('Add your LinkedIn profile URL to showcase your professional network.');
    }
    
    if (lowerText.includes('github.com') || lowerText.includes('gitlab.com') || lowerText.includes('behance.net') || lowerText.includes('portfolio')) {
        score += 5;
    } else {
        suggestions.push('Add a link to your GitHub, Portfolio, or Project repository to demonstrate your work.');
    }

    // 5. Impact & Action Verbs
    const actionVerbs = ['managed', 'developed', 'created', 'led', 'designed', 'implemented', 'optimized', 'achieved', 'built', 'analyzed', 'collaborated', 'initiated', 'resolved', 'improved', 'spearheaded'];
    const foundVerbs = actionVerbs.filter(verb => lowerText.includes(verb));
    
    if (foundVerbs.length >= 5) {
        score += 10;
    } else {
        suggestions.push(`Use strong action verbs to describe your achievements. Examples: ${actionVerbs.slice(0, 5).join(', ')}.`);
        score += foundVerbs.length; 
    }

    // 6. Quantifiable Results (Numbers, %, $)
    // Look for numbers followed by % or words like "increased", "reduced", "saved" nearby could be complex, 
    // but simply checking for numbers and % signs is a good proxy for "metrics".
    if (/[0-9]%/.test(cleanText) || /\$[0-9]/.test(cleanText) || /[0-9]+(\+|k|m)/i.test(cleanText)) {
        score += 10;
    } else {
        suggestions.push('Quantify your achievements! Use numbers, percentages, or metrics (e.g., "Increased efficiency by 20%", "Managed team of 5").');
    }

    // 7. Skills Check (Basic Tech & Soft Skills)
    const commonTechSkills = ['python', 'java', 'javascript', 'typescript', 'react', 'node', 'sql', 'html', 'css', 'c++', 'aws', 'docker', 'git', 'excel', 'spring', 'django', 'flask', 'go', 'kubernetes', 'terraform', 'power bi', 'tableau'];
    const foundTech = commonTechSkills.filter(skill => lowerText.includes(skill));
    
    if (foundTech.length >= 3) {
        score += 5; 
    } else {
        suggestions.push('List relevant technical skills or tools you are proficient in (e.g., Programming languages, Software).');
    }

    // 8. Critical Issues (Negative Marking)
    // Pronouns
    const pronouns = [' i ', ' me ', ' my ', ' we ', ' our '];
    const foundPronouns = pronouns.filter(p => lowerText.includes(p));
    if (foundPronouns.length > 0) {
        score -= 5;
        mistakes.push(`Avoid using first-person pronouns (${foundPronouns.map(p => p.trim()).join(', ')}). Use active voice instead.`);
    }

    // Passive Words
    const passivePhrases = ['responsible for', 'duties included', 'worked on', 'helped with'];
    const foundPassive = passivePhrases.filter(p => lowerText.includes(p));
    if (foundPassive.length > 0) {
        score -= 5;
        mistakes.push(`Avoid passive phrases like "${foundPassive[0]}". Use strong action verbs.`);
    }

    // Clichés / Buzzwords
    const cliches = ['hardworking', 'team player', 'go-getter', 'synergy', 'motivated', 'passionate'];
    const foundCliches = cliches.filter(c => lowerText.includes(c));
    if (foundCliches.length > 0) {
        mistakes.push(`Avoid overused buzzwords like "${foundCliches[0]}". Show your skills through examples instead.`);
    }

    // Missing Quantitative Data (Critical)
    if (!(/[0-9]%/.test(cleanText) || /\$[0-9]/.test(cleanText) || /[0-9]+(\+|k|m)/i.test(cleanText))) {
        mistakes.push('Critical: No quantifiable results found. Recruiters look for metrics (%, $, numbers) to measure impact.');
        score -= 10;
    }

    const bulletLines = (text.match(/(^|\n)\s*([•\-–·]|\d+\.)\s+/g) || []).length;
    if (bulletLines === 0) {
        suggestions.push('Use concise bullet points under experience and projects instead of long paragraphs.');
        score -= 5;
    }

    const sentenceCount = (cleanText.match(/[.!?]+/g) || []).length || 1;
    const avgWordsPerSentence = Math.round(wordCount / sentenceCount);
    if (avgWordsPerSentence > 30) {
        suggestions.push('Break down long sentences; aim for 12–20 words per sentence for readability.');
        score -= 5;
    } else if (avgWordsPerSentence < 8) {
        suggestions.push('Provide more substance in each bullet; very short lines lack context.');
    }

    const hasYears = /\b(19|20)\d{2}\b/.test(cleanText);
    if (!hasYears) {
        suggestions.push('Include dates for education and experience (e.g., 2023 – 2024).');
        score -= 3;
    }

    const specialChars = cleanText.match(/[^\x00-\x7F]/g);
    if (specialChars && specialChars.length > 50) {
        suggestions.push('Reduce special symbols and decorative characters to improve ATS parsing.');
        score -= 3;
    }

    const repeatedPhrases = ['etc', 'various', 'responsible for'];
    const repeats = repeatedPhrases.filter(p => lowerText.includes(p));
    if (repeats.length > 0) {
        suggestions.push('Avoid vague terms like etc/various; be specific about technologies and outcomes.');
    }

    const inconsistentPunct = /(^|\n)\s*([•\-–·]|\d+\.)\s+[^.\n]+[a-zA-Z](\n|$)/.test(text) && /(^|\n)\s*([•\-–·]|\d+\.)\s+[^!\n]+[.!](\n|$)/.test(text);
    if (inconsistentPunct) {
        suggestions.push('Keep bullet punctuation consistent (either end all bullets with a period or none).');
    }

    // Advanced analysis additions
    const yearMatches = [...cleanText.matchAll(/(19|20)\d{2}/g)].map(m => Number(m[0])).sort((a,b)=>a-b);
    if (yearMatches.length >= 2) {
        for (let i=1;i<yearMatches.length;i++) {
            if (yearMatches[i]-yearMatches[i-1] >= 3) {
                mistakes.push(`Potential employment/education gap detected between ${yearMatches[i-1]} and ${yearMatches[i]}. Consider addressing briefly.`);
                break;
            }
        }
    }
    const industryKeywords = ['api', 'microservices', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'unit testing', 'integration testing', 'agile', 'scrum', 'rest', 'graphql', 'c++', 'go'];
    const presentKeywords = industryKeywords.filter(k => lowerText.includes(k));
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const presentKeywordsNormalized = presentKeywords.map(normalize);
    const missingKeywords = industryKeywords.filter(k => !lowerText.includes(k));
    if (missingKeywords.length > 0) {
        suggestions.push(`Consider adding relevant industry keywords if applicable: ${missingKeywords.slice(0,8).join(', ')}.`);
    }
    const sectionsExtracted = extractSections(text);
    const sectionPresence = {
        summary: !!sectionsExtracted.summary,
        experience: !!sectionsExtracted.experience,
        education: !!sectionsExtracted.education,
        skills: !!sectionsExtracted.skills,
        certifications: !!sectionsExtracted.certifications,
        achievements: !!sectionsExtracted.achievements || !!sectionsExtracted.projects,
    };
    const sectionsScore = Math.min(Object.values(sectionPresence).filter(Boolean).length * 8, 30);
    score += sectionsScore;
    const atsHazards = [];
    if ((specialChars || []).length > 50) atsHazards.push('Many non-ASCII characters');
    if (/(table|column|page \d)/i.test(text)) atsHazards.push('Potential tables/columns that can confuse ATS');
    const atsScore = Math.max(0, 20 - atsHazards.length * 5);
    score += atsScore;

    // Cap score at 100 and Floor at 20
    if (score > 100) score = 100;
    if (score < 20) score = 20;

    // Derived metrics
    const keywordMatchPercent = Math.round((presentKeywords.length / industryKeywords.length) * 100);
    const sectionCompletionRate = Math.round((Object.values(sectionPresence).filter(Boolean).length / Object.keys(sectionPresence).length) * 100);
    // Simple readability index mapped from average words per sentence (ideal ≈ 12–20 words)
    const readabilityBase = 100 - Math.max(0, Math.abs(avgWordsPerSentence - 16) * 5);
    const readabilityIndex = Math.max(30, Math.min(100, Math.round(readabilityBase)));

    const subscores = {
        sections: Math.round(sectionsScore),
        keywords: Math.round(Math.min(15, 15 - Math.min(missingKeywords.length, 10))),
        achievements: Math.round(/%|\$|\b(increased|reduced|optimized|saved|improved)\b/i.test(cleanText) ? 15 : 5),
        formatting: Math.round(10 - Math.max(0, bulletLines === 0 ? 5 : 0)),
        ats: Math.round(atsScore),
    };
    const benchmark = score >= 80 ? 'A' : score >= 60 ? 'B' : 'C';

    // Floor metrics for substantial resumes to avoid demotivating zeroes
    if (wordCount >= 50) {
        score = Math.max(score, 50);
        keywordMatchPercent = Math.max(keywordMatchPercent, 50);
        readabilityIndex = Math.max(readabilityIndex, 50);
        sectionCompletionRate = Math.max(sectionCompletionRate, 50);
    }

    // Enrich suggestions: ensure robust, actionable guidance for every resume
    const suggestionsSet = new Set(suggestions);
    const addSuggestion = (msg) => { if (!suggestionsSet.has(msg)) { suggestions.push(msg); suggestionsSet.add(msg); } };

    // Section-specific guidance
    if (!sectionPresence.summary) {
        addSuggestion('Add a concise Professional Summary (2–3 lines) with role, experience, and 3 strengths.');
    }
    if (!sectionPresence.experience) {
        addSuggestion('Include Experience entries with 3–5 bullets each using action verbs and measurable results.');
    }
    if (!sectionPresence.education) {
        addSuggestion('Add an Education section with degree, institution, graduation year, and relevant coursework.');
    }
    if (!sectionPresence.skills) {
        addSuggestion('List a Skills section grouped by categories (Languages, Frameworks, Tools).');
    }
    if (!sectionPresence.certifications) {
        addSuggestion('Add Certifications or relevant courses to strengthen credibility for your target role.');
    }
    if (!(sectionsExtracted.projects && sectionsExtracted.projects.length > 0)) {
        addSuggestion('Include 1–2 Projects highlighting tech stack, your contributions, and outcomes.');
    }

    // Readability and structure
    if (bulletLines < 3) {
        addSuggestion('Convert dense paragraphs into short bullet points; start each with an action verb.');
    }
    if (avgWordsPerSentence > 24) {
        addSuggestion('Shorten sentences; aim for 12–20 words per sentence to improve readability.');
    }

    // Keywords and impact
    if (missingKeywords.length > 0) {
        const top3 = missingKeywords.slice(0,3).join(', ');
        addSuggestion(`Integrate relevant domain keywords thoughtfully in Experience/Projects: ${top3}.`);
    }
    if (!(/[0-9]%/.test(cleanText) || /\$[0-9]/.test(cleanText) || /[0-9]+(\+|k|m)/i.test(cleanText))) {
        addSuggestion('Add metrics for impact (e.g., “Improved load time by 35%”, “Reduced costs by $10k”).');
    }
    if ((specialChars || []).length > 50) {
        addSuggestion('Use standard ASCII characters and avoid decorative symbols to improve ATS parsing.');
    }

    // File and layout hygiene
    addSuggestion('Use a simple, single-column layout with clear headings to maximize ATS parse rate.');
    addSuggestion('Use consistent tense (past for previous roles, present for current), and consistent punctuation.');
    addSuggestion('Place contact info and links (Email, LinkedIn, GitHub) at the top header area.');

    // Ensure a minimum number of suggestions (fallback pool)
    const fallbackPool = [
        'Prioritize relevant experience and projects to the target role, move them above less relevant content.',
        'Avoid first‑person pronouns; write bullets that start with action verbs (e.g., Built, Optimized).',
        'Group similar skills; remove outdated technologies unless directly relevant to the role.',
        'Ensure uniform date formats (e.g., Mar 2024 – Present) across all sections.',
        'Keep resume length to 1 page for early career; 1–2 pages for experienced profiles.',
        'Use a professional file name (e.g., firstname_lastname_resume.pdf).'
    ];
    let i = 0;
    while (suggestions.length < 10 && i < fallbackPool.length) {
        addSuggestion(fallbackPool[i]);
        i++;
    }

    return { 
        score, mistakes, suggestions, wordCount,
        sections: sectionsExtracted, sectionPresence, subscores, benchmark,
        missingKeywords: missingKeywords.slice(0,8),
        presentKeywords,
        presentKeywordsNormalized,
        keywordMatchPercent,
        sectionCompletionRate,
        readabilityIndex,
        industryRecommendations: missingKeywords.slice(0,8).map(k => `Highlight experience or learning related to ${k}.`)
    };
};

// @desc    Analyze Resume
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResume = asyncHandler(async (req, res) => {
    let pdfBuffer;

    try {
        // 1. Check if file uploaded
        if (req.file) {
            pdfBuffer = fs.readFileSync(req.file.path);
        } 
        // 2. Check if user has resume on profile
        else if (req.user && req.user.resumeLink) {
            // resumeLink is like '/uploads/resume-....pdf'
            // Remove leading slash if present
            const relativePath = req.user.resumeLink.startsWith('/') ? req.user.resumeLink.substring(1) : req.user.resumeLink;
            const absolutePath = path.join(rootDir, relativePath);
            
            if (fs.existsSync(absolutePath)) {
                pdfBuffer = fs.readFileSync(absolutePath);
            } else {
                res.status(404);
                throw new Error('Profile resume file not found on server.');
            }
        } else {
            res.status(400);
            throw new Error('No resume uploaded and no resume found on profile.');
        }

        const cacheKey = hashBuffer(pdfBuffer);
        if (analysisCache.has(cacheKey)) {
            const cached = analysisCache.get(cacheKey);
            await new Promise(r => setTimeout(r, 6000));
            return res.json({ ...cached, cacheKey, cached: true });
        }

        // Determine file type and extract text + enforce limits
        const ext = (req.file?.originalname ? path.extname(req.file.originalname).toLowerCase() : '');
        const mime = (req.file?.mimetype || '').toLowerCase();
        let text = '';
        let pages = null;
        let fileType = 'pdf';

        if (mime.includes('application/pdf') || ext === '.pdf' || !mime) {
            const data = await pdf(pdfBuffer);
            text = data.text;
            pages = data.numpages || null;
            fileType = 'pdf';
            if (pages && pages > 5) {
                res.status(400);
                throw new Error('PDF page limit exceeded (max 5 pages).');
            }
        } else if (mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer: pdfBuffer });
            text = result.value || '';
            fileType = 'docx';
            const approxPages = Math.ceil((text.split(/\s+/).length || 0) / 500);
            if (approxPages > 5) {
                res.status(400);
                throw new Error('DOCX length appears to exceed 5 pages (approx). Please shorten your resume.');
            }
        } else if (mime.includes('application/msword') || ext === '.doc') {
            res.status(400);
            throw new Error('DOC format is not supported for analysis. Please convert to PDF or DOCX.');
        } else {
            res.status(400);
            throw new Error('Unsupported file format.');
        }

        const result = analyzeText(text);
        const payload = { ...result, fileType, pages, cacheKey, cached: false };
        analysisCache.set(cacheKey, payload);
        await new Promise(r => setTimeout(r, 6000));
        res.json(payload);

    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error(error.message || 'Failed to analyze resume.');
    }
});

export { analyzeResume };

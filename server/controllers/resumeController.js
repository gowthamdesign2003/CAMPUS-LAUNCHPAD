import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is server/controllers, so root is ..
const rootDir = path.join(__dirname, '..');

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
    const commonTechSkills = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'html', 'css', 'c++', 'aws', 'docker', 'git', 'excel'];
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

    // Cap score at 100 and Floor at 20
    if (score > 100) score = 100;
    if (score < 20) score = 20;

    return { score, mistakes, suggestions, wordCount };
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

        const data = await pdf(pdfBuffer);
        const text = data.text;
        
        const result = analyzeText(text);
        
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error(error.message || 'Failed to analyze resume.');
    }
});

export { analyzeResume };

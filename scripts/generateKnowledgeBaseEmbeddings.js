const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing in environment variables.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
    try {
        const kbPath = path.join(__dirname, '../public/scripts/documents/knowledgeBase.json');
        const outPath = path.join(__dirname, '../public/scripts/documents/knowledgeBase_embeddings.json');
        if (!fs.existsSync(kbPath)) {
            throw new Error(`Knowledge base file not found at ${kbPath}`);
        }
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        const chunks = [];

        // Components (array or object)
        if (Array.isArray(kb.components)) {
            for (const comp of kb.components) {
                let text = `Component: ${comp.name || ''}. ${comp.description || ''} Example queries: ${(comp.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        } else if (typeof kb.components === 'object') {
            for (const [key, value] of Object.entries(kb.components)) {
                let text = `${key}: `;
                if (value.description) text += value.description + ' ';
                if (value.example_queries) text += 'Example queries: ' + value.example_queries.join('; ');
                chunks.push(text);
            }
        }

        // Resume (if present)
        if (kb.resume) {
            if (kb.resume.summary) chunks.push(`resume_summary: ${kb.resume.summary}`);
            if (kb.resume.skills) chunks.push(`resume_skills: ${kb.resume.skills.join(', ')}`);
            if (kb.resume.certifications) chunks.push(`resume_certifications: ${kb.resume.certifications.join(', ')}`);
            if (kb.resume.education) {
                for (const edu of kb.resume.education) {
                    chunks.push(`resume_education: ${edu.degree} from ${edu.university} (${edu.year})`);
                }
            }
            if (kb.resume.professional_experience) {
                for (const exp of kb.resume.professional_experience) {
                    chunks.push(`resume_experience: ${(exp.role || '')} at ${(exp.client || exp.organization)}: ${(exp.responsibilities || []).join(' ')}`);
                }
            }
        }

        // Skills
        if (kb.skills) {
            for (const skill of kb.skills) {
                const text = `Skill: ${skill.name || ''}. ${skill.description || ''} Example queries: ${(skill.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        }

        // Certifications
        if (kb.certifications) {
            for (const cert of kb.certifications) {
                const text = `Certification: ${cert.name || ''}. Issued by ${cert.issuer || ''} (${cert.year || ''}). Example queries: ${(cert.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        }

        // Experience
        if (kb.experience) {
            for (const exp of kb.experience) {
                const text = `Experience: ${exp.role || ''} at ${exp.company || ''} (${exp.startYear || ''} - ${exp.endYear || ''}). ${(exp.responsibilities || []).join(' ')} Example queries: ${(exp.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        }

        // Education
        if (kb.education) {
            for (const edu of kb.education) {
                const text = `Education: ${edu.degree || ''} from ${edu.university || ''} (${edu.year || ''}). Example queries: ${(edu.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        }

        // Project Overview
        if (kb.project_overview) {
            for (const overview of kb.project_overview) {
                const text = `Project Overview: ${overview.purpose || ''} Key features: ${(overview.key_features || []).join(', ')} Example queries: ${(overview.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        }

        // Software Requirements
        if (kb.software_requirements) {
            for (const req of kb.software_requirements) {
                const text = `Software Requirements: Installed software: ${(req.installed_software || []).join(', ')} Dependencies: ${(req.dependencies || []).join(', ')} Example queries: ${(req.example_queries || []).join('; ')}`;
                chunks.push(text);
            }
        }

        const embeddings = [];
        for (const text of chunks) {
            try {
                const response = await openai.embeddings.create({
                    model: "text-embedding-ada-002",
                    input: text
                });
                embeddings.push({
                    text,
                    embedding: response.data[0].embedding
                });
                console.log(`Embedded: ${text.substring(0, 60)}...`);
            } catch (err) {
                console.error('Embedding failed for:', text.substring(0, 60), err.message);
            }
        }

        fs.writeFileSync(outPath, JSON.stringify(embeddings, null, 2));
        console.log('Knowledge base embeddings saved to', outPath);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();
// filepath: scripts/generateKnowledgeBaseEmbeddings.js
import { Router } from 'express'
import db from '../database/connection.js'
import { isAdmin } from '../middleware/isAdmin.js'
import Groq from "groq-sdk"

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.get('/api/issues', async (req, res) => {
    try {
        const issues = await db.all("SELECT * FROM issues ORDER BY publication_date DESC")
        res.json({ data: issues })
    } catch (error) { 
        res.status(500).json({ error: "Fetch failed" }) 
    }
})

router.get('/api/issues/:id', async (req, res) => {
    try {
        const issue = await db.get("SELECT * FROM issues WHERE id = ?", [req.params.id])
        const columns = await db.all("SELECT * FROM issue_columns WHERE issue_id = ?", [req.params.id])
        res.json({ issue, columns })
    } catch (error) { 
        res.status(500).json({ error: "Fetch failed" })
    }
})

router.post('/api/issues/generate', isAdmin, async (req, res) => {

    const assignments = [
        { 
            author: "Cameron", 
            topic: "Editor's Note", 
            prompt: "You are Cameron, the cool skater guy and Editor. Write a short intro (50 words) for this month's Bratz Magazine issue. Be chill." 
        },
        { 
            author: "Jade", 
            topic: "Fashion Forecast", 
            prompt: "You are Jade (Kool Kat). Write a column (100 words) about this month's weirdest fashion trends. Be edgy." 
        },
        { 
            author: "Cloe", 
            topic: "Ask Cloe & Drama", 
            prompt: "You are Cloe (Angel). Write a column (100 words) answering a fake fan letter about a relationship drama. Be dramatic and sweet." 
        },
        { 
            author: "Sasha", 
            topic: "Music & Beats", 
            prompt: "You are Sasha (Bunny Boo). Write a column (100 words) reviewing the hottest new music track. Be confident." 
        },
        { 
            author: "Yasmin", 
            topic: "Zen Lifestyle", 
            prompt: "You are Yasmin (Pretty Princess). Write a column (100 words) about finding inner peace or poetry. Be boho-chic." 
        }
    ]

    try {
        const monthName = new Date().toLocaleString('default', { month: 'long' })
        const issueTitle = `The ${monthName} Issue`

        const result = await db.run("INSERT INTO issues (title) VALUES (?)", [issueTitle])
        const issueId = result.lastID;

        await Promise.all(assignments.map(async (task) => {

            const prompt = `${task.prompt} 
            IMPORTANT: Start with a short, catchy headline for this column on the first line. 
            Then a newline. Then the article body.`

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
            })

            const fullText = completion.choices[0]?.message?.content || ""

            const firstLineIndex = fullText.indexOf('\n')
            let specificTopic = task.topic
            let content = fullText

            if (firstLineIndex !== -1) {
                specificTopic = fullText.substring(0, firstLineIndex).trim().replace(/\*\*/g, '').replace(/^#+\s*/, '')
                content = fullText.substring(firstLineIndex + 1).trim()
            }

            await db.run(
                `INSERT INTO issue_columns (issue_id, author, topic, content) VALUES (?, ?, ?, ?)`,
                [issueId, task.author, task.topic, content]
            )
        }))

        res.json({ success: true, title: issueTitle })

    } catch (error) {
        console.error("Magazine Gen Error:", error)
        res.status(500).json({ error: "Failed to publish magazine" })
    }
})

// delete issue

export default router
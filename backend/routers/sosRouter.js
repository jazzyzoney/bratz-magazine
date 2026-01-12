import { Router } from 'express'
import db from '../database/connection.js'
import { isAdmin } from '../middleware/isAdmin.js'
import Groq from "groq-sdk"

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/api/sos', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: "login to ask a question babes!"})
        
        const { question } = req.body
        
        await db.run(
            `INSERT INTO questions (email, question) VALUES (?, ?)`,
            [req.session.user.email, question]
        )
        res.json({ success: true })
    } catch (error) {
        console.error("error saving question", error)
    }
})

router.get('/api/sos', async (req, res) => {
    try {
        const q = await db.all("SELECT * FROM questions WHERE status = 'answered' ORDER BY created_at DESC")
        res.json({ data: q })
    } catch (error) {
        console.error("error fetching question", error)
    }
})

router.post('/api/sos/answer', isAdmin, async (req, res) => {
    try {
        const question = await db.get("SELECT * FROM questions WHERE status = 'pending' LIMIT 1")
        if (!question) return res.status(400).json({ error: "no pending questions" })

        const bratzSOS = [
            { name: "Cloe", style: "sweet, dramatic, romantic" },
            { name: "Jade", style: "cool, edgy, fashion-forward" },
            { name: "Sasha", style: "confident, leader, hip-hop" },
            { name: "Yasmin", style: "boho, poetic, shy" }
        ]
        const bratz = bratzSOS[Math.floor(Math.random() * bratzSOS.length)]

        const prompt = `You are ${bratz.name} from Bratz. Your personality is ${bratz.style}.
                        A fan asked: "${question.question}".
                        Give a short, helpful advisory answer (max 150 words).`

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        })

        const answerText = completion.choices[0]?.message?.content || ""

        await db.run(
            `UPDATE questions SET answer = ?, answered_by = ?, status = 'answered' WHERE id = ?`,
            [answerText, bratz.name, question.id]
        )
        res.json({ success: true, character: bratz.name, answer: answerText })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "agent failed" })
    }
})

export default router
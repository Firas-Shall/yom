const { z } = require('zod')

const signupSchema = z.object({
    username: z.string().trim().toLowerCase().min(5).max(10),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().trim().min(8)
})

module.exports = signupSchema
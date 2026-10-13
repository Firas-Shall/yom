const { z } = require('zod')

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().trim().min(8)
})

module.exports = loginSchema
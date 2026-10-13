const { z } = require('zod');

const journalSchema = z.object({
  content: z
    .string()
    .min(10, 'Journal should be at least 10 characters')
    .max(5000, 'Journal is too long')
});

module.exports = journalSchema;
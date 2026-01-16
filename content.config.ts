import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      schema: z.object({
        description: z.string()
          .optional(),
        image: z.string()
          .optional(),
        tags: z.array(z.string())
          .optional(),
        title: z.string(),
      }),
      source: '**',
      type: 'page',
    }),
  },
})

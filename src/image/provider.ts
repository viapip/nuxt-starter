import { defineProvider } from '@nuxt/image/runtime'
import { joinURL } from 'ufo'

const DEFAULT_BASE_URL = 'https://avatars.githubusercontent.com/u/'

export default defineProvider({
  getImage(src, { modifiers: _modifiers }) {
    return {
      format: 'webp',
      url: joinURL(DEFAULT_BASE_URL, src),
    }
  },
  supportsAlias: true,
  validateDomains: true,
})

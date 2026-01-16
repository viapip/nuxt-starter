import { NuxtImg, NuxtLink } from '#components'

// Add them to main entry (useful for content usage)
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NuxtLink', NuxtLink as Parameters<typeof nuxtApp.vueApp.component>[1])
  nuxtApp.vueApp.component('NuxtImg', NuxtImg as Parameters<typeof nuxtApp.vueApp.component>[1])
})

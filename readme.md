# Nuxt 4 Starter

Modern Nuxt 4 starter template with shadcn-vue, i18n, dark mode, and DevContainer support.

## ✨ Features

- **Nuxt 4.1** with Vue 3.5 and TypeScript 5.9 (strict mode)
- **Tailwind CSS 3.4** with shadcn-vue components (New York style)
- **Internationalization** — English and Russian out of the box
- **Dark mode** — toggle included, works instantly
- **DevContainer** — ready for VS Code and GitHub Codespaces
- **Nitro server** — async context, database, tasks, WebSocket support

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 4, Vue 3.5 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 3.4, shadcn-vue |
| Icons | Nuxt Icon (Tabler collection) |
| i18n | @nuxtjs/i18n |
| Content | @nuxt/content |
| Utilities | VueUse, Radix Vue |

## 📋 Prerequisites

- **Node.js** 20+ (DevContainer uses Node 22)
- **Yarn** 4.x (Yarn Berry)

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
yarn install

# Start dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### DevContainer (VS Code / Codespaces)

1. Open project in VS Code
2. Click "Reopen in Container" when prompted
3. Run `yarn dev` in the integrated terminal

## 📁 Project Structure

```
src/
├── client/             # Frontend (Nuxt app)
│   ├── app/            # app.vue (root component)
│   ├── assets/         # CSS, images
│   ├── components/     # Vue components
│   │   └── ui/         # shadcn-vue components
│   ├── layouts/        # Nuxt layouts
│   ├── lib/            # Utilities (cn, etc.)
│   ├── pages/          # Nuxt pages
│   └── plugins/        # Nuxt plugins
├── server/             # Nitro server
│   └── errors/         # HTTP error helpers
├── languages/          # i18n translations (en.yml, ru.yml)
├── content/            # Nuxt Content files
└── public/             # Static files
```

> **Note:** This template uses a non-standard structure with `src/client` for frontend code and `src/server` for Nitro. All paths are configured in `nuxt.config.ts`.

## 🧩 Adding shadcn-vue Components

```bash
npx shadcn-vue@1 add <component-name>
```

Example:
```bash
npx shadcn-vue@1 add button
npx shadcn-vue@1 add dialog
```

> **Note:** This project uses Tailwind CSS 3.4. Use `shadcn-vue@1` to ensure compatibility. Version 2.x+ requires Tailwind v4.

Components are installed to `src/client/components/ui/`.

Usage:
```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button>Click me</Button>
</template>
```

## 🌐 Internationalization

Translation files are in `src/languages/`:
- `en.yml` — English
- `ru.yml` — Russian (default)

Usage in components:
```vue
<template>
  <p>{{ $t('key') }}</p>
</template>
```

Configuration in `nuxt.config.ts` under `i18n` section.

## 🎨 Customization

### Dark Mode

Dark mode toggle is available via shadcn-vue's color mode. Theme variables are defined in CSS using HSL values.

### Theming

1. **CSS Variables** — Edit `src/client/assets/css/tailwind.css` for global theme tokens
2. **Tailwind Config** — Modify `tailwind.config.js` for design system changes
3. **Components** — Customize shadcn-vue components directly in `src/client/components/ui/`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |
| `yarn lint` | Lint and fix code |
| `yarn typecheck` | Run TypeScript check |
| `yarn clean` | Clean Nuxt cache |

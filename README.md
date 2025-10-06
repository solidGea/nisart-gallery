# NisArt Gallery - Image Gallery Website

A modern, responsive image gallery website built with React, TypeScript, and Vite. This application allows users to view, browse, search, and interact with images in a structured and visually appealing way.

## Features

### User Features
- **Homepage**: Display featured albums and browse by categories
- **Gallery Page**: Responsive grid/list layout with pagination support
- **Image Detail Page**: Full-size image view with metadata and navigation
- **Search & Filter**: Search by title, description, tags, and filter by categories
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Download Support**: Download images when permitted

### Technical Features
- Built with React 19, TypeScript, and Vite
- Tailwind CSS for styling with custom components
- React Router for navigation
- Date-fns for date formatting
- Lucide React for icons
- Performance optimized with lazy loading and image optimization

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nisaart-gallery
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components
│   ├── pages/           # Page components
│   └── ui/              # Reusable UI components
├── data/                # Mock data and utilities
├── types/               # TypeScript type definitions
└── lib/                 # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- Backend API integration
- User authentication system
- Admin panel for image management
- Image upload functionality
- Social sharing features
- Advanced filtering options

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

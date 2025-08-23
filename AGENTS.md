# Agent Guidelines for QCode Repository

## Build/Lint/Test Commands

### Build Commands
- **Full build**: `npm run build` or `next build`
- **Development server**: `npm run dev` or `next dev --turbopack`
- **Production start**: `npm start` or `next start`

### Lint Commands
- **Lint code**: `npm run lint` or `next lint`
- **ESLint config**: Uses Next.js core web vitals and TypeScript rules

### Test Commands
- **Run all tests**: `npm test` or `jest`
- **Run single test**: `jest <test-file>` or `npm test -- <test-file>`
- **Run translation tests**: `npm run test:translations`
- **Run all checks**: `npm run test:all` (tests + lint + build)

## Code Style Guidelines

### TypeScript & React
- Use functional components with hooks
- Define interfaces for component props
- Enable strict TypeScript mode
- Use path aliases: `@/` for `src/` directory

### Imports
- External libraries first (e.g., React, Next.js, lucide-react)
- Internal imports second (hooks, components, utils)
- Group by functionality and sort alphabetically

### Client Components
- Add `'use client'` directive at top for components using hooks/state
- Use React 19 features and patterns

### Styling & UI
- Use Tailwind CSS for styling
- Follow theme-based class naming (theme-text-primary, theme-bg-blue-100)
- Use Framer Motion for animations
- Implement responsive design with mobile-first approach

### Internationalization
- Use react-i18next for translations
- Access translations with `useTranslation` hook
- Translation keys follow dot notation (e.g., `common.appName`)

### Testing
- Use Jest with jsdom environment
- Use React Testing Library for component tests
- Mock i18next for component tests
- Test files located in `__tests__/` directories

### Error Handling
- Use try-catch for async operations
- Provide user-friendly error messages
- Handle loading states appropriately

### Code Organization
- Components in `src/components/`
- Hooks in `src/hooks/`
- Utilities in `src/utils/`
- Types in `src/types/`
- Tests in `__tests__/` subdirectories
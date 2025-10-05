# QCode DevContainer

This directory contains the DevContainer configuration for the QCode Next.js project.

## Features

- **Node.js 20 LTS**: Latest LTS version for optimal compatibility
- **pnpm Package Manager**: Fast, disk space efficient package manager
- **Git Support**: Git and GitHub CLI pre-installed
- **VS Code Extensions**: Pre-configured extensions for optimal development experience
- **Port Forwarding**: Port 3000 forwarded for Next.js development server
- **Environment Setup**: Automatic environment variable configuration for Supabase

## VS Code Extensions Included

- **TypeScript Importer**: Auto-import TypeScript definitions
- **ESLint**: JavaScript/TypeScript linting
- **Jest**: Testing framework support
- **Tailwind CSS IntelliSense**: CSS class autocomplete and syntax highlighting
- **Prettier**: Code formatting
- **Supabase**: Database development tools
- **Path Intellisense**: File path autocomplete
- **Auto Rename Tag**: HTML/JSX tag synchronization

## VS Code Settings

- Format on save enabled
- Prettier as default formatter
- Auto-fix ESLint issues on save
- TypeScript import suggestions
- Tailwind CSS class completion

## Getting Started

1. Install the "Dev Containers" extension in VS Code
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
4. The container will build and install dependencies automatically

## Post-Creation Setup

The container will automatically:
- Install dependencies with `pnpm install`
- Set up basic environment variables for Supabase development

## Environment Variables

After container creation, update the generated `.env.local` file with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

## Development Commands

The container is configured to work with existing npm scripts:
- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run test` - Run Jest tests

## Troubleshooting

If you encounter issues:
1. Ensure Docker is running
2. Check that ports 3000 is not already in use
3. Verify your Supabase credentials in `.env.local`
4. Rebuild the container if dependencies change: "Dev Containers: Rebuild Container"
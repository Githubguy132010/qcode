# QCode - Discount Code Manager

A Progressive Web App (PWA) for managing discount codes.

## Documentation

- [English Documentation](README.EN.md)
- [Nederlandse Documentatie](README.NL.md)

---

This project is built with Next.js 15, TypeScript, and Tailwind CSS. It allows users to save, manage, and organize discount codes with features like filtering, offline support, and cloud sync capabilities.

## Style Management Approach

This project uses a **Tailwind CSS-first** approach for all styling. There are no global utility classes or component-specific styles in `globals.css`—only true global resets and CSS variables for theming.

### Guidelines
- **Use Tailwind utilities** directly in your JSX for most styling needs.
- **Use CSS variables** (defined in `globals.css`) for theme colors, backgrounds, and other design tokens. Reference them in Tailwind using `text-[var(--color)]`, `bg-[var(--color)]`, etc.
- **No component-specific classes in global CSS.** All component styles are local, using Tailwind or inline style props.
- **Dark mode** is handled via CSS variables and Tailwind’s `dark:` modifier.

### Adding New Styles
- Prefer Tailwind utilities. If you need a new color or variable, add it to the `:root` or `.dark` section in `globals.css`.
- For complex or repeated patterns, use Tailwind’s `@apply` in a local CSS module (rarely needed).
- Avoid writing new global classes.

### Rationale
- **No style overlap or conflicts**: All styles are local or utility-based.
- **Easy maintenance**: Styles are colocated with components and easy to reason about.
- **Consistent theming**: CSS variables ensure dark/light mode and brand colors are consistent everywhere.

For any questions or to add new design tokens, edit `src/app/globals.css` and follow the above guidelines.

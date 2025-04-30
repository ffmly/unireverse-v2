# UniReverse

A modern booking and management platform for university clubs and administrators, built with Next.js, TypeScript, Tailwind CSS, and Supabase. This app is designed for university clubs to reserve stadiums, with access restricted to registered clubs approved by the admin. This project is part of the Master Coding Local initiative in Laghouat.

## Features

- **User Authentication**: Secure login with role-based access (admin, club).
- **Multi-language Support**: Easily switch between languages (LTR/RTL, e.g., Arabic).
- **Theme Toggle**: Light and dark mode support.
- **Booking System**: Clubs can book time slots via an interactive calendar.
- **User Reservations**: View and manage your own reservations.
- **Friendly Matches**: Organize and join friendly matches.
- **Admin Dashboard**: Manage clubs, reservations, stadiums, time slots, and auto-assignments.
- **Notifications**: Real-time updates and alerts.
- **Responsive UI**: Mobile-friendly and accessible design.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) (with custom themes)
- [Radix UI](https://www.radix-ui.com/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- [Supabase](https://supabase.com/) (for backend/auth)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

- `app/` — Main application pages (user, booking, admin dashboard)
- `components/` — UI and feature components
- `lib/` — Contexts and utilities (auth, language, etc.)
- `public/` — Static assets
- `styles/` — Global styles

## Customization

- **Tailwind**: Edit `tailwind.config.ts` for theme and color changes.
- **Languages**: Add or update translations in the language context files.
- **Supabase**: Configure your Supabase project and environment variables as needed.

## Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

MIT

---

> Made with ❤️ using Next.js, Tailwind CSS, and Supabase. 
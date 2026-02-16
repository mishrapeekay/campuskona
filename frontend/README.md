# School Management System - Frontend

React frontend built with Vite, Redux Toolkit, and Material-UI.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Material-UI v5** - Component library
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Tailwind CSS** - Utility styling
- **Vitest** - Unit tests

## Project Structure

```
src/
├── api/          # API client and endpoints
├── features/     # Redux slices
├── store/        # Redux store
├── routes/       # Route guards
├── pages/        # Page components
├── components/   # Reusable components
├── hooks/        # Custom hooks
├── utils/        # Utility functions
└── assets/       # Images, icons
```

## Environment Variables

See `.env.example` for required environment variables.

## Documentation

See [FRONTEND_SETUP.md](FRONTEND_SETUP.md) for detailed documentation.

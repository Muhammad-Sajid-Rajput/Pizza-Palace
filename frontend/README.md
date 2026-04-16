# Pizza Palace Frontend

This is the frontend for the Pizza Palace application, a modern web app for ordering delicious pizzas.

## Tech Stack

- **Framework:** React
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Linting:** ESLint

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pizza-palace.git
   cd pizza-palace/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

### Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

This will start the Vite development server, and you can view the application at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Starts a local server to preview the production build.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components (routes)
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   ├── types.tsx        # TypeScript type definitions
│   ├── config.ts        # App configuration
│   ├── index.css        # Global styles
│   └── vite-env.d.ts    # Vite environment types
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.cjs  # Tailwind CSS configuration
└── eslint.config.js    # ESLint configuration
```
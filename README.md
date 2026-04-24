# M-Ploy: AI-Powered Career Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

M-Ploy is Kenya's premier AI-powered career platform, designed to revolutionize job searching and career development. Our platform bridges the gap between talented job seekers and verified employers, offering verified job listings, ATS-optimized CV building, and comprehensive employability training.

## 🌟 Features

### For Job Seekers
- **Verified Job Vault**: Access curated, authenticated job openings from vetted employers worldwide
- **AI-Powered CV Builder**: Real-time CV analysis with predictive match scoring (95% pass rate)
- **Dynamic Templates**: Industry-specific CV designs optimized for ATS systems
- **Ready-to-Work Academy**: 50+ self-paced courses on communication, digital literacy, and EQ
- **TrustBadges**: Verifiable credentials for completed training modules

### For Employers
- **Employer Portal**: Intuitive dashboard for posting jobs and managing applications
- **Talent Discovery**: Advanced tools to find top candidates
- **Verified Listings**: Zero ghost postings, zero scams

### Platform Features
- **Secure Authentication**: Role-based access with Supabase Auth
- **Subscription Management**: Premium features with Stripe integration
- **Real-time Notifications**: Email and in-app notifications
- **Mobile-Responsive**: Optimized for all devices
- **Dark/Light Mode**: User preference support

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Shadcn/UI** - Accessible component library
- **React Query** - Server state management
- **React Router** - Client-side routing

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Edge Functions** - Serverless compute
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage

### Testing & Quality
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **TypeScript** - Type checking

### DevOps
- **Bun** - Fast package manager
- **Vite** - Build tooling

## 📋 Prerequisites

- Node.js 18+ or Bun
- Supabase account and project
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone
   cd mploy
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
   ```

4. **Supabase Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push

   # Deploy functions
   supabase functions deploy
   ```

5. **Start development server**
   ```bash
   # using npm
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npx playwright test

# Run linting
npm run lint
```

## 📦 Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

mploy/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn/UI components
│   │   └── landing/       # Landing page sections
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Supabase client and types
│   ├── lib/               # Utility functions
│   ├── pages/             # Route components
│   └── assets/            # Images and media
├── supabase/
│   ├── functions/         # Edge functions
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── test/                  # Test files
└── package.json           # Dependencies and scripts
```

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Ensure code passes linting
- Update documentation as needed


M-Ploy - Stop Searching. Start Getting Hired. 🇰🇪


Mploy Project in progress

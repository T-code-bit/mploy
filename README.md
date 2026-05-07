# 🇰🇪 M-Ploy: AI-Powered Career Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

> **Stop Searching. Start Getting Hired.**

M-Ploy is Kenya's premier AI-powered career platform, revolutionizing job searching and career development. We bridge the gap between talented job seekers and verified employers worldwide, combining intelligent matching with skill development.

---

## ✨ Key Features

### 💼 For Job Seekers
- **Verified Job Vault** - Curated, authenticated job openings from vetted employers worldwide
- **AI-Powered CV Builder** - Real-time CV analysis with predictive match scoring (95% pass rate)
- **Dynamic ATS-Optimized Templates** - Industry-specific CV designs optimized for Applicant Tracking Systems
- **Ready-to-Work Academy** - 50+ self-paced courses covering communication, digital literacy, and emotional intelligence
- **TrustBadges** - Verifiable digital credentials for completed training modules

### 🏢 For Employers
- **Intelligent Employer Portal** - Intuitive dashboard for posting jobs and managing applications
- **Advanced Talent Discovery** - Powerful tools to find and connect with top candidates
- **Verified Listings** - Zero ghost postings, zero scams—transparent hiring

### 🔧 Platform Capabilities
- **Secure Authentication** - Role-based access control with Supabase Auth
- **Premium Subscriptions** - Advanced features with Stripe integration
- **Real-time Notifications** - Email and in-app updates
- **Fully Responsive** - Optimized for desktop, tablet, and mobile
- **Dark & Light Mode** - User-preferred theming

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Modern UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS styling |
| **Framer Motion** | Smooth, delightful animations |
| **Shadcn/UI** | Accessible component library |
| **React Query** | Server state management & caching |
| **React Router** | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Reliable relational database |
| **Edge Functions** | Serverless compute for real-time features |
| **Supabase Auth** | Secure authentication & authorization |
| **Supabase Storage** | Scalable file storage |

### Quality & Testing
| Tool | Purpose |
|---|---|
| **Vitest** | Fast unit testing |
| **Playwright** | Comprehensive end-to-end testing |
| **ESLint** | Code quality & consistency |
| **TypeScript** | Compile-time type checking |

### DevOps
- **Bun** - Ultra-fast JavaScript runtime & package manager
- **Vite** - Optimized build and deployment tooling

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** or **Bun**
- **Supabase** account and project
- **Git** for version control

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/T-code-bit/mploy.git
cd mploy
```

#### 2. Install Dependencies
```bash
# Using Bun (recommended for speed)
bun install

# Or using npm
npm install
```

#### 3. Configure Environment
```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

#### 4. Setup Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

#### 5. Start Development Server
```bash
npm run dev
```
✅ App will be available at `http://localhost:5173`

---

## 📂 Project Structure

```
mploy/
├── public/                      # Static assets (favicon, fonts, etc.)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Shadcn/UI component library
│   │   └── landing/           # Landing page sections
│   ├── contexts/              # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/          # Third-party service integrations
│   │   └── supabase/          # Supabase client & generated types
│   ├── lib/                   # Utility functions & helpers
│   ├── pages/                 # Page-level route components
│   └── assets/                # Images, icons, media files
├── supabase/
│   ├── functions/             # Supabase Edge Functions
│   ├── migrations/            # Database migration scripts
│   └── config.toml            # Supabase configuration
├── test/                      # Test files & fixtures
├── package.json               # Dependencies & scripts
└── .env.example               # Environment variables template
```

---

## 🧪 Testing & Quality

### Run Tests
```bash
# Execute unit tests
npm run test

# Watch mode (re-run on changes)
npm run test:watch

# End-to-end tests with Playwright
npx playwright test

# Check code quality
npm run lint
```

### Build & Deploy
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📋 Development Guidelines

✅ **Code Quality Standards**
- Follow TypeScript best practices
- Write tests for all new features
- Ensure code passes ESLint checks
- Keep TypeScript strict mode enabled
- Update documentation for API changes

✅ **Commit Conventions**
- Use clear, descriptive commit messages
- Reference related issues with `#issue-number`
- Keep commits small and focused

✅ **Before Submitting PR**
- Run full test suite: `npm run test`
- Run linter: `npm run lint`
- Build for production: `npm run build`

---

## 🤝 Contributing

Contributions are welcome! To get started:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Contact

For questions, bugs, or feature requests:
- Open an [Issue](https://github.com/T-code-bit/mploy/issues)
- Check [Discussions](https://github.com/T-code-bit/mploy/discussions)

---

**Made with ❤️ in Kenya** | Stop Searching. Start Getting Hired. 🚀

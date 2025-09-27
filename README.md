# 📈 StockPulse - Real-time Stock Monitoring Platform

> A modern, feature-rich stock monitoring application built with Next.js, featuring real-time tracking, intelligent alerts, and beautiful visualizations.

![StockPulse Banner](https://via.placeholder.com/1200x400/0f172a/ffffff?text=StockPulse+-+Real-time+Stock+Monitoring)

## 🚀 Features

### ✅ **Authentication System**
- **Email/Password Authentication** with form validation
- **Google OAuth Integration** (ready for implementation)
- **Protected Routes** with automatic redirects
- **Persistent Sessions** with localStorage
- **Beautiful Glass-morphism UI** with animated backgrounds

### ✅ **Modern UI/UX**
- **Animated Background** with floating stock-related elements
- **Glassmorphism Design** with backdrop blur effects
- **Responsive Design** optimized for all devices
- **Dark Theme** with professional gradient backgrounds
- **Smooth Animations** and transitions throughout

### 🔄 **Coming Soon**
- Real-time stock price tracking
- Customizable watchlists
- Price alerts and notifications
- Portfolio analytics and insights
- Market trends and analysis
- Mobile app with Capacitor

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Custom Animations
- **Forms**: React Hook Form, Zod Validation
- **Icons**: Lucide React
- **Mobile**: Capacitor (Android support ready)
- **State Management**: React Context API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TonyStark0801/stock-monitor-web.git
   cd stock-monitor-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # Authentication API routes
│   ├── auth/              # Login/Register page
│   ├── dashboard/         # Protected dashboard
│   ├── watchlist/         # Stock watchlist page
│   ├── alerts/            # Price alerts page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── AnimatedBackground.tsx  # Canvas-based background animation
│   ├── AuthForm.tsx           # Login/Register form
│   ├── Header.tsx             # Navigation header
│   └── ProtectedRoute.tsx     # Route protection wrapper
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── types/                 # TypeScript type definitions
│   └── auth.ts           # Authentication interfaces
└── globals.css           # Global styles and animations
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Gradient from #0F172A to #64748B

### **Key Design Elements**
- **Glassmorphism**: `backdrop-blur-md` with `bg-white/10`
- **Animations**: Canvas-based floating elements
- **Typography**: Geist Sans & Geist Mono fonts
- **Spacing**: Consistent Tailwind spacing scale

## 🔐 Authentication Flow

### **Current Implementation**
1. **Landing Page**: Showcases features with animated background
2. **Auth Page**: Toggle between login/register with validation
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Dashboard**: Personalized welcome with user information

### **Mock Behavior (Development)**
- Any email/password combination will authenticate
- Google Sign-In creates a mock user account
- Sessions persist across browser refreshes
- Logout clears all stored authentication data

### **Backend Integration Ready**
- API routes structured for easy backend integration
- Clear interfaces for user data and authentication responses
- Environment variables ready for OAuth credentials
- Token-based authentication flow implemented

## 🛠 Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Mobile Development
npm run build:android    # Build Android app with Capacitor
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with zero configuration

### **Docker**
```dockerfile
# Dockerfile included in project root
docker build -t stockpulse .
docker run -p 3000:3000 stockpulse
```

### **Mobile App**
```bash
# Build and run Android app
npm run build
npx cap sync android
npx cap run android
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth (when implementing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Backend API URL (when integrating)
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Secret (for production)
JWT_SECRET=your_jwt_secret_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Roadmap

### **Phase 1: Foundation** ✅
- [x] Project setup and structure
- [x] Authentication system
- [x] Modern UI with animations
- [x] Protected routes and navigation

### **Phase 2: Core Features** 🔄
- [ ] Real-time stock data integration
- [ ] Watchlist management
- [ ] Price alerts system
- [ ] User preferences and settings

### **Phase 3: Advanced Features** 📅
- [ ] Portfolio analytics
- [ ] Market insights and trends
- [ ] Social features and sharing
- [ ] Advanced charting and analysis

### **Phase 4: Mobile & Scale** 📅
- [ ] Mobile app optimization
- [ ] Push notifications
- [ ] Offline support
- [ ] Performance optimizations

## 🐛 Known Issues

- Form validation messages need styling updates
- Loading states can be improved
- Need to implement proper error boundaries

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shubham Mishra**
- GitHub: [@TonyStark0801](https://github.com/TonyStark0801)
- Project: [StockPulse](https://github.com/TonyStark0801/stock-monitor-web)

---

<div align="center">
  <p>Built with ❤️ using Next.js and modern web technologies</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

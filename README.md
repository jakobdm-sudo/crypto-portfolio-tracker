# Crypto Portfolio Tracker

A simple, responsive web application for tracking your cryptocurrency portfolio. Built as a **type-safe** Next.js app using **tRPC**, **TailwindCSS**, and **Prisma**.  
Deployed on **Vercel** and accessible here: [crypto-portfolio-tracker-iota.vercel.app](https://crypto-portfolio-tracker-iota.vercel.app).
Use the Guest-Login to try it out without an account!

---

## ✨ Features

- 📊 **Interactive Charts**: Real-time portfolio visualization with **Recharts**.
- 💰 **Live Price Updates**: Automatic price updates for cryptocurrencies using the **CoinGecko API**.
- 🔐 **Secure Authentication**: Authentication using **NextAuth.js**.
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices.
- ⚡ **Real-time Updates**: Automatic portfolio value recalculation.
- 🎯 **Intuitive UX**:
  - Swipe-to-delete assets.
  - Edit mode for quick amount updates.
  - Sort assets by value.
  - Percentage breakdown in a pie chart.

---

## ⚙️ Tech Stack

### Frontend
- **Next.js**: React framework with App Router for server-side rendering and routing.
- **TypeScript**: Ensures type safety and reduces runtime errors.
- **TailwindCSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn/UI**: Accessible and customizable component library.
- **Recharts**: Responsive and interactive charting library.
- **Framer Motion**: Smooth animations for a polished user experience.

### Backend
- **tRPC**: End-to-end type-safe APIs for seamless communication between frontend and backend.
- **Prisma**: Type-safe ORM for database management.
- **Supabase (PostgreSQL)**: Scalable and reliable database solution.
- **NextAuth.js**: Secure authentication and session management.
- **CoinGecko API**: Provides real-time cryptocurrency price data.
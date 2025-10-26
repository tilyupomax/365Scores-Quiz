# 365Scores-Quiz

Test application for 365Scores quiz system - a full-stack web application with real-time leaderboard functionality.

## Repository Structure

This repository contains both frontend and backend applications:

### 🔧 Backend (`/backend`)
NestJS service that powers the quiz system with:
- REST API endpoints for quiz sessions and leaderboards
- Real-time updates via WebSockets and Server-Sent Events
- PostgreSQL database with Prisma ORM
- Redis for session state and caching
- Cookie-based session management

**See [backend/README.md](./backend/README.md) for detailed setup instructions and API documentation.**

### 🎨 Frontend (`/frontend`)
Next.js 16 App Router application featuring:
- TypeScript and Tailwind CSS 4
- TanStack Query 5 for state management
- shadcn/ui components
- Real-time leaderboard updates
- Responsive quiz interface

**See [frontend/README.md](./frontend/README.md) for development setup and available pages.**


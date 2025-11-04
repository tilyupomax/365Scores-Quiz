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

### System design of application
<img width="1402" height="601" alt="image" src="https://github.com/user-attachments/assets/a6121871-5386-4521-9912-d35a775afbb7" />

#### Authentication Flow

The application does not include a dedicated user or cookie authentication endpoint. Instead, **authentication is enforced through a Nest.js Guard** that operates during the request lifecycle to control access and enrich incoming requests as needed.

##### Guard Responsibilities

- Reads incoming cookies using `cookie-parser` to locate the `STICKY_USER_SESSION_COOKIE` token.  
- Does not rely on a specific authentication route or bootstrap step.  
- If the required cookie is **missing**, the guard:  
  - Generates a new identity/token.  
  - Sets it on the response with `Set-Cookie` using secure options (`httpOnly`, `sameSite`, `maxAge`, etc.).  
  - Allows the request pipeline to continue so the user session can proceed without a dedicated endpoint.  
- If the cookie **exists**, the guard:  
  - Validates the token.  
  - Loads the corresponding `USER` record from PostgreSQL.  
  - Attaches the loaded user to `request.sessionUser` for downstream handlers and controllers.

##### Guard Scope

- The guard is actively used for **quiz-related endpoints** to enforce authentication and session integrity.  
- **Leaderboard endpoints** remain publicly accessible to all users, authenticated or not.

---

#### Leaderboard Caching Flow

The leaderboard caching mechanism optimizes performance by introducing Redis as a fast, in-memory caching layer between the client and the database.

##### Request Lifecycle

1. **Client Request**  
   The user opens the leaderboard page. The browser sends a request to the **Next.js app**, which acts as both the frontend and a server interface.

2. **API Forwarding**  
   Next.js forwards relevant API requests to the **Nest.js backend** for data retrieval or updates.

3. **Cache Check**  
   Upon receiving a leaderboard request, Nest.js checks **Redis** for a cached version of the leaderboard payload (based on the requested key).  
   - **Cache Hit:** If data exists in Redis, the cached leaderboard is returned immediately to Next.js.  
   - **Cache Miss:** If data is absent, Nest.js queries **PostgreSQL** to fetch or compute the latest leaderboard results.

4. **Cache Write Back**  
   On a cache miss, after fetching from PostgreSQL, Nest.js writes the leaderboard data to Redis.  
   - Applies a TTL (Time-To-Live) or invalidation strategy to ensure freshness for future requests.

5. **Response Delivery**  
   Next.js returns the obtained leaderboard data (either from Redis or PostgreSQL) to the client, ensuring low-latency, consistent performance.

---

#### Operational Benefits

- **Reduced Database Load:** Redis offloads frequent leaderboard reads from PostgreSQL.  
- **Improved Performance:** Cached responses minimize latency for high-traffic leaderboard endpoints.  
- **Seamless Authentication:** The Nest.js Guard enables secure, cookie-based session management without additional auth routes.

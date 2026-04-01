Buddy Script — Social Feed Application

A full-stack social media feed application built with **Next.js 14**, **Prisma ORM**, and **PostgreSQL (Neon)**. Features JWT-based authentication, post creation with image uploads, comments, replies, likes, and public/private post visibility.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Design Decisions](#design-decisions)
- [Security Considerations](#security-considerations)
- [Scalability Considerations](#scalability-considerations)

---

## Features

### Authentication & Authorization
- User registration with first name, last name, email, and password
- Secure login with JWT stored in HTTP-only cookies
- Password hashing with bcrypt (12 salt rounds)
- Protected routes via Next.js middleware — unauthenticated users are redirected to login
- Automatic redirect from login/register to feed if already authenticated

### Feed Page
- **Create posts** with text and/or image upload
- **Public/Private visibility** toggle per post
  - Public posts are visible to all logged-in users
  - Private posts are visible only to the author
- **Newest-first** ordering with cursor-based pagination
- **Like/Unlike** posts, comments, and replies (toggle)
- **View likers** — click on like count to see who liked a post, comment, or reply
- **Comments** on posts with real-time addition
- **Replies** to comments with nested display
- **Infinite scroll** — loads more posts as you scroll down

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router), React 18  |
| Backend    | Next.js API Routes                  |
| Database   | PostgreSQL (Neon Serverless)        |
| ORM        | Prisma 5                            |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Styling    | Original CSS from provided design   |
| File Upload| Local filesystem (`public/uploads`) |

---

## Project Structure

```
buddy-script/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.js   # POST - User registration
│   │   │   ├── login/route.js      # POST - User login
│   │   │   └── me/route.js         # GET - Current user, DELETE - Logout
│   │   ├── posts/
│   │   │   ├── route.js            # GET - List posts, POST - Create post
│   │   │   └── [id]/
│   │   │       ├── like/route.js   # POST - Toggle like
│   │   │       ├── likers/route.js # GET - Who liked this post
│   │   │       └── comments/route.js # GET - All comments, POST - Add comment
│   │   ├── comments/
│   │   │   └── [id]/
│   │   │       ├── like/route.js   # POST - Toggle like
│   │   │       ├── likers/route.js # GET - Who liked this comment
│   │   │       └── replies/route.js # POST - Add reply
│   │   └── replies/
│   │       └── [id]/
│   │           ├── like/route.js   # POST - Toggle like
│   │           └── likers/route.js # GET - Who liked this reply
│   ├── feed/page.js                # Protected feed page
│   ├── login/page.js               # Login page
│   ├── register/page.js            # Registration page
│   ├── layout.js                   # Root layout
│   ├── globals.css                 # Global styles (imports original CSS)
│   ├── common.css                  # Original common CSS
│   ├── main.css                    # Original main CSS
│   └── responsive.css              # Original responsive CSS
├── components/
│   ├── Avatar.js                   # Initials-based avatar
│   ├── CreatePost.js               # Post creation form
│   ├── PostCard.js                 # Post display with like/comment
│   ├── CommentItem.js              # Comment with like/reply
│   ├── ReplyItem.js                # Reply with like
│   └── LikersModal.js             # Modal showing who liked
├── lib/
│   ├── auth.js                     # JWT sign/verify/getAuthUser
│   └── prisma.js                   # Prisma client singleton
├── prisma/
│   └── schema.prisma               # Database schema
├── public/
│   ├── images/                     # Static assets (logo, shapes, etc.)
│   └── uploads/                    # User-uploaded images
├── middleware.js                    # Route protection
├── .env                            # Environment variables
├── .env.example                    # Env template
├── .gitignore
├── package.json
├── jsconfig.json
└── next.config.js
```

---

## Database Schema

```
User
├── id (PK, cuid)
├── email (unique)
├── password (bcrypt hash)
├── firstName
├── lastName
└── createdAt

Post
├── id (PK, cuid)
├── content
├── imageUrl (nullable)
├── visibility ("public" | "private")
├── createdAt (indexed DESC)
└── authorId (FK → User, indexed)

PostLike
├── id (PK, cuid)
├── postId (FK → Post)
└── userId (FK → User)
    └── unique(postId, userId)

Comment
├── id (PK, cuid)
├── content
├── createdAt
├── postId (FK → Post, indexed)
└── authorId (FK → User)

CommentLike
├── id (PK, cuid)
├── commentId (FK → Comment)
└── userId (FK → User)
    └── unique(commentId, userId)

Reply
├── id (PK, cuid)
├── content
├── createdAt
├── commentId (FK → Comment, indexed)
└── authorId (FK → User)

ReplyLike
├── id (PK, cuid)
├── replyId (FK → Reply)
└── userId (FK → User)
    └── unique(replyId, userId)
```

All like tables use a **unique compound index** on (targetId, userId) to prevent duplicate likes and enable O(1) toggle operations.

---

## API Reference

### Authentication

| Method | Endpoint             | Body                                              | Description        |
|--------|----------------------|---------------------------------------------------|--------------------|
| POST   | `/api/auth/register` | `{ firstName, lastName, email, password }`        | Register new user  |
| POST   | `/api/auth/login`    | `{ email, password }`                             | Login              |
| GET    | `/api/auth/me`       | —                                                 | Get current user   |
| DELETE | `/api/auth/me`       | —                                                 | Logout             |

### Posts

| Method | Endpoint                      | Body / Params                        | Description              |
|--------|-------------------------------|--------------------------------------|--------------------------|
| GET    | `/api/posts?cursor=`          | Query: `cursor` (optional)           | List posts (paginated)   |
| POST   | `/api/posts`                  | FormData: `content`, `visibility`, `image` | Create post        |
| POST   | `/api/posts/[id]/like`        | —                                    | Toggle like              |
| GET    | `/api/posts/[id]/likers`      | —                                    | Get users who liked      |
| GET    | `/api/posts/[id]/comments`    | —                                    | Get all comments         |
| POST   | `/api/posts/[id]/comments`    | `{ content }`                        | Add comment              |

### Comments

| Method | Endpoint                        | Body          | Description         |
|--------|---------------------------------|---------------|---------------------|
| POST   | `/api/comments/[id]/like`       | —             | Toggle like         |
| GET    | `/api/comments/[id]/likers`     | —             | Get users who liked |
| POST   | `/api/comments/[id]/replies`    | `{ content }` | Add reply           |

### Replies

| Method | Endpoint                     | Body | Description         |
|--------|------------------------------|------|---------------------|
| POST   | `/api/replies/[id]/like`     | —    | Toggle like         |
| GET    | `/api/replies/[id]/likers`   | —    | Get users who liked |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Installation

```bash
# 1. Navigate to the project
cd buddy-script

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Neon connection string and JWT secret

# 4. Push database schema to Neon
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

### Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable       | Description                              | Example                                                              |
|----------------|------------------------------------------|----------------------------------------------------------------------|
| `DATABASE_URL` | Neon PostgreSQL connection string        | `postgresql://user:pass@host.neon.tech/neondb?sslmode=require`       |
| `JWT_SECRET`   | Secret key for signing JWT tokens        | Any long random string                                               |

---

## Design Decisions

1. **Next.js App Router** — Colocates API routes with pages, enables middleware-based auth, and supports React Server Components for future optimization.

2. **JWT in HTTP-only cookies** — Prevents XSS attacks from accessing tokens. The middleware checks cookies for route protection without client-side token management.

3. **Cursor-based pagination** — More performant than offset pagination for large datasets. Uses post `id` as cursor, which works well with Prisma's cursor API.

4. **Separate like tables** — `PostLike`, `CommentLike`, `ReplyLike` are separate tables (not polymorphic) for cleaner indexes and simpler queries at scale.

5. **Unique compound indexes on likes** — `@@unique([postId, userId])` ensures one like per user per entity and enables efficient toggle (check + create/delete).

6. **Original CSS preserved** — The provided HTML/CSS design is kept intact. Custom overrides are added in `globals.css` to fix scroll behavior within the React SPA context.

7. **Initials-based avatars** — Instead of placeholder images, user avatars show initials (e.g., "JD" for John Doe) for a cleaner look without requiring profile picture uploads.

---

## Security Considerations

- **Password hashing** — bcrypt with 12 salt rounds
- **HTTP-only cookies** — JWT tokens are not accessible via JavaScript
- **Secure cookie flag** — Enabled in production
- **SameSite=Lax** — CSRF protection on cookies
- **Input validation** — All API routes validate required fields
- **SQL injection prevention** — Prisma ORM uses parameterized queries
- **Authorization checks** — Every API route verifies the JWT before processing
- **Private posts** — Only visible to the author; enforced at the database query level
- **Unique constraints** — Prevent duplicate likes at the database level
- **Cascade deletes** — Deleting a user removes all their posts, comments, likes

---

## Scalability Considerations

- **Database indexes** — Posts indexed by `createdAt DESC` and `authorId` for fast feed queries. Like tables indexed by target ID for fast count queries.
- **Cursor pagination** — Avoids the `OFFSET` performance cliff with millions of rows.
- **Prisma client singleton** — Prevents connection pool exhaustion in development.
- **Neon serverless PostgreSQL** — Auto-scales compute and storage. Connection pooling built-in.
- **Separate like tables** — Avoids polymorphic queries; each table can be independently sharded if needed.
- **Lazy comment loading** — Initial feed loads only 3 comments per post; full comments loaded on demand.
- **Image uploads** — Stored on local filesystem; can be migrated to S3/CloudFront for production CDN delivery.
#   B u d d y S c r i p t 
 
 

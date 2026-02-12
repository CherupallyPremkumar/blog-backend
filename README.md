# 🚀 Personal Blog Backend (Strapi v5)

This is the headless CMS for the Personal Blog, built with **Strapi v5**. It manages content, authentication, and media storage.

## ✨ Features

- **Content Types**:
  - `Article`: Blog posts with rich text blocks, authors, categories, and cover images.
  - `Category`: Hierarchical categories for organizing content.
  - `Author`: Profiles for content creators.
  - `Comment`: User comments on articles.
  - `Like`: User likes on articles.
  - `User`: Extended user profiles (bio, avatar, role-based access).

- **Media Storage**: Integrated with **Cloudinary** for image optimization and responsive formats.
- **Authentication**: JWT-based auth via `users-permissions` plugin.
- **Custom APIs**:
  - `/api/profile`: Update user bio and avatar seamlessly.
  - `/api/profile/liked-articles`: Retrieve articles liked by the authenticated user.

## 🛠️ Tech Stack

- **Framework**: Strapi v5
- **Database**: SQLite (Development) / PostgreSQL (Production recommeded)
- **Language**: TypeScript
- **Plugins**:
  - `@strapi/plugin-users-permissions`
  - `@strapi/provider-upload-cloudinary`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in secrets:
   ```bash
   cp .env.example .env
   ```
   
   **Required Variables:**
   ```env
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=...
   API_TOKEN_SALT=...
   ADMIN_JWT_SECRET=...
   TRANSFER_TOKEN_SALT=...
   JWT_SECRET=...
   
   # Database
   DATABASE_CLIENT=sqlite
   DATABASE_FILENAME=.tmp/data.db
   
   # Cloudinary (for media)
   CLOUDINARY_NAME=...
   CLOUDINARY_KEY=...
   CLOUDINARY_SECRET=...
   ```

4. Start development server:
   ```bash
   npm run develop
   ```

5. Access Admin Panel: [http://localhost:1337/admin](http://localhost:1337/admin)

## 📜 Scripts

- `npm run develop`: Start dev server with auto-reload
- `npm run start`: Start production server
- `npm run build`: Build admin panel
- `npm run strapi`: Run Strapi CLI commands

## 📂 Customizations

### Profile Controller
Located in `src/api/profile/`, this custom controller handles user bio updates and avatar uploads, fixing default permission limitations.

### Extensions
`src/extensions/users-permissions/` contains schema updates for the User content type (adding `bio`, `avatar`, relations).

---

Built with ❤️ by Prem Kumar

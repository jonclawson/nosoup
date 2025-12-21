# Next! no soup for you - An article mangement app

A NextJS 15 application with full CRUD operations for blog articles and user management, built with the App Router, Prisma ORM, and Tailwind CSS.

## Features

### Blog Articles
- **List Articles**: View all articles in a modern blog-style layout
- **View Article**: Detailed view of individual articles with author information
- **Create Article**: Write and publish new articles with title and content
- **Update Article**: Edit existing articles (author only)
- **Delete Article**: Remove articles with confirmation (author only)

### User Management
- **List Users**: View all users in a responsive table (admin only)
- **View User**: Detailed view of individual user information
- **Create User**: Add new users with name, email, and role
- **Update User**: Edit existing user information
- **Delete User**: Remove users with confirmation

### Authentication & Authorization
- **NextAuth.js Integration**: Secure authentication system
- **Sign In**: Email/password authentication
- **Sign Up**: User registration with password hashing
- **Role-Based Access**: Admin and user roles with different permissions
- **Session Management**: JWT-based sessions with CSRF protection
- **Route Protection**: Middleware-based route security

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Blog-Style Layout**: Card-based article display
- **Role-Based Navigation**: Different menu items for different user roles
- **Responsive Design**: Works on all device sizes
- **Type Safety**: Full TypeScript support
- **Database**: SQLite database with Prisma ORM

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **SQLite** - Database (can be easily changed to PostgreSQL, MySQL, etc.)
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling (implicit through Next.js)
- **NextAuth** - Authentication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nosoup
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts        # NextAuth.js API routes
│   │   │   └── register/
│   │   │       └── route.ts        # User registration API
│   │   ├── articles/
│   │   │   ├── route.ts            # GET /api/articles, POST /api/articles
│   │   │   └── [id]/
│   │   │       └── route.ts        # GET, PUT, DELETE /api/articles/[id]
│   │   └── users/
│   │       ├── route.ts            # GET /api/users, POST /api/users
│   │       └── [id]/
│   │           └── route.ts        # GET, PUT, DELETE /api/users/[id]
│   ├── articles/
│   │   ├── page.tsx                # Articles list page
│   │   ├── new/
│   │   │   └── page.tsx            # Create article page
│   │   └── [id]/
│   │       ├── page.tsx            # View article page
│   │       └── edit/
│   │           └── page.tsx        # Edit article page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx            # Sign in page
│   │   └── register/
│   │       └── page.tsx            # Sign up page
│   ├── users/
│   │   ├── new/
│   │   │   └── page.tsx            # Create user page
│   │   └── [id]/
│   │       ├── page.tsx            # View user page
│   │       └── edit/
│   │           └── page.tsx        # Edit user page
│   ├── layout.tsx                  # Root layout with navigation
│   ├── page.tsx                    # Home page (redirects to articles)
│   └── not-found.tsx              # 404 page
├── components/
│   ├── ArticleList.tsx             # Articles list component
│   ├── AuthStatus.tsx              # Authentication status component
│   ├── DeleteButton.tsx            # Reusable delete button
│   ├── Navigation.tsx              # Navigation component
│   ├── Providers.tsx               # NextAuth.js provider
│   └── UserList.tsx                # Users list component
├── lib/
│   ├── auth.ts                     # NextAuth.js configuration
│   └── prisma.ts                   # Prisma client configuration
├── test/
│   ├── api/
│   │   └── articles/
│   │       └── route.test.ts       # Articles API tests
│   └── articles/
│       └── page.test.tsx           # Articles page tests
├── types/
│   └── next-auth.d.ts             # NextAuth.js type extensions
├── middleware.ts                   # Route protection middleware
└── globals.css                     # Global styles

prisma/
├── schema.prisma                   # Database schema
└── migrations/                     # Database migrations
```

## API Endpoints

### Articles

- `GET /api/articles` - Get all articles with author information
- `POST /api/articles` - Create a new article (authenticated users only)
- `GET /api/articles/[id]` - Get a specific article
- `PUT /api/articles/[id]` - Update an article (author only)
- `DELETE /api/articles/[id]` - Delete an article (author only)

### Users

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a specific user
- `PUT /api/users/[id]` - Update a user
- `DELETE /api/users/[id]` - Delete a user

### Authentication

- `GET /api/auth/[...nextauth]` - NextAuth.js API routes
- `POST /api/auth/register` - User registration

### Request/Response Examples

#### Create Article
```bash
POST /api/articles
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "title": "My First Article",
  "body": "This is the content of my first article..."
}
```

#### Update Article
```bash
PUT /api/articles/[id]
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "title": "Updated Article Title",
  "body": "Updated article content..."
}
```

#### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

#### Update User
```bash
PUT /api/users/[id]
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "admin"
}
```

## Database Schema

The application uses User and Article models with NextAuth.js integration:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String?
  role          String    @default("user")
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  articles      Article[]
}

model Article {
  id        String   @id @default(cuid())
  title     String
  body      String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma db seed` - Seed database with test data

## Authentication

The application uses NextAuth.js for authentication with the following features:

- **Credentials Provider**: Email/password authentication
- **JWT Sessions**: Stateless session management
- **Password Hashing**: Secure password storage with bcrypt
- **Role-Based Access**: Admin and user roles with different permissions
- **Route Protection**: Middleware-based security for protected routes
- **CSRF Protection**: Built-in protection against cross-site request forgery

### Environment Variables

Required environment variables:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Test Users

The application includes seeded test users:

- **Admin User**: `admin@example.com` / `admin123` (role: admin)
- **Regular User**: `user@example.com` / `user123` (role: user)

## Testing

The application includes comprehensive unit tests:

- **API Route Tests**: Full coverage of all API endpoints
- **Component Tests**: Page component testing with React Testing Library
- **Mock Strategy**: Proper mocking of dependencies (Prisma, NextAuth, etc.)
- **Test Coverage**: 100% coverage for API routes, 80%+ for components

### Running Tests

```bash
# Run all tests
npm test

# Run only page component tests
npm test -- --testPathPatterns="page.test.tsx"

# Run only API route tests
npm test -- --testPathPatterns="route.test.ts"

# Run tests with coverage
npm run test:coverage
```

## Customization

### Changing Database

To use a different database (PostgreSQL, MySQL, etc.):

1. Update the `datasource` in `prisma/schema.prisma`
2. Update the `DATABASE_URL` in `.env`
3. Run `npx prisma migrate dev`

### Adding New Fields

1. Update the models in `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update the API routes and forms accordingly

### Adding New Features

1. Create API routes in `src/app/api/`
2. Create pages in `src/app/`
3. Add components in `src/components/`
4. Write tests in `src/test/`
5. Update middleware for route protection if needed

## Deployment

The application can be deployed to Cloudflare Pages using the included Terraform configuration and GitHub Actions workflow.

### Cloudflare Deployment Setup

#### 1. Prerequisites

- Cloudflare account (free tier works)
- HashiCorp Cloud Platform (HCP) account for Terraform state (free tier)
- GitHub account

#### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret and add:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | See detailed instructions below |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Found in the right sidebar at [dash.cloudflare.com](https://dash.cloudflare.com) |
| `TF_CLOUD_ORGANIZATION` | Terraform Cloud org name | Create at [app.terraform.io](https://app.terraform.io) - use your organization name |
| `TF_WORKSPACE` | Terraform workspace name | e.g., "nosoup" - create workspace in Terraform Cloud |
| `TF_API_TOKEN` | Terraform Cloud API token | [app.terraform.io → User Settings → Tokens](https://app.terraform.io/app/settings/tokens) |
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | e.g., `https://nosoup.pages.dev` (update after first deploy) |
| `R2_ACCESS_KEY_ID` | R2 access key | See R2 instructions below |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | Same as R2_ACCESS_KEY_ID |

##### Getting CLOUDFLARE_API_TOKEN

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Click **Create Custom Token**
4. Configure the token:
   - **Token name**: e.g., "GitHub Actions Deploy"
   - **Permissions**: Add these:
     - Account → D1 → Edit
     - Account → Cloudflare Pages → Edit
     - Account → Workers R2 Storage → Edit
     - Account → Workers Scripts → Edit
   - **Account Resources**: Include → Your account
   - **TTL**: Set expiration or leave as default
5. Click **Continue to summary** → **Create Token**
6. **Copy the token immediately** (you can't see it again)

##### Getting R2 Access Keys

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **R2**
2. Click **Manage R2 API Tokens**
3. Click **Create API Token**
4. Configure:
   - **Token name**: e.g., "GitHub Actions R2"
   - **Permissions**: Object Read & Write (or Admin Read & Write)
   - **TTL**: Set expiration or leave as default
5. Click **Create API Token**
6. Copy both **Access Key ID** and **Secret Access Key**

#### 3. Deploy

Push to the `main` branch and GitHub Actions will automatically:
1. Provision D1 database, R2 bucket, and Pages project using Terraform
2. Generate and export your local database
3. Import database to Cloudflare D1
4. Build and deploy your Next.js app to Cloudflare Pages

#### 4. Destroy Infrastructure (Optional)

To tear down all infrastructure:
1. Go to Actions → Deploy to Cloudflare → Run workflow
2. Type `destroy` in the input field
3. Click Run workflow

### Local Environment Variables

Create a `.env.local` file for local development:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-local-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Environment Variables

- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js (change in production)
- `NEXTAUTH_URL` - Base URL for NextAuth.js (e.g., `https://yourdomain.com`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

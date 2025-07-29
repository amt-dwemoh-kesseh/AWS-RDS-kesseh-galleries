# Kesseh Galleries - Local Development Setup

This guide will help you set up the Kesseh Galleries application for local development.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)
- **AWS Account** with S3 access
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd kesseh-galleries

# Install all dependencies
npm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Using PostgreSQL Locally

1. **Start PostgreSQL service**:
   ```bash
   # On macOS (with Homebrew)
   brew services start postgresql

   # On Ubuntu/Debian
   sudo systemctl start postgresql

   # On Windows
   # Start PostgreSQL from Services or pgAdmin
   ```

2. **Create database and user**:
   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres

   # Create database
   CREATE DATABASE kesseh_galleries_dev;

   # Create user (optional, you can use postgres user)
   CREATE USER kesseh_dev WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE kesseh_galleries_dev TO kesseh_dev;

   # Exit psql
   \q
   ```

### Option B: Using Docker (Alternative)

```bash
# Run PostgreSQL in Docker
docker run --name kesseh-postgres \
  -e POSTGRES_DB=kesseh_galleries_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

## Step 3: Set Up AWS S3 Bucket

1. **Create S3 bucket** (via AWS Console or CLI):
   ```bash
   # Using AWS CLI (if installed)
   aws s3 mb s3://kesseh-galleries-local-dev --region us-east-1
   ```

2. **Configure bucket permissions**:
   - Enable public read access for uploaded images
   - Or configure bucket policy for your specific needs

3. **Get AWS credentials**:
   - Go to AWS Console → IAM → Users → Your User → Security Credentials
   - Create new Access Key
   - Note down Access Key ID and Secret Access Key

## Step 4: Configure Environment Variables

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual values:
   ```env
   # AWS Configuration
   AWS_ACCESS_KEY_ID=AKIA...your_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=kesseh-galleries-local-dev

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=kesseh_galleries_dev
   DB_USERNAME=postgres
   DB_PASSWORD=your_secure_password

   # Application Configuration
   NODE_ENV=development
   PORT=3001
   ```

## Step 5: Test Database Connection

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d kesseh_galleries_dev -c "SELECT version();"
```

If successful, you should see PostgreSQL version information.

## Step 6: Start the Application

### Option A: Start Both Frontend and Backend Together

```bash
# This starts both the Express server and Vite dev server
npm run dev
```

This will:
- Start the Express API server on `http://localhost:3001`
- Start the Vite frontend dev server on `http://localhost:5173`
- Automatically initialize the database schema
- Enable hot reloading for both frontend and backend

### Option B: Start Services Separately

```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend dev server
npm run client
```

## Step 7: Verify Everything is Working

1. **Check backend health**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check database connection**:
   - Look for "✅ Connected to PostgreSQL database" in server logs
   - Check for "✅ Database schema initialized successfully"

3. **Open the application**:
   - Navigate to `http://localhost:5173`
   - You should see the Kesseh Galleries interface

4. **Test image upload**:
   - Try uploading an image
   - Check if it appears in your S3 bucket
   - Verify the image metadata is stored in PostgreSQL

## Step 8: Database Management (Optional)

### View Database Tables

```bash
# Connect to your database
psql -h localhost -U postgres -d kesseh_galleries_dev

# List tables
\dt

# View images table structure
\d images

# View sample data
SELECT id, filename, original_name, description, created_at FROM images LIMIT 5;

# Exit
\q
```

### Reset Database (if needed)

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d kesseh_galleries_dev

# Drop and recreate tables (this will delete all data!)
DROP TABLE IF EXISTS images CASCADE;

# Exit and restart the application to recreate schema
\q
npm run server
```

## Troubleshooting

### Common Issues and Solutions

1. **Database connection failed**:
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Check your .env file has correct credentials
   cat .env | grep DB_
   ```

2. **AWS S3 upload fails**:
   ```bash
   # Test AWS credentials
   aws s3 ls s3://your-bucket-name
   
   # Check bucket exists and you have permissions
   aws s3api head-bucket --bucket your-bucket-name
   ```

3. **Port already in use**:
   ```bash
   # Find what's using port 3001
   lsof -i :3001
   
   # Kill the process or change PORT in .env
   ```

4. **Node modules issues**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Database schema not created**:
   - Check server logs for database initialization errors
   - Ensure your database user has CREATE privileges
   - Try restarting the server

## Development Workflow

### Making Changes

1. **Frontend changes**: 
   - Edit files in `src/`
   - Changes auto-reload at `http://localhost:5173`

2. **Backend changes**:
   - Edit files in `server/`
   - Server auto-restarts with nodemon

3. **Database changes**:
   - Modify `server/database.js` for schema changes
   - Restart server to apply changes

### Testing Uploads

1. **Prepare test images**: Have some sample images ready (JPG, PNG, GIF)
2. **Test drag & drop**: Drag images onto the upload area
3. **Test file picker**: Click "Choose Files" button
4. **Verify storage**: Check both S3 bucket and PostgreSQL database
5. **Test gallery**: Verify images appear in the gallery with pagination

## Next Steps

Once everything is working locally:

1. **Develop new features** using the local environment
2. **Test thoroughly** before pushing to production
3. **Use Git** to version control your changes
4. **Deploy to AWS** using the GitHub Actions workflow

## Useful Commands

```bash
# Install new dependencies
npm install package-name

# Run linting
npm run lint

# Build for production (test build)
npm run build

# Preview production build
npm run preview

# Check logs
tail -f server/logs/app.log  # if you add logging

# Database backup (optional)
pg_dump -h localhost -U postgres kesseh_galleries_dev > backup.sql

# Database restore (optional)
psql -h localhost -U postgres kesseh_galleries_dev < backup.sql
```

---

**You're now ready to develop Kesseh Galleries locally!** 🚀

The application will automatically handle database schema creation, so you can focus on building features. If you encounter any issues, refer to the troubleshooting section above.
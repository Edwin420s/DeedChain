# DeedChain API Documentation

## Base URL
https://api.deedchain.com/api


## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:

Authorization: Bearer <your_jwt_token>


## API Endpoints

### Authentication
- `POST /users/auth/wallet` - Authenticate with wallet address

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/stats` - Get user statistics
- `GET /users` - Get all users (Admin only)
- `PATCH /users/:userId/role` - Update user role (Admin only)

### Properties
- `POST /properties/register` - Register new property
- `GET /properties` - List properties with filtering
- `GET /properties/user` - Get user's properties
- `GET /properties/:id` - Get property details
- `PUT /properties/:id` - Update property
- `GET /properties/search` - Search properties

### Verifications
- `GET /verifications/pending` - Get pending verifications (Verifier/Admin)
- `POST /verifications/:propertyId/verify` - Verify property (Verifier/Admin)
- `GET /verifications/stats` - Get verifier statistics (Verifier/Admin)
- `GET /verifications/property/:propertyId` - Get verification history
- `GET /verifications` - Get all verifications (Admin only)

### Transfers
- `POST /transfers/initiate` - Initiate property transfer
- `POST /transfers/:transferId/complete` - Complete transfer
- `POST /transfers/:transferId/cancel` - Cancel transfer
- `GET /transfers/user` - Get user's transfers
- `GET /transfers/:transferId` - Get transfer details

### Admin
- `GET /admin/dashboard` - Admin dashboard statistics
- `GET /admin/health` - System health check
- `GET /admin/logs` - System logs

## Error Responses
All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Success Responses
All success responses follow this format:

```
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}

```

## Rate Limiting
API is rate limited to 100 requests per 15 minutes per IP address.

### Missing Deployment Files

### server/docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/deedchain
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=deedchain
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  ```

  ### server/.github/workflows/ci.yml 
```
  name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: deedchain_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma client
      run: npx prisma generate
    
    - name: Run migrations
      run: npx prisma migrate dev
      env:
        DATABASE_URL: postgresql://postgres:password@localhost:5432/deedchain_test
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:password@localhost:5432/deedchain_test
        JWT_SECRET: test-secret
        NODE_ENV: test
    
    - name: Run linting
      run: npm run lint
```


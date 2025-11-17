# Create .env Files

Since `.env` files are in `.gitignore`, you need to create them manually.

## Step 1: Create Root `.env` File

Create `lms-react-firebase/.env` with:

```env
VITE_API_URL=http://localhost:3001
VITE_USE_EMAIL_BACKEND=true
```

## Step 2: Create Backend `.env` File

Create `lms-react-firebase/backend/.env` with:

```env
GMAIL_USER=hoseaephraim50@gmail.com
GMAIL_APP_PASSWORD=ukgnevfdewwcjwwq
PORT=3001
NODE_ENV=production
```

## Quick Copy Commands

### Windows PowerShell:
```powershell
# Root .env
@"
VITE_API_URL=http://localhost:3001
VITE_USE_EMAIL_BACKEND=true
"@ | Out-File -FilePath .env -Encoding utf8

# Backend .env
@"
GMAIL_USER=hoseaephraim50@gmail.com
GMAIL_APP_PASSWORD=ukgnevfdewwcjwwq
PORT=3001
NODE_ENV=production
"@ | Out-File -FilePath backend\.env -Encoding utf8
```

### Linux/Mac:
```bash
# Root .env
{
echo "VITE_API_URL=http://localhost:3001"
echo "VITE_USE_EMAIL_BACKEND=true"
} > .env

# Backend .env
cat > backend/.env << EOF
GMAIL_USER=hoseaephraim50@gmail.com
GMAIL_APP_PASSWORD=ukgnevfdewwcjwwq
PORT=3001
NODE_ENV=production
EOF
```

## Verify Files Created

Check that files exist:
- `lms-react-firebase/.env`
- `lms-react-firebase/backend/.env`


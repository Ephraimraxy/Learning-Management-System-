# Firestore Security Rules

## Current Rules (Development)

The current `firestore.rules` file uses **permissive rules** that allow all read and write operations:

```javascript
match /{document=**} {
  allow read, write: if true;
}
```

⚠️ **WARNING**: These rules are **NOT SECURE** for production use. They allow anyone to read and write any data in your Firestore database.

## Production Rules

A secure production-ready ruleset is available in `firestore.rules.production`. This file includes:
- Role-based access control (admin, instructor, student)
- User data protection
- Proper read/write permissions for each collection
- Security best practices

## When to Use Each

### Development Rules (Current)
- ✅ Use during development and testing
- ✅ Quick setup, no permission issues
- ❌ **DO NOT** use in production

### Production Rules
- ✅ Use when deploying to production
- ✅ Secure and follows best practices
- ✅ Protects user data and enforces roles

## How to Switch

1. **For Development**: Keep using `firestore.rules` (current permissive rules)

2. **For Production**: 
   - Copy `firestore.rules.production` to `firestore.rules`
   - Deploy using: `firebase deploy --only firestore:rules`

## Deploying Rules

```bash
# Deploy current rules
firebase deploy --only firestore:rules

# Or use Firebase Console:
# 1. Go to Firebase Console
# 2. Firestore Database → Rules
# 3. Paste your rules
# 4. Click "Publish"
```

## Important Notes

- Always test your rules in the Firebase Console Rules Playground before deploying
- Monitor Firestore usage and adjust rules as needed
- Review rules regularly for security updates


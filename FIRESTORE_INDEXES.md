# Firestore Index Requirements

## Overview
Firestore requires composite indexes when you use multiple `where` clauses or combine `where` with `orderBy` on different fields. The app has been designed to handle missing indexes gracefully by falling back to in-memory filtering/sorting.

## Indexes That May Be Needed

### 1. Notifications Collection
**Query**: `where('userId', '==', userId) + where('read', '==', false) + orderBy('createdAt', 'desc')`
- **Status**: ✅ Handled with fallback (filters in memory if index missing)
- **Index URL**: Will be provided by Firebase if needed
- **Collection**: `notifications`
- **Fields**: `userId` (Ascending), `read` (Ascending), `createdAt` (Descending)

### 2. Courses Collection
**Query**: `where('published', '==', true) + orderBy('createdAt', 'desc')`
- **Status**: ✅ Handled with fallback (sorts in memory)
- **Collection**: `courses`
- **Fields**: `published` (Ascending), `createdAt` (Descending)

### 3. Quizzes Collection
**Query**: `where('courseId', '==', courseId) + orderBy('createdAt', 'desc')`
- **Status**: ⚠️ May need index if used frequently
- **Collection**: `quizzes`
- **Fields**: `courseId` (Ascending), `createdAt` (Descending)

### 4. Assignments Collection
**Query**: `where('courseId', '==', courseId) + orderBy('dueDate', 'desc')`
- **Status**: ⚠️ May need index if used frequently
- **Collection**: `assignments`
- **Fields**: `courseId` (Ascending), `dueDate` (Descending)

### 5. Evaluations Collection
**Query**: `where('userId', '==', userId) + orderBy('scheduledDate', 'asc')`
- **Status**: ⚠️ May need index if used frequently
- **Collection**: `evaluations`
- **Fields**: `userId` (Ascending), `scheduledDate` (Ascending)

### 6. Users Collection
**Query**: `orderBy('createdAt', 'desc')`
- **Status**: ✅ Single field orderBy - no index needed
- **Collection**: `users`

## How to Create Indexes

### Automatic (Recommended)
1. When you run a query that needs an index, Firebase will show an error with a link
2. Click the link to automatically create the index
3. Wait for the index to build (usually 1-5 minutes)

### Manual
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Select the collection
4. Add fields in the correct order
5. Set sort order (Ascending/Descending)
6. Click "Create"

## Current Status

✅ **All critical queries have fallback mechanisms** - The app will work without indexes by:
- Fetching all documents and filtering in memory
- Sorting in JavaScript instead of Firestore
- Gracefully handling missing indexes

⚠️ **Performance Note**: Without indexes, queries may be slower with large datasets. Consider creating indexes for frequently used queries in production.

## Testing Index Requirements

To test if indexes are needed:
1. Use the app normally
2. Check browser console for index error messages
3. If you see an error with a link, click it to create the index
4. The app will continue working with fallback until the index is created

## Production Recommendations

For production, create indexes for:
1. **Notifications** - Frequently queried for unread count
2. **Courses** - Main listing page
3. **Quizzes** - Course-specific quizzes
4. **Assignments** - Course-specific assignments

These can be created as needed when you see the error messages in production.


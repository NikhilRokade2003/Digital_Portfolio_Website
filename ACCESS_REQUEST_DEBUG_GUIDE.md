# Access Request Debugging Guide

## Issue: "Failed to send access request. Please try again." 

## Debugging Steps:

### 1. Check Browser Console
Open the browser developer tools (F12) and look at the Console tab for any errors when the access request fails.

### 2. Check Network Tab
In the developer tools Network tab:
- Look for the POST request to `/api/AccessRequest/portfolio/{id}`
- Check the status code (200, 400, 401, 500, etc.)
- Look at the Response body for error details

### 3. Check Backend Console
The backend now has detailed logging. Look for:
```
=== ACCESS REQUEST DEBUG ===
Portfolio ID: [number]
Current User ID: [number]
```

### 4. Common Issues and Solutions:

**401 Unauthorized:**
- User is not logged in
- Session has expired
- Cookie authentication not working

**400 Bad Request:**
- Portfolio is public (no access request needed)
- User already owns the portfolio
- User has already requested access

**404 Not Found:**
- Portfolio doesn't exist
- Portfolio ID is invalid

**500 Internal Server Error:**
- Database connection issue
- Email service configuration problem
- Missing required data

### 5. Quick Tests:

**Test Authentication:**
1. Go to developer tools Console
2. Run: `fetch('/api/Auth/check-session', {credentials: 'include'}).then(r=>r.json()).then(console.log)`

**Test Portfolio Access:**
1. Go to developer tools Console  
2. Run: `fetch('/api/Portfolio/1', {credentials: 'include'}).then(r=>r.json()).then(console.log)`

### 6. Manual Testing Steps:

1. **Ensure you're logged in** - Check user profile in navigation
2. **Find a private portfolio** - Look for portfolios with 🔒 lock icon
3. **Try requesting access** - Click "Request Access" button
4. **Check console logs** - Look for detailed debug output

### 7. Expected Flow:

1. User clicks "Request Access" on private portfolio
2. Frontend sends POST to `/api/AccessRequest/portfolio/{id}`
3. Backend validates authentication and portfolio
4. Creates AccessRequest record in database
5. Sends email notification to portfolio owner
6. Returns success response
7. Frontend shows success message

If any step fails, the detailed logging will show exactly where and why.
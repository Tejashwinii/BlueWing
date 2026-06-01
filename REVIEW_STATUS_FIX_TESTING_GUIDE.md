# Review Status Fix - Testing Guide

## Pre-Test Setup

1. Start both backend and frontend servers
2. Create test user accounts (if needed)
3. Book test flights for multiple users
4. Complete payments

## Manual Test Cases

### Test Case 1: Single User - Single Review Per Booking

**Steps:**
1. Login as User A
2. Navigate to "My Bookings" / "Payment History"
3. Find a completed flight booking
4. Click "View Ticket"
5. Scroll to ticket actions
6. Verify button shows: **✍️ Write Review** (GREEN)

**Expected Result:**
✅ GREEN "Write Review" button visible and clickable

**Steps Continued:**
7. Click "Write Review" button
8. Modal opens with form
9. Enter:
   - Rating: 5 stars
   - Your Name: "Test User"
   - Comment: "Excellent flight experience!"
10. Click "Submit Review"
11. Verify button shows: **⏳ Submitting...** (loading state)

**Expected Result:**
✅ Button shows loading state during submission

**Steps Continued:**
12. Wait for "Review submitted successfully!" alert
13. Verify button now shows: **✅ Review Submitted** (RED, disabled)
14. Attempt to click button

**Expected Result:**
✅ Button is RED and disabled - cannot click
✅ Button text: "✅ Review Submitted"

---

### Test Case 2: Page Refresh - Persistence

**Steps:**
1. After Test Case 1, with review submitted
2. Refresh the page (F5 or Cmd+R)
3. Wait for page to load
4. Scroll to same ticket

**Expected Result:**
✅ Button still shows: **✅ Review Submitted** (RED, disabled)
✅ No GREEN button reappears
✅ Shows persisted data from backend

---

### Test Case 3: Same User - Different Flight

**Steps:**
1. Still logged in as User A
2. Navigate to different booking
3. View that ticket
4. Scroll to ticket actions

**Expected Result:**
✅ Shows: **✍️ Write Review** (GREEN, clickable)
✅ Can submit review for this different flight
✅ This is independent from previous review

---

### Test Case 4: Different User - Same Flight

**Setup:**
- Ensure User A has submitted a review (from Test Case 1)

**Steps:**
1. Logout as User A
2. Login as User B
3. User B should have a booking for same flight as User A
4. Navigate to "My Bookings"
5. View that ticket
6. Scroll to ticket actions

**Expected Result:**
✅ Shows: **✍️ Write Review** (GREEN, clickable)
✅ User B can submit their own review independently
✅ User A's review doesn't affect User B

---

### Test Case 5: Multiple Bookings - Different Status

**Steps:**
1. Login as User C
2. Go to bookings/payment history page
3. Should see multiple bookings

**Expected Results:**
- ✅ Completed flights show: GREEN "Write Review" or RED "Review Submitted"
- ✅ Upcoming flights (future date): Button hidden or disabled
- ✅ Cancelled flights: Button hidden or disabled

---

### Test Case 6: Error Handling - Network Issue

**Steps:**
1. Login and view a ticket
2. Click "Write Review"
3. Open browser DevTools (F12)
4. Go to Network tab
5. Check "Offline" checkbox
6. Try to submit review
7. Submit form

**Expected Result:**
✅ Shows error: "Failed to submit review"
✅ Modal stays open
✅ Can retry when connection restored

---

### Test Case 7: Form Validation

**Steps:**
1. Open "Write Review" modal
2. Leave "Your Name" empty
3. Click "Submit Review"

**Expected Result:**
✅ Alert: "Please enter your name."
✅ Form doesn't submit
✅ Modal stays open

**Steps:**
4. Enter name: "John Doe"
5. Leave "Comment" field empty
6. Click "Submit Review"

**Expected Result:**
✅ Alert: "Please enter a comment."
✅ Form doesn't submit

**Steps:**
7. Enter comment
8. Click "Submit Review"

**Expected Result:**
✅ Form submits successfully

---

### Test Case 8: Button States During Submission

**Steps:**
1. Open "Write Review" modal
2. Fill form completely
3. Click "Submit Review"

**Expected Results:**
✅ "Submit Review" button shows: "⏳ Submitting..."
✅ "Cancel" button disabled (greyed out)
✅ Cannot click either button
✅ Form inputs disabled

**After submission:**
✅ Modal closes
✅ Main "Write Review" button changes to RED "Review Submitted"

---

## API Testing (Postman / Thunder Client)

### Test: Get Booking with Review Status

**Request:**
```
GET http://localhost:5000/api/bookings/:bookingId
Headers:
  Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "bookingReference": "BW...",
    "passengers": [...],
    "hasReviewed": false,
    "firstPassengerName": "John Doe",
    ...
  }
}
```

**Verify:**
✅ `hasReviewed` field exists
✅ Value is `true` or `false`
✅ `firstPassengerName` is populated

---

### Test: Submit Review

**Request:**
```
POST http://localhost:5000/api/reviews
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "bookingId": "booking123",
  "userName": "John Doe",
  "rating": 5,
  "comment": "Great experience!",
  "flightId": "flight123"
}
```

**Expected Response (First Time):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "...",
    "bookingId": "booking123",
    "userId": "user123",
    "userName": "John Doe",
    "rating": 5,
    "comment": "Great experience!",
    ...
  }
}
```

**Verify:**
✅ Status 201 Created
✅ `userId` is saved
✅ `bookingId` is saved

---

### Test: Duplicate Review Prevention

**Request:**
```
POST http://localhost:5000/api/reviews
(Same as above - second submission)
```

**Expected Response (Second Time):**
```json
{
  "success": false,
  "message": "You have already submitted a review for this booking."
}
```

**Verify:**
✅ Status 400 Bad Request
✅ Error message indicates duplicate
✅ Review not created twice

---

### Test: Get User Bookings with Review Status

**Request:**
```
GET http://localhost:5000/api/bookings/user/:userId
Headers:
  Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 10,
  "data": [
    {
      "_id": "booking1",
      "hasReviewed": true,
      ...
    },
    {
      "_id": "booking2",
      "hasReviewed": false,
      ...
    },
    {
      "_id": "booking3",
      "hasReviewed": true,
      ...
    }
  ]
}
```

**Verify:**
✅ Each booking has `hasReviewed` field
✅ Values vary (true/false)
✅ Matches UI rendering

---

## Edge Case Testing

### Edge Case 1: Simultaneous Review Submissions
**Simulate:** Two rapid clicks on "Submit Review"

**Expected:**
✅ First submission succeeds
✅ Second submission blocked (duplicate key error)
✅ UI shows one "Review Submitted" button

---

### Edge Case 2: Session Timeout
**Simulate:** Token expires during review submission

**Expected:**
✅ Request fails with 401 Unauthorized
✅ Error message displayed
✅ User prompted to login
✅ Can retry after login

---

### Edge Case 3: Booking Deleted After Review
**Simulate:** Review submitted, then booking cancelled

**Expected:**
✅ Old tickets show "Review Submitted"
✅ Cancelled booking also shows review history
✅ No new reviews can be submitted

---

### Edge Case 4: Very Long Comment
**Submit:** 5000+ character comment

**Expected:**
✅ Submits successfully
✅ Stored in database
✅ Displays properly in review list
✅ UI doesn't break

---

## UI/UX Testing

### Visual Test 1: Button Colors
- [ ] GREEN "Write Review" button: Clear, vibrant green (#43a047)
- [ ] RED "Review Submitted" button: Clear red (#ef5350)
- [ ] Colors distinct and accessible
- [ ] Colorblind mode friendly (consider icon + text)

### Visual Test 2: Responsive Design
- [ ] Desktop (1920px): Buttons properly sized
- [ ] Tablet (768px): Buttons stack/resize properly
- [ ] Mobile (375px): Buttons touch-friendly (>44px height)
- [ ] No overlapping elements

### Visual Test 3: Loading States
- [ ] "⏳ Submitting..." text visible
- [ ] Button cursor changes to "not-allowed"
- [ ] No visual glitches during loading

### Visual Test 4: Modal Display
- [ ] Modal centered on screen
- [ ] Background properly dimmed
- [ ] Modal doesn't overflow on mobile
- [ ] X or Cancel button easily accessible
- [ ] All form fields visible without scrolling (mobile)

---

## Performance Testing

### Performance Test 1: Page Load
**Test:** Load page with booking that has review

**Expected:**
✅ Page loads in < 3 seconds
✅ API call completes quickly
✅ Button state correct on first render
✅ No layout shift when button renders

---

### Performance Test 2: Multiple Bookings
**Test:** Page with 20+ bookings with mixed review statuses

**Expected:**
✅ All `hasReviewed` flags fetch quickly
✅ Page remains responsive
✅ Scrolling smooth
✅ No performance degradation

---

## Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Expected:**
✅ Same behavior on all browsers
✅ Styles render correctly
✅ No console errors

---

## Accessibility Testing

- [ ] Keyboard navigation: Can tab to all buttons
- [ ] Screen readers: Button text read correctly
- [ ] ARIA labels: Proper semantics
- [ ] Color contrast: Meets WCAG AA standards
- [ ] Focus indicators: Visible when using keyboard

---

## Success Criteria

All items must be ✅ for release:

- [ ] Single review per user per booking enforced
- [ ] UI shows correct button based on review status
- [ ] No page refresh needed after review submission
- [ ] State persists on page reload
- [ ] Different users see independent buttons
- [ ] Different flights show independent buttons
- [ ] All edge cases handled gracefully
- [ ] No console errors
- [ ] API returns correct `hasReviewed` flag
- [ ] Duplicate reviews rejected at DB level
- [ ] Loading states display properly
- [ ] Error messages clear and helpful

---

## Rollback Plan

If issues found:

1. Revert changes to:
   - `controllers/bookingController.js`
   - `controllers/reviewController.js`
   - `components/TicketCard.jsx`
   - `pages/TicketSummary.jsx`
   - `styles/TicketCard.css`

2. Restart backend and frontend
3. Verify old button behavior returns

---

## Sign-Off

- [ ] QA Team: All tests passed
- [ ] Product Owner: Approved
- [ ] Backend Team: Code reviewed
- [ ] Frontend Team: Code reviewed
- [ ] Ready for production

**Date:** ___________
**Tester:** ___________
**Sign-off:** ___________

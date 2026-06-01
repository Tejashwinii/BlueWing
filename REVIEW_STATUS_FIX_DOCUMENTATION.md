# Review Status Logic Fix - Implementation Documentation

## Overview
Fixed the review status logic in the flight booking application so that the "Write Review" button behaves correctly per user and per flight. Users can now submit only ONE review per booking, and the UI correctly reflects the review status.

## Problem Summary
- Users could submit multiple reviews for the same flight/booking
- The "Write Review" button remained visible even after a review was submitted
- No persistent review status tracking

## Solution Implemented

### 1. Backend Changes

#### A. Model Updates (models/Review.js)
✅ Already had proper structure:
- `userId`: ObjectId reference to User
- `bookingId`: ObjectId reference to Booking
- `userName`: String for backward compatibility
- Unique compound index on `userName + bookingId`

#### B. Updated Controllers

**File: `controllers/bookingController.js`**

1. **Import Added**: Added `Review` model import
   ```javascript
   import Review from '../models/Review.js';
   ```

2. **getBookingById() - Enhanced**
   - Added review status check
   - Returns `hasReviewed: boolean` flag
   - Returns `firstPassengerName` for display
   - Query: `Review.findOne({ bookingId, userId })`
   
   **Response Example:**
   ```json
   {
     "success": true,
     "data": {
       "_id": "booking123",
       "bookingReference": "BW1234",
       "passengers": [...],
       "hasReviewed": false,
       "firstPassengerName": "John Doe"
     }
   }
   ```

3. **getUserBookings() - Enhanced**
   - Added async Promise.all to check review status for each booking
   - Each booking now includes `hasReviewed` flag
   - Maintains pagination and filtering

**File: `controllers/reviewController.js`**

1. **createReview() - Improved**
   - Now stores `userId` when creating booking reviews
   - Checks for existing review using both `userId` and `userName`
   - Prevents duplicate reviews with more robust error handling
   - Query: `Review.findOne({ bookingId, $or: [{ userId }, { userName }] })`

2. **checkReviewExists() - Updated**
   - Now uses authenticated `userId` from request
   - Removed query parameter requirement
   - Simplified logic for backend-to-frontend communication
   - **Route:** `GET /api/reviews/check/:bookingId` (Protected)

#### C. API Response Structure

**getBookingById Response:**
```javascript
{
  success: true,
  data: {
    ...booking,
    hasReviewed: true|false,  // NEW: Review status
    firstPassengerName: "John Doe"  // NEW: For UI
  }
}
```

**getUserBookings Response:**
```javascript
{
  success: true,
  count: 5,
  total: 5,
  data: [
    {
      ...booking,
      hasReviewed: true|false  // NEW: Added to each booking
    },
    ...
  ]
}
```

### 2. Frontend Changes

#### A. TicketCard Component (components/TicketCard.jsx)

**Props Updated:**
```javascript
const TicketCard = ({ 
  passenger, 
  journey, 
  selectedFare, 
  contactDetails, 
  bookingReference, 
  bookingId, 
  onCancelled, 
  hasReviewed: initialHasReviewed = false  // NEW PROP
})
```

**State Changes:**
- Replaced `reviewSubmitted` with `hasReviewed`
- Added `isSubmittingReview` for loading state
- State now syncs with backend data immediately

```javascript
const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
const [isSubmittingReview, setIsSubmittingReview] = useState(false);
```

**handleSubmitReview() - Updated**
```javascript
const handleSubmitReview = async () => {
  // ... validation ...
  setIsSubmittingReview(true);
  try {
    const response = await reviewAPI.create(payload);
    if (response.success) {
      setHasReviewed(true);  // Immediately update state
      setShowReviewModal(false);
      // ... reset form ...
      alert('Review submitted successfully!');
    }
  } catch (error) {
    alert(error.message || 'Failed to submit review.');
  } finally {
    setIsSubmittingReview(false);
  }
};
```

**Button Rendering Logic - Updated**
```jsx
{/* Write Review Button - GREEN */}
{!isCancelled && canReview && !hasReviewed && (
  <button 
    className="btn btn-review btn-review-write" 
    onClick={() => setShowReviewModal(true)}
    disabled={isSubmittingReview}
  >
    ✍️ Write Review
  </button>
)}

{/* Review Submitted Button - RED */}
{!isCancelled && hasReviewed && (
  <button 
    className="btn btn-review btn-review-submitted" 
    disabled
  >
    ✅ Review Submitted
  </button>
)}
```

**Submit Button - Updated with Loading State**
```jsx
<button 
  className="btn btn-submit-review" 
  onClick={handleSubmitReview}
  disabled={isSubmittingReview}
>
  {isSubmittingReview ? '⏳ Submitting...' : 'Submit Review'}
</button>
```

#### B. TicketSummary Page (pages/TicketSummary.jsx)

**Updated TicketCard Component Call:**
```jsx
<TicketCard
  key={index}
  passenger={passenger}
  journey={flightDetails}
  selectedFare={...}
  contactDetails={displayContactDetails}
  bookingReference={displayBookingReference}
  bookingId={bookingId || backendBooking?._id}
  onCancelled={handleTicketCancelled}
  hasReviewed={backendBooking?.hasReviewed || false}  // NEW: Pass from backend
/>
```

#### C. Styling Updates (styles/TicketCard.css)

**Write Review Button - GREEN**
```css
.btn-review.btn-review-write {
  background: linear-gradient(135deg, #43a047 0%, #388e3c 100%);
  color: white;
}

.btn-review.btn-review-write:hover {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  box-shadow: 0 6px 16px rgba(67, 160, 71, 0.3);
  transform: translateY(-2px);
}
```

**Review Submitted Button - RED**
```css
.btn-review.btn-review-submitted {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.2);
}

.btn-review.btn-review-submitted:hover {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  transform: none;
}
```

**Disabled State Handling**
```css
.btn-cancel-review:disabled,
.btn-submit-review:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
```

## Flow Diagram

```
User Views Booking
       ↓
TicketSummary loads booking details via API
       ↓
Backend returns: { ...booking, hasReviewed: true|false }
       ↓
TicketCard receives hasReviewed prop
       ↓
IF hasReviewed === false → Show GREEN "Write Review" button
IF hasReviewed === true → Show RED "Review Submitted" button
       ↓
User clicks "Write Review" → Modal opens
       ↓
User submits review → API call with bookingId & userId
       ↓
Backend verifies no duplicate review exists
       ↓
Review saved → Response success
       ↓
Frontend: setHasReviewed(true) → Button changes to RED immediately
       ↓
No page refresh needed ✅
```

## Behavior Per Scenario

### Scenario 1: User A Reviews Flight X
1. User A views booking for Flight X
2. API returns: `hasReviewed: false`
3. GREEN "Write Review" button appears ✅
4. User A clicks and submits review
5. Frontend state updates: `hasReviewed: true`
6. Button changes to RED "Review Submitted" ✅
7. User refreshes page → Still shows RED button ✅

### Scenario 2: User A Opens Same Flight Again
1. User A navigates away and back to booking
2. API returns: `hasReviewed: true` (from DB check)
3. RED "Review Submitted" button appears immediately ✅
4. User cannot submit another review ✅

### Scenario 3: User B Opens Same Flight
1. User B views the same Flight X booking
2. API returns: `hasReviewed: false` (no review by User B)
3. GREEN "Write Review" button appears ✅
4. User B can submit their own review ✅

### Scenario 4: User A Reviews Different Flight
1. User A books Flight Y (different from X)
2. After travel, views ticket for Flight Y
3. API returns: `hasReviewed: false` (no review for this booking)
4. GREEN "Write Review" button appears ✅
5. User A can review Flight Y even though they reviewed Flight X ✅

## Key Improvements

✅ **Per-User Review Tracking**: Uses `userId` to track reviews
✅ **Per-Booking Enforcement**: Uses `bookingId` to prevent duplicates
✅ **Immediate UI Update**: No page refresh needed after review submission
✅ **Persistent State**: Backend confirms status on page reload
✅ **Better UX**: Clear visual distinction (GREEN write, RED submitted)
✅ **Error Handling**: Prevents duplicate reviews at database level (unique index)
✅ **Backward Compatibility**: Still supports `userName` for legacy reviews
✅ **Loading States**: Shows "⏳ Submitting..." while processing

## Database Queries Added

### Check if user reviewed booking
```javascript
const existingReview = await Review.findOne({ 
  bookingId: ObjectId,
  userId: ObjectId
});
```

### Get booking with review status
```javascript
const review = await Review.findOne({ 
  bookingId: ObjectId,
  userId: ObjectId
});
const hasReviewed = !!review;
```

## Edge Cases Handled

1. **Simultaneous Reviews**: Database unique index prevents duplicates
2. **API Failures**: Frontend uses `initialHasReviewed` as fallback
3. **Session Timeout**: Page reload syncs state with backend
4. **Multiple Bookings**: Each booking tracked independently
5. **Different Users**: Reviews isolated by userId

## Testing Checklist

- [ ] User A reviews Flight X → "Review Submitted" appears
- [ ] User A refreshes → Still shows "Review Submitted"
- [ ] User B opens same Flight X → Shows "Write Review"
- [ ] User A opens Flight Y → Shows "Write Review"
- [ ] Submit buttons show loading state "⏳ Submitting..."
- [ ] Cancel button disabled during submission
- [ ] Network error doesn't break UI
- [ ] Multiple reviews per same user rejected

## Files Modified

1. **Backend**
   - `bluewing-backend/controllers/bookingController.js`
   - `bluewing-backend/controllers/reviewController.js`

2. **Frontend**
   - `frontend/src/components/TicketCard.jsx`
   - `frontend/src/pages/TicketSummary.jsx`
   - `frontend/src/styles/TicketCard.css`

## Deployment Notes

- No database migrations needed
- Existing reviews will work (both `userId` and `userName` supported)
- Backward compatible with existing API clients
- No breaking changes to API contracts

## Future Enhancements

- Add review edit/delete functionality
- Show previous reviews in detail view
- Add helpful error messages for edge cases
- Implement review moderation queue
- Add review rating aggregation (average stars)

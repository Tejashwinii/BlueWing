/**
 * Fare Type Configuration
 *
 * Purpose:
 * Defines the fare products sold by BlueWing and the pricing/refund rules
 * used when a passenger creates, confirms, or cancels a booking.
 *
 * Workflow:
 * Passenger Details -> Booking Controller -> Fare Type Helpers -> Booking/Payment documents
 *
 * Used By:
 * controllers/bookingController.js
 * controllers/otpController.js
 *
 * Dependencies:
 * None. This file is intentionally pure configuration and calculation helpers.
 *
 * Request Lifecycle:
 * Executed when Node loads the config module, then helper functions are called
 * during booking creation and cancellation/refund flows.
 */
export const FARE_TYPES = {
	SAVER: {
		type: 'Saver',
		priceMultiplier: 1.0,
		cancellation: true,
		meals: false,
		priorityBoarding: false,
		baggage: '15kg',
		refundPercentage: 0,
	},
	FLEXI_PLUS: {
		type: 'Flexi Plus',
		priceMultiplier: 1.05,
		cancellation: true,
		meals: true,
		priorityBoarding: false,
		baggage: '20kg',
		refundPercentage: 50,
	},
	BLUEWING_UPFRONT: {
		type: 'BlueWing Upfront',
		priceMultiplier: 1.1,
		cancellation: true,
		meals: true,
		priorityBoarding: true,
		baggage: '25kg',
		refundPercentage: 75,
	},
};

export const FARE_TYPES_ARRAY = Object.values(FARE_TYPES);

/**
 * Find a fare type definition by display name.
 *
 * Workflow:
 * Booking form fare selection -> Controller validation -> Fare config lookup
 *
 * Inputs:
 * - fareTypeName: User-facing fare type name, such as "Saver" or "Flexi Plus".
 *
 * Returns:
 * Matching fare type object, or undefined when the name is unknown.
 *
 * Collections:
 * - None. This is an in-memory config lookup.
 *
 * Why:
 * Keeps fare-name matching consistent across pricing and refund workflows.
 */
export const getFareType = (fareTypeName) => {
	return FARE_TYPES_ARRAY.find(
		(ft) => ft.type.toLowerCase() === String(fareTypeName || '').toLowerCase()
	);
};

/**
 * Calculate the payable booking amount for a fare type.
 *
 * Workflow:
 * Seat Selection -> Booking Controller -> Pricing helper -> Booking.pricing and Payment.amount
 *
 * Inputs:
 * - baseFare: Cabin-specific fare from the selected Flight document.
 * - fareTypeName: Fare product selected by the user.
 * - numPassengers: Number of passengers/seats being booked.
 *
 * Returns:
 * Pricing breakdown containing base fare, per-seat fare, subtotal, taxes, and total.
 *
 * Collections:
 * - None directly. The returned values are persisted in bookings and payments.
 *
 * Why:
 * Centralizes fare multipliers and tax calculation so booking totals stay consistent.
 */
export const calculatePrice = (baseFare, fareTypeName, numPassengers = 1) => {
	const fareType = getFareType(fareTypeName);

	if (!fareType) {
		throw new Error(`Invalid fare type: ${fareTypeName}`);
	}

	const pricePerSeat = baseFare * fareType.priceMultiplier;
	const subtotal = pricePerSeat * numPassengers;
	const taxes = Math.round(subtotal * 0.05);
	const totalAmount = Math.round(subtotal + taxes);

	return {
		baseFare,
		pricePerSeat,
		subtotal,
		taxes,
		totalAmount,
	};
};

/**
 * Calculate the refundable amount for a paid booking.
 *
 * Workflow:
 * Cancel Booking -> Fare Type Helpers -> Payment refund fields -> Booking cancellation details
 *
 * Inputs:
 * - paidAmount: Amount originally charged for the booking.
 * - fareTypeName: Fare product stored on the booking.
 *
 * Returns:
 * Rounded refund amount based on the fare's refund percentage.
 *
 * Collections:
 * - None directly. The result updates Payment and Booking documents.
 *
 * Why:
 * Encapsulates refund policy in one place for direct cancellation and OTP cancellation flows.
 */
export const calculateRefund = (paidAmount, fareTypeName) => {
	const fareType = getFareType(fareTypeName);
	if (!fareType) {
		throw new Error(`Invalid fare type: ${fareTypeName}`);
	}
	return Math.round(paidAmount * (fareType.refundPercentage / 100));
};

/**
 * Determine whether a fare can be cancelled.
 *
 * Workflow:
 * Cancel Booking / Verify Cancellation OTP -> Fare policy check -> Seat release/refund
 *
 * Inputs:
 * - fareTypeName: Fare product stored on the booking.
 *
 * Returns:
 * Boolean indicating whether cancellation is allowed.
 *
 * Collections:
 * - None. This is an in-memory policy check.
 *
 * Why:
 * Prevents cancellation workflows from duplicating fare-policy decisions.
 */
export const canCancelBooking = (fareTypeName) => {
	const fareType = getFareType(fareTypeName);
	return fareType ? fareType.cancellation : false;
};

export default FARE_TYPES;

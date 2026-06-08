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

export const getFareType = (fareTypeName) => {
	return FARE_TYPES_ARRAY.find(
		(ft) => ft.type.toLowerCase() === String(fareTypeName || '').toLowerCase()
	);
};

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

export const calculateRefund = (paidAmount, fareTypeName) => {
	const fareType = getFareType(fareTypeName);
	if (!fareType) {
		throw new Error(`Invalid fare type: ${fareTypeName}`);
	}
	return Math.round(paidAmount * (fareType.refundPercentage / 100));
};

export const canCancelBooking = (fareTypeName) => {
	const fareType = getFareType(fareTypeName);
	return fareType ? fareType.cancellation : false;
};

export default FARE_TYPES;

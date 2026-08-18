// Flat pricing for the Exclusive E-Rhythm tour form: one price per booking,
// based on the visitor's detected location, with optional discount codes.
export const EXCLUSIVE_TOUR_PRICE_NGN = 5000
export const EXCLUSIVE_TOUR_PRICE_USD = 10
export const EXCLUSIVE_TOUR_DISCOUNT_RATE = 0.2
export const EXCLUSIVE_TOUR_DISCOUNT_CODES = ["ruthina", "sterlingg"]

export function isValidExclusiveTourDiscountCode(discountCode?: string | null) {
  if (!discountCode) return false
  return EXCLUSIVE_TOUR_DISCOUNT_CODES.includes(discountCode.trim().toLowerCase())
}

export function getExclusiveTourPrice(isNigeria: boolean, discountCode?: string | null) {
  const currency = isNigeria ? "NGN" : "USD"
  const basePrice = isNigeria ? EXCLUSIVE_TOUR_PRICE_NGN : EXCLUSIVE_TOUR_PRICE_USD
  const discountApplied = isValidExclusiveTourDiscountCode(discountCode)
  const price = discountApplied ? Number((basePrice * (1 - EXCLUSIVE_TOUR_DISCOUNT_RATE)).toFixed(2)) : basePrice

  return { currency, basePrice, price, discountApplied }
}

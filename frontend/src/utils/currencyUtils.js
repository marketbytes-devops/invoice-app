/**
 * Currency conversion utilities for converting foreign currencies to INR
 */

// Cache exchange rates to avoid repeated API calls
let exchangeRatesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch exchange rates from API (rates are relative to USD)
 * @returns {Promise<Object>} Exchange rates object
 */
export const fetchExchangeRates = async () => {
  // Check if cache is still valid
  if (exchangeRatesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return exchangeRatesCache;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (response.ok) {
      const data = await response.json();
      if (data.result === "success" && data.rates) {
        exchangeRatesCache = data.rates;
        cacheTimestamp = Date.now();
        return data.rates;
      }
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
  }

  // Fallback rates if API fails
  return {
    USD: 1,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.79,
    QAR: 3.64,
    AED: 3.67,
    SAR: 3.75,
    KWD: 0.31,
    BHD: 0.38,
    OMR: 0.38,
    JPY: 151.5,
    AUD: 1.52,
    CAD: 1.36,
    SGD: 1.35,
    CHF: 0.91,
    CNY: 7.24,
    HKD: 7.83,
    NZD: 1.67,
    ZAR: 18.9,
    THB: 36.5,
    MYR: 4.75,
    PKR: 278.5,
    BDT: 109.5,
    LKR: 303.5,
    NPR: 133.5,
    KRW: 1350,
    PHP: 56.5,
    VND: 24800,
    IDR: 15800,
    RUB: 92.5,
    BRL: 5.05,
    MXN: 16.7,
    TRY: 32.1,
    EGP: 47.5,
    NGN: 1250,
    KES: 132.5,
    GHS: 14.8,
    TZS: 2580,
    UGX: 3800,
    XOF: 605,
    XAF: 605,
  };
};

/**
 * Convert amount from any currency to INR
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'USD', 'QAR', 'EUR')
 * @param {Object} rates - Exchange rates object (optional, will fetch if not provided)
 * @returns {number} - Converted amount in INR
 */
export const convertToINR = (amount, fromCurrency, rates = null) => {
  if (!amount || isNaN(amount)) return 0;
  if (!fromCurrency || fromCurrency === 'INR') return parseFloat(amount);

  const amountNum = parseFloat(amount);
  if (!rates) {
    // If rates not provided, return amount as-is (will be converted async)
    return amountNum;
  }

  // Rates are relative to USD, so: amount * (INR rate / fromCurrency rate)
  const usdToINR = rates.INR || 83.5;
  const usdToFromCurrency = rates[fromCurrency];

  if (!usdToFromCurrency) {
    console.warn(`Exchange rate not found for ${fromCurrency}, using amount as-is`);
    return amountNum;
  }

  // Convert: fromCurrency -> USD -> INR
  const amountInUSD = amountNum / usdToFromCurrency;
  const amountInINR = amountInUSD * usdToINR;

  return Math.round(amountInINR * 100) / 100; // Round to 2 decimal places
};

/**
 * Format amount as INR currency string
 * @param {number} amount - Amount in INR
 * @returns {string} - Formatted string with ₹ symbol
 */
export const formatINR = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';

  const amountNum = parseFloat(amount);

  // Format with Indian number system (lakhs, crores)
  if (amountNum >= 10000000) {
    return `₹${(amountNum / 10000000).toFixed(2)} Cr`;
  } else if (amountNum >= 100000) {
    return `₹${(amountNum / 100000).toFixed(2)} L`;
  } else {
    return `₹${amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Format amount with full INR formatting (no abbreviations)
 * @param {number} amount - Amount in INR
 * @returns {string} - Formatted string with ₹ symbol
 */
export const formatINRFull = (amount) => {
  if (!amount || isNaN(amount)) return '₹0.00';
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

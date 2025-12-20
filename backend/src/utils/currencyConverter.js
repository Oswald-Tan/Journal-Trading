// Fixed exchange rates for fair comparison (can be updated manually)
const EXCHANGE_RATES = {
  USD: 1,
  IDR: 0.000065, // Approx: 1 IDR = 0.000065 USD
  CENT: 0.01, // 1 CENT = 0.01 USD
  EUR: 1.08, // Example: 1 EUR = 1.08 USD
  GBP: 1.26, // Example: 1 GBP = 1.26 USD
  JPY: 0.0067, // Example: 1 JPY = 0.0067 USD
};

/**
 * Convert amount from any currency to USD
 * @param {number} amount - Amount in original currency
 * @param {string} fromCurrency - Original currency code
 * @returns {number} Amount in USD
 */
export const convertToUSD = (amount, fromCurrency) => {
  const rate = EXCHANGE_RATES[fromCurrency?.toUpperCase()] || 1;
  return parseFloat((amount * rate).toFixed(2));
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency) => {
  const currencyUpper = currency?.toUpperCase();
  switch (currencyUpper) {
    case "USD":
      return "$";
    case "IDR":
      return "Rp";
    case "CENT":
      return "¢";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    default:
      return "$";
  }
};

/**
 * Format currency with proper formatting
 */
export const formatCurrency = (amount, currency = "USD", convertToUSD = false) => {
  const symbol = getCurrencySymbol(currency);
  let amountNum = typeof amount === "string" ? parseFloat(amount) : amount || 0;
  
  // Convert to USD if requested
  if (convertToUSD && currency !== "USD") {
    amountNum = convertToUSD(amountNum, currency);
  }
  
  switch (currency?.toUpperCase()) {
    case "IDR":
      return `${symbol} ${amountNum.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    case "CENT":
      return `${symbol}${amountNum.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    case "JPY":
      return `${symbol}${amountNum.toLocaleString("ja-JP", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    default:
      return `${symbol}${amountNum.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
  }
};

/**
 * Get disclaimer text for leaderboard
 */
export const getLeaderboardDisclaimer = () => {
  return "Note: All profit amounts are converted to USD for fair comparison. Leaderboard results are based on real user account data. Some users connect cent accounts, which can make results look larger than they are in practice. Rankings are for fun and community engagement only, and are not financial advice or indicative of results other users may achieve.";
};
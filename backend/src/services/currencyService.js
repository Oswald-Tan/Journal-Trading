// services/currencyService.js - VERSI DIPERBAIKI DENGAN FIXED IMPORT
import axios from "axios";
import NodeCache from "node-cache";
import {
  updateExchangeRateFromAPI,
  getLatestExchangeRate,
} from "../models/gamification.js";

// Cache untuk menyimpan rate selama 5 menit (300 detik)
const currencyCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class CurrencyService {
  constructor() {
    this.apiKey = process.env.CURRENCY_API_KEY;
    this.baseUrl = "https://api.currencyapi.com/v3";
    this.timeout = 5000;

    // Validasi API key
    if (!this.apiKey) {
      console.warn("⚠️  CURRENCY_API_KEY not set or using default value");
    }

    console.log("[CurrencyService] API Key Status:", {
      hasKey: !!this.apiKey,
      keyLength: this.apiKey?.length,
      keyPrefix: this.apiKey?.substring(0, 10), // Hanya log sedikit prefix untuk keamanan
    });
  }

  /**
   * Mendapatkan rate dari API CurrencyAPI.com
   * NOTE: CurrencyAPI.com format: base_currency=USD, currencies=IDR mengembalikan 1 USD = X IDR
   */
  async getRateFromAPI(fromCurrency) {
    const currencyCode = fromCurrency.toUpperCase();

    // Handle special cases
    if (currencyCode === "USD") return 1.0;
    if (currencyCode === "CENT") return 0.01;

    try {
      console.log(
        `[CurrencyService] Fetching rate for ${currencyCode} from API...`
      );

      const response = await axios.get(`${this.baseUrl}/latest`, {
        params: {
          apikey: this.apiKey,
          base_currency: "USD", // Base selalu USD
          currencies: currencyCode,
        },
        timeout: this.timeout,
        headers: {
          "User-Agent": "PipsDiary/1.0",
        },
      });

      // Validasi response
      if (!response.data?.data?.[currencyCode]?.value) {
        console.error("Invalid API response:", response.data);
        throw new Error(`No rate data for ${currencyCode} in API response`);
      }

      // API mengembalikan: 1 USD = X [currency]
      const usdToCurrencyRate = response.data.data[currencyCode].value;

      // Kita perlu: 1 [currency] = ? USD
      // Jadi: 1 / usdToCurrencyRate
      const currencyToUsdRate = 1 / usdToCurrencyRate;

      console.log(
        `[CurrencyService] API Rate: 1 USD = ${usdToCurrencyRate} ${currencyCode}`
      );
      console.log(
        `[CurrencyService] Calculated: 1 ${currencyCode} = ${currencyToUsdRate} USD`
      );

      return currencyToUsdRate;
    } catch (error) {
      console.error(`[CurrencyService] API Error for ${currencyCode}:`, {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });

      // Berikan error yang lebih spesifik
      if (error.response?.status === 401) {
        throw new Error("Invalid API key");
      } else if (error.response?.status === 429) {
        throw new Error("API rate limit exceeded");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("API timeout");
      } else if (!error.response) {
        throw new Error("Network error or API unavailable");
      }

      throw error;
    }
  }

  /**
   * Mendapatkan rate ke USD dengan cache dan fallback
   */
  async getRateToUSD(fromCurrency) {
    const currencyCode = fromCurrency.toUpperCase();

    // Special cases
    if (currencyCode === "USD") return 1.0;
    if (currencyCode === "CENT") return 0.01;

    // Cache key
    const cacheKey = `${currencyCode}_USD`;

    // Cek cache
    const cachedRate = currencyCache.get(cacheKey);
    if (cachedRate !== undefined) {
      console.log(
        `[CurrencyService] Cache HIT for ${currencyCode}: ${cachedRate}`
      );
      return cachedRate;
    }

    console.log(
      `[CurrencyService] Cache MISS for ${currencyCode}, fetching...`
    );

    try {
      console.log(
        `[CurrencyService] Step 1: Trying API for ${currencyCode}...`
      );
      const apiRate = await this.getRateFromAPI(currencyCode);

      // Step 1.5: Cek apakah rate sama dengan yang aktif di database
      const currentActiveRate = await getLatestExchangeRate(
        currencyCode,
        "USD"
      );

      if (currentActiveRate) {
        const currentRate = parseFloat(currentActiveRate.rate);
        const difference = Math.abs((apiRate - currentRate) / currentRate);

        // Jika perbedaan < 0.1%, skip update database
        if (difference < 0.001) {
          console.log(
            `[CurrencyService] Rate change negligible (${difference.toFixed(
              4
            )}%), skipping DB update`
          );

          // Update timestamp tanpa buat record baru
          await ExchangeRate.update(
            { lastUpdated: new Date() },
            {
              where: {
                id: currentActiveRate.id,
              },
            }
          );

          currencyCache.set(cacheKey, apiRate);
          return apiRate;
        }
      }

      // Simpan ke cache
      currencyCache.set(cacheKey, apiRate);

      // Simpan ke database HANYA jika rate berubah signifikan
      console.log(
        `[CurrencyService] Step 2: Saving to database (significant change)...`
      );
      await updateExchangeRateFromAPI(currencyCode, "USD", apiRate);

      return apiRate;
    } catch (apiError) {
      console.warn(
        `[CurrencyService] API failed for ${currencyCode}: ${apiError.message}`
      );

      // 2. Fallback ke database
      try {
        console.log(`[CurrencyService] Step 3: Trying database fallback...`);
        const dbRate = await getLatestExchangeRate(currencyCode, "USD");

        if (dbRate) {
          const rateValue = parseFloat(dbRate.rate);
          console.log(
            `[CurrencyService] Using DB rate for ${currencyCode}: ${rateValue}`
          );

          // Cache dengan TTL pendek (1 menit) karena rate dari DB mungkin outdated
          currencyCache.set(cacheKey, rateValue, 60);

          return rateValue;
        } else {
          console.warn(
            `[CurrencyService] No rate in database for ${currencyCode}`
          );
        }
      } catch (dbError) {
        console.error(`[CurrencyService] Database error:`, dbError);
      }

      // 3. Fallback ke default rate berdasarkan currency
      console.log(`[CurrencyService] Step 4: Using default rate...`);
      const defaultRate = this.getDefaultRate(currencyCode);

      // Cache dengan TTL sangat pendek (30 detik)
      currencyCache.set(cacheKey, defaultRate, 30);

      return defaultRate;
    }
  }

  /**
   * Konversi jumlah ke USD
   */
  async convertToUSD(amount, fromCurrency, debug = false) {
    try {
      // Validasi input
      if (amount == null || isNaN(parseFloat(amount))) {
        console.warn(`[CurrencyService] Invalid amount: ${amount}`);
        return 0;
      }

      const amountNum = parseFloat(amount);
      const currencyCode = (fromCurrency || "USD").toUpperCase();

      // Jika USD, tidak perlu konversi
      if (currencyCode === "USD") {
        return parseFloat(amountNum.toFixed(4));
      }

      // Debug info
      if (debug) {
        console.log(`=== DEBUG CONVERSION ===`);
        console.log(`Amount: ${amountNum} ${currencyCode}`);
      }

      // Dapatkan rate
      const rate = await this.getRateToUSD(currencyCode);
      const result = amountNum * rate;
      const formattedResult = parseFloat(result.toFixed(4));

      if (debug) {
        console.log(`Rate used: 1 ${currencyCode} = ${rate} USD`);
        console.log(`Result: ${amountNum} × ${rate} = ${formattedResult} USD`);
        console.log(`=== END DEBUG ===`);
      } else {
        console.log(
          `[CurrencyService] Converted: ${amountNum} ${currencyCode} = ${formattedResult} USD`
        );
      }

      return formattedResult;
    } catch (error) {
      console.error(`[CurrencyService] Conversion error:`, error);

      // Emergency fallback
      const emergencyRates = {
        IDR: 0.00005986,
        EUR: 1.08,
        GBP: 1.27,
        JPY: 0.0064,
      };

      const currencyCode = (fromCurrency || "USD").toUpperCase();
      const emergencyRate = emergencyRates[currencyCode] || 1.0;
      const result = parseFloat(amount) * emergencyRate;

      console.warn(
        `[CurrencyService] EMERGENCY FALLBACK: Using rate ${emergencyRate} for ${currencyCode}`
      );

      return parseFloat(result.toFixed(4));
    }
  }

  /**
   * Default rates (jika semua gagal)
   */
  getDefaultRate(currency) {
    const currencyCode = currency.toUpperCase();

    const defaultRates = {
      IDR: 0.00005986, // 1/16704.80
      EUR: 1.08,
      GBP: 1.27,
      JPY: 0.0064,
      SGD: 0.74,
      AUD: 0.66,
      CAD: 0.73,
      CHF: 1.12,
      CNY: 0.14,
      INR: 0.012,
      MYR: 0.21,
      THB: 0.028,
      VND: 0.000042,
      PHP: 0.018,
      KRW: 0.00075,
    };

    const rate = defaultRates[currencyCode] || 1.0;
    console.warn(`[CurrencyService] DEFAULT RATE for ${currencyCode}: ${rate}`);

    return rate;
  }

  /**
   * Test fungsi untuk debugging
   */
  async testConversion(amount = 32000, currency = "IDR") {
    try {
      console.log(`\n=== TEST CONVERSION ===`);
      console.log(`Testing: ${amount} ${currency} to USD`);

      // 1. Langsung dari API
      const directApiRate = await this.getRateFromAPI(currency);
      const directResult = amount * directApiRate;

      // 2. Via service (dengan cache & fallback)
      const serviceResult = await this.convertToUSD(amount, currency, true);

      // 3. Cek database
      const dbRate = await getLatestExchangeRate(currency, "USD");

      return {
        test: {
          amount: amount,
          currency: currency,
          expected: `${amount} ${currency} ≈ $${(amount * 0.00005986).toFixed(
            4
          )} (1 IDR = 1/16704.80 USD)`,
        },
        api: {
          rate: directApiRate,
          result: `$${directResult.toFixed(4)}`,
        },
        service: {
          result: `$${serviceResult.toFixed(4)}`,
        },
        database: dbRate
          ? {
              rate: parseFloat(dbRate.rate),
              source: dbRate.source,
              lastUpdated: dbRate.lastUpdated,
            }
          : null,
        cacheStats: this.getCacheStats(),
      };
    } catch (error) {
      console.error("Test error:", error);
      return { error: error.message };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    currencyCache.flushAll();
    console.log("[CurrencyService] Cache cleared");
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    const stats = currencyCache.getStats();
    return stats;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Test dengan IDR
      const rate = await this.getRateFromAPI("IDR");
      const testAmount = 32000;
      const converted = testAmount * rate;

      const expectedMin = 1.8;
      const expectedMax = 2.0;
      const isValid = converted >= expectedMin && converted <= expectedMax;

      return {
        status: isValid ? "healthy" : "warning",
        service: "CurrencyService",
        api: "CurrencyAPI.com",
        test: {
          rate: rate,
          conversion: `${testAmount} IDR = $${converted.toFixed(4)}`,
          expected: `$${expectedMin}-$${expectedMax}`,
          isValid: isValid,
        },
        timestamp: new Date().toISOString(),
        cache: this.getCacheStats(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        service: "CurrencyService",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Batch conversion untuk multiple currencies (optimasi)
   */
  async batchConvertToUSD(amountsAndCurrencies) {
    try {
      const results = {};
      const uniqueCurrencies = [
        ...new Set(amountsAndCurrencies.map((ac) => ac.currency)),
      ];

      // Get rates untuk semua currency sekaligus
      const ratePromises = uniqueCurrencies.map(async (currency) => {
        return { currency, rate: await this.getRateToUSD(currency) };
      });

      const rates = await Promise.all(ratePromises);
      const rateMap = {};
      rates.forEach((r) => (rateMap[r.currency] = r.rate));

      // Lakukan konversi
      amountsAndCurrencies.forEach(({ id, amount, currency }) => {
        const rate = rateMap[currency];
        results[id] = amount * rate;
      });

      return results;
    } catch (error) {
      console.error("Batch conversion error:", error);
      throw error;
    }
  }

  /**
   * Get multiple rates sekaligus
   */
  async getMultipleRates(currencies) {
    try {
      const results = {};
      const uniqueCurrencies = [...new Set(currencies)];

      for (const currency of uniqueCurrencies) {
        if (currency !== "USD") {
          results[currency] = await this.getRateToUSD(currency);
        } else {
          results[currency] = 1.0;
        }
      }

      return results;
    } catch (error) {
      console.error("Get multiple rates error:", error);
      throw error;
    }
  }
}

// Export singleton
export default new CurrencyService();

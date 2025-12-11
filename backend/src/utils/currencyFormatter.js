export const formatCurrency = (value, currency = 'IDR') => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  const numValue = parseFloat(value);
  
  const formatters = {
    'IDR': new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    'USD': new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    'CENT': (value) => {
      // Untuk CENT, format khusus
      if (value >= 100) {
        // Jika >= 100¢, tampilkan sebagai dolar
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value / 100);
      } else {
        // Tampilkan sebagai sen
        return `${value.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}¢`;
      }
    }
  };
  
  if (currency === 'CENT') {
    return formatters.CENT(numValue);
  }
  
  const formatter = formatters[currency];
  if (formatter) {
    return formatter.format(numValue);
  }
  
  // Fallback
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ' + currency;
};
export const exportTradesToCSV = (trades) => {
  if (!trades || trades.length === 0) {
    return null;
  }

  const headers = [
    'Date',
    'Instrument',
    'Type',
    'Lot Size',
    'Entry Price',
    'Exit Price',
    'Stop Loss',
    'Take Profit',
    'Pips',
    'Profit/Loss',
    'Balance After',
    'Result',
    'Risk/Reward',
    'Strategy',
    'Market Condition',
    'Emotion Before',
    'Emotion After',
    'Notes'
  ];

  const formatNumber = (value) => {
    if (value === null || value === undefined) return '';
    return typeof value === 'number' ? value.toString() : value;
  };

  const rows = trades.map(trade => [
    trade.date,
    trade.instrument,
    trade.type,
    formatNumber(trade.lot),
    formatNumber(trade.entry),
    formatNumber(trade.exit),
    formatNumber(trade.stop),
    formatNumber(trade.take),
    formatNumber(trade.pips),
    formatNumber(trade.profit),
    formatNumber(trade.balanceAfter),
    trade.result,
    formatNumber(trade.riskReward),
    trade.strategy || '',
    trade.market || '',
    trade.emotionBefore || '',
    trade.emotionAfter || '',
    trade.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
export const countries = [
  { code: 'US', code3: 'USA', name: 'United States' },
  { code: 'GB', code3: 'GBR', name: 'United Kingdom' },
  { code: 'ID', code3: 'IDN', name: 'Indonesia' },
  { code: 'IN', code3: 'IND', name: 'India' },
  { code: 'SG', code3: 'SGP', name: 'Singapore' },
  { code: 'AU', code3: 'AUS', name: 'Australia' },
  { code: 'JP', code3: 'JPN', name: 'Japan' },
  { code: 'DE', code3: 'DEU', name: 'Germany' },
  { code: 'CA', code3: 'CAN', name: 'Canada' },
  { code: 'FR', code3: 'FRA', name: 'France' },
  { code: 'BR', code3: 'BRA', name: 'Brazil' },
];

// Sort countries alphabetically by name for the dropdown
export const sortedCountries = [...countries].sort((a, b) => 
  a.name.localeCompare(b.name)
);
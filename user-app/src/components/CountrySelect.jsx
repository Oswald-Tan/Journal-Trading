import Select from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { sortedCountries } from '../utils/countryList';

const CountrySelect = ({ value, onChange, error }) => {
  const options = sortedCountries.map(country => ({
    value: country.code3,
    label: (
      <div className="flex items-center">
        <ReactCountryFlag
          countryCode={country.code.toUpperCase()}
          svg
          style={{ width: '1.5em', height: '1.5em', marginRight: '10px' }}
        />
        <span>{country.name}</span>
      </div>
    ),
    country
  }));

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option.value)}
        isSearchable
        placeholder="Select a country..."
        className="react-select-container"
        classNamePrefix="react-select"
        
        // Tambahkan ini untuk pencarian yang tepat
        getOptionLabel={(option) => option.country.name}
        getOptionValue={(option) => option.value}
        
        filterOption={(option, inputValue) => {
          const countryName = option.data.country.name.toLowerCase();
          const input = inputValue.toLowerCase();
          return countryName.includes(input);
        }}
        
        formatOptionLabel={({ country }) => (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={country.code.toUpperCase()}
              svg
              style={{ width: '1.5em', height: '1.5em', marginRight: '10px' }}
            />
            <span>{country.name}</span>
          </div>
        )}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? '#fca5a5' : '#e2e8f0',
            borderRadius: '1rem',
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            '&:hover': {
              borderColor: error ? '#f87171' : '#c7d2fe',
            },
            '&:focus-within': {
              borderColor: error ? '#ef4444' : '#8b5cf6',
              boxShadow: error 
                ? '0 0 0 1px #fecaca' 
                : '0 0 0 1px #ddd6fe',
            }
          }),
        }}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-light">{error}</p>
      )}
    </div>
  );
};

export default CountrySelect;
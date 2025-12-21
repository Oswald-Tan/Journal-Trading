import React, { createContext, useState, useContext, useEffect } from 'react';

// Terjemahan
import enTranslations from '../locales/en.json';
import idTranslations from '../locales/id.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Coba ambil dari localStorage
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'id'; // Default bahasa Indonesia
  });

  const [translations, setTranslations] = useState({});

  // Load terjemahan berdasarkan bahasa
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        if (language === 'en') {
          setTranslations(enTranslations);
        } else {
          setTranslations(idTranslations);
        }
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to Indonesian
        setTranslations(idTranslations);
      }
    };

    loadTranslations();
  }, [language]);

  // Simpan bahasa ke localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (['en', 'id'].includes(lang)) {
      setLanguage(lang);
    }
  };

  // Fungsi translate
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Return key jika tidak ditemukan (untuk debugging)
        return key;
      }
    }

    // Replace parameters jika ada
    if (typeof value === 'string' && params) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }

    return value || key;
  };

  const value = {
    language,
    translations,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
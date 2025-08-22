import React, { useState, useEffect } from 'react';
import {translateText} from "../services/translation.js";
import { useLanguage } from '../context/LanguageContext';

export const TranslatedText = ({ children, className, style }) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `translation_${children}_${currentLanguage}`;

    const translateContent = async () => {
      if (typeof children !== 'string' || currentLanguage === 'en') {
        setTranslatedText(children);
        return;
      }

      // Check cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslatedText(cached);
        return;
      }

      setIsTranslating(true);
      try {
        // Batch API expects array
        const resultArr = await translateText([children], currentLanguage);
        const result = resultArr[0] || children;
        if (isMounted) {
          setTranslatedText(result);
          localStorage.setItem(cacheKey, result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(children);
        }
      } finally {
        if (isMounted) {
          setIsTranslating(false);
        }
      }
    };

    translateContent();

    return () => {
      isMounted = false;
    };
  }, [children, currentLanguage]);

  if (isTranslating) {
    return (
      <span className={className} style={style}>
        {children}
        <span className="inline-block ml-1 w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
      </span>
    );
  }

  return (
    <span className={className} style={style}>
      {translatedText}
    </span>
  );
};
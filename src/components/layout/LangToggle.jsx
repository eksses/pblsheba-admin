import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LangToggle = () => {
  const { i18n } = useTranslation();

  const toggle = (l) => {
    i18n.changeLanguage(l);
    localStorage.setItem('pbl_lang', l);
    document.body.setAttribute('lang', l);
  };

  useEffect(() => {
    document.body.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  return (
    <div className="lang-toggle">
      {['en', 'bn'].map((l) => (
        <button
          key={l}
          className={`lang-btn ${i18n.language === l ? 'active' : ''}`}
          onClick={() => toggle(l)}
        >
          {l === 'en' ? 'EN' : 'বাং'}
        </button>
      ))}
    </div>
  );
};

export default LangToggle;

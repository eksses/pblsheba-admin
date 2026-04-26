import { haptic } from '../../utils/haptic';

const LangToggle = () => {
  const { i18n } = useTranslation();

  const toggle = (l) => {
    haptic('light');
    i18n.changeLanguage(l);
    try {
      localStorage.setItem('pbl_lang', l);
    } catch (e) {}
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

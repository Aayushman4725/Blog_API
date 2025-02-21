import React from "react";

interface TranslationSectionProps {
  blogId: number;
  handleTranslate: (blogId: number, language: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const TranslationSection: React.FC<TranslationSectionProps> = ({
  blogId,
  handleTranslate,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  return (
    <div className="translation-section">
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
      >
        <option value="">Select Language</option>
        <option value="de">German</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="it">Italian</option>
        <option value="zh-cn">Chinese (Simplified)</option>
        <option value="ar">Arabic</option>
        <option value="ru">Russian</option>
        <option value="nl">Dutch</option>
        <option value="hi">Hindi</option>
        <option value="sv">Swedish</option>
        <option value="da">Danish</option>
        <option value="fi">Finnish</option>
        <option value="cs">Czech</option>
        <option value="he">Hebrew</option>
        <option value="bg">Bulgarian</option>
        <option value="uk">Ukrainian</option>
        <option value="ro">Romanian</option>
        <option value="id">Indonesian</option>
        <option value="ms">Malay</option>
        <option value="th">Thai</option>
        <option value="vi">Vietnamese</option>
        <option value="no">Norwegian</option>
        <option value="hu">Hungarian</option>
        <option value="lt">Lithuanian</option>
        <option value="lv">Latvian</option>
        <option value="et">Estonian</option>
        <option value="sk">Slovak</option>
        <option value="sl">Slovenian</option>
        <option value="el">Greek</option>
        <option value="sw">Swahili</option>
      </select>
      <button onClick={() => handleTranslate(blogId, selectedLanguage)}>
        Translate
      </button>
    </div>
  );
};

export default TranslationSection;

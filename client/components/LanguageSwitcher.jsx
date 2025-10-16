import { useState } from 'react'
import { useLocalization } from '../hooks/useLocalization'
import Modal from './Modal'

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { language, changeLanguage, supportedLanguages } = useLocalization()

  const languageNames = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
        aria-label="Change language"
      >
        <span className="text-sm">{languageNames[language]}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Language">
        <div className="space-y-3">
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                changeLanguage(lang)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                language === lang
                  ? 'bg-accent-teal/20 border-accent-teal'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="text-left">
                <div className="text-white font-semibold">{languageNames[lang]}</div>
                <div className="text-gray-300 text-sm capitalize">{lang}</div>
              </div>
              
              {language === lang && (
                <div className="w-3 h-3 bg-accent-teal rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm text-center">
            Help us translate DeedChain into more languages
          </p>
          <button className="w-full mt-2 btn-secondary text-sm">
            Contribute Translations
          </button>
        </div>
      </Modal>
    </>
  )
}

export default LanguageSwitcher
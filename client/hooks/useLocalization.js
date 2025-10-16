import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Localization strings
const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.marketplace': 'Marketplace',
    'nav.register': 'Register Property',
    'nav.tokenized': 'Tokenized Properties',
    'nav.analytics': 'Analytics',
    'nav.transactions': 'Transactions',
    
    // Properties
    'property.register': 'Register Property',
    'property.location': 'Location',
    'property.area': 'Area',
    'property.surveyNumber': 'Survey Number',
    'property.status': 'Status',
    'property.verified': 'Verified',
    'property.pending': 'Pending',
    
    // Wallet
    'wallet.connect': 'Connect Wallet',
    'wallet.disconnect': 'Disconnect',
    'wallet.connected': 'Connected',
    
    // Actions
    'action.transfer': 'Transfer Ownership',
    'action.tokenize': 'Tokenize Property',
    'action.verify': 'Verify Property',
    
    // Messages
    'message.registration_success': 'Property registered successfully',
    'message.transfer_success': 'Ownership transferred successfully',
    'message.tokenization_success': 'Property tokenized successfully'
  },
  
  es: {
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.marketplace': 'Mercado',
    'nav.register': 'Registrar Propiedad',
    'nav.tokenized': 'Propiedades Tokenizadas',
    'nav.analytics': 'Analíticas',
    'nav.transactions': 'Transacciones',
    
    // Properties
    'property.register': 'Registrar Propiedad',
    'property.location': 'Ubicación',
    'property.area': 'Área',
    'property.surveyNumber': 'Número de Estudio',
    'property.status': 'Estado',
    'property.verified': 'Verificado',
    'property.pending': 'Pendiente',
    
    // Wallet
    'wallet.connect': 'Conectar Cartera',
    'wallet.disconnect': 'Desconectar',
    'wallet.connected': 'Conectado',
    
    // Actions
    'action.transfer': 'Transferir Propiedad',
    'action.tokenize': 'Tokenizar Propiedad',
    'action.verify': 'Verificar Propiedad',
    
    // Messages
    'message.registration_success': 'Propiedad registrada exitosamente',
    'message.transfer_success': 'Propiedad transferida exitosamente',
    'message.tokenization_success': 'Propiedad tokenizada exitosamente'
  },
  
  fr: {
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.marketplace': 'Marché',
    'nav.register': 'Enregistrer une Propriété',
    'nav.tokenized': 'Propriétés Tokenisées',
    'nav.analytics': 'Analytiques',
    'nav.transactions': 'Transactions',
    
    // Properties
    'property.register': 'Enregistrer une Propriété',
    'property.location': 'Emplacement',
    'property.area': 'Superficie',
    'property.surveyNumber': 'Numéro d\'Enquête',
    'property.status': 'Statut',
    'property.verified': 'Vérifié',
    'property.pending': 'En Attente',
    
    // Wallet
    'wallet.connect': 'Connecter le Portefeuille',
    'wallet.disconnect': 'Déconnecter',
    'wallet.connected': 'Connecté',
    
    // Actions
    'action.transfer': 'Transférer la Propriété',
    'action.tokenize': 'Tokeniser la Propriété',
    'action.verify': 'Vérifier la Propriété',
    
    // Messages
    'message.registration_success': 'Propriété enregistrée avec succès',
    'message.transfer_success': 'Propriété transférée avec succès',
    'message.tokenization_success': 'Propriété tokenisée avec succès'
  }
}

export const useLocalization = () => {
  const [language, setLanguage] = useLocalStorage('deedchain-language', 'en')
  const [t, setT] = useState(translations[language])

  useEffect(() => {
    setT(translations[language] || translations.en)
    
    // Update HTML lang attribute
    document.documentElement.lang = language
  }, [language])

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage)
    }
  }

  const translate = (key, params = {}) => {
    let translation = t[key] || key
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param])
    })
    
    return translation
  }

  return {
    language,
    t: translate,
    changeLanguage,
    supportedLanguages: Object.keys(translations)
  }
}
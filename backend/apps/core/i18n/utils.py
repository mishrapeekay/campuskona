
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

class LanguageResolver:
    """
    Resolves the preferred language based on user, tenant, and system defaults.
    """
    
    @staticmethod
    def resolve_language(user=None, tenant=None):
        """
        Determines the language to use.
        Order: User Preference -> Tenant Default -> System Default
        """
        # 1. User Preference
        if user and getattr(user, 'language_preference', None):
            return user.language_preference
            
        # 2. Tenant Default
        if tenant:
            # Check tenant config if available
            if hasattr(tenant, 'config') and getattr(tenant.config, 'language', None):
                return tenant.config.language
            # Fallback to tenant direct attribute if implemented
            if getattr(tenant, 'language', None):
                return tenant.language
                
        # 3. System Default
        return getattr(settings, 'LANGUAGE_CODE', 'en')

    @staticmethod
    def get_translation(key, language='en', context=None):
        """
        Get translation for a key in the specified language.
        context: Optional dict for string formatting.
        """
        from apps.core.i18n import TRANSLATION_KEYS
        
        # Simple key lookup (e.g., 'common.welcome')
        parts = key.split('.')
        value = TRANSLATION_KEYS
        
        try:
            for part in parts:
                value = value[part]
            
            translation = value.get(language, value.get('en', key))
            
            if context:
                return translation.format(**context)
            return translation
            
        except (KeyError, AttributeError):
            logger.warning(f"Translation key not found: {key}")
            return key

def get_closest_language_match(requested_lang):
    """
    Finds the closest available language match.
    e.g., 'en-US' -> 'en'
    """
    if not requested_lang:
        return 'en'
        
    requested_lang = requested_lang.split('-')[0].lower()
    
    # Check against supported list (simplified)
    # Ideally should check against settings.LANGUAGES
    if requested_lang in ['hi', 'hindi']:
        return 'hi'
        
    return 'en'

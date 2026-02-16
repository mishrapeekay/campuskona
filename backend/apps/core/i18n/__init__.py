
"""
Internationalization (i18n) package for the core application.
Handles translation, localization settings, and formatting.
"""

# Default languages
LANGUAGE_ENGLISH = 'en'
LANGUAGE_HINDI = 'hi'

LANGUAGES = [
    ('en', 'English'),
    ('hi', 'Hindi'),
    ('ta', 'Tamil'),
    ('te', 'Telugu'),
    ('kn', 'Kannada'),
    ('ml', 'Malayalam'),
    ('mr', 'Marathi'),
    ('bn', 'Bengali'),
    ('gu', 'Gujarati'),
]

DEFAULT_LANGUAGE = LANGUAGE_ENGLISH

# Placeholder for translation keys if we want to centralize logic
TRANSLATION_KEYS = {
    'common': {
        'welcome': {'en': 'Welcome', 'hi': 'स्वागत हे'},
        'login': {'en': 'Login', 'hi': 'लॉगिन'},
        'submit': {'en': 'Submit', 'hi': 'जमा करें'},
        'cancel': {'en': 'Cancel', 'hi': 'रद्द करें'},
        'error': {'en': 'Error', 'hi': 'त्रुटि'},
        'success': {'en': 'Success', 'hi': 'सफलता'},
    },
    'notifications': {
        'new_assignment': {'en': 'New assignment uploaded.', 'hi': 'नया असाइनमेंट अपलोड किया गया।'},
        'exam_result': {'en': 'Exam results declared.', 'hi': 'परीक्षा परिणाम घोषित किए गए।'},
    }
}

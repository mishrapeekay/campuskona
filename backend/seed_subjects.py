"""
Seed script: Populates Veda9 tenant with CBSE, ICSE, IB and common subject library.
Run via: docker exec school_mgmt_backend_prod python /app/seed_subjects.py

Creates:
- Board records: CBSE, ICSE, IB (get_or_create)
- ~95 Subject records across all class groups and boards
  - Common (board=None): 12 subjects used across all boards
  - CBSE-specific: 28 subjects
  - ICSE-specific: 27 subjects
  - IB-specific: 28 subjects

Each subject tuple:
  (board_key, class_group, stream, name, code, subject_type, has_practical, is_optional, theory_max, practical_max)
board_key: 'CBSE' | 'ICSE' | 'IB' | None (common)
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django_tenants.utils import schema_context
from apps.academics.models import Board, Subject

SCHEMA = 'tenant_veda_v9'

# ---------------------------------------------------------------------------
# Board definitions
# ---------------------------------------------------------------------------
BOARDS = [
    {
        'board_type': 'CBSE',
        'board_name': 'Central Board of Secondary Education',
        'board_code': 'CBSE',
        'minimum_passing_percentage': 33.00,
        'description': 'National level board under Government of India',
    },
    {
        'board_type': 'ICSE',
        'board_name': 'Indian Certificate of Secondary Education',
        'board_code': 'ICSE',
        'minimum_passing_percentage': 35.00,
        'description': 'Conducted by the Council for the Indian School Certificate Examinations',
    },
    {
        'board_type': 'IB',
        'board_name': 'International Baccalaureate',
        'board_code': 'IB',
        'minimum_passing_percentage': 40.00,
        'description': 'International educational foundation offering globally recognized programmes',
    },
]

# ---------------------------------------------------------------------------
# Subject data
# Format: (board_key, class_group, stream, name, code, subject_type, has_practical, is_optional, theory_max, practical_max)
# board_key = None means common to all boards
# ---------------------------------------------------------------------------
SUBJECTS = [

    # =======================================================================
    # COMMON (board=None) — used across all boards / class groups
    # =======================================================================
    # PRE-PRIMARY common
    (None, 'PRE_PRIMARY', 'GENERAL', 'English Language',      'CMN-PP-ENG',   'LANGUAGE',        False, False, 50,  0),
    (None, 'PRE_PRIMARY', 'GENERAL', 'Hindi Language',         'CMN-PP-HIN',   'LANGUAGE',        False, False, 50,  0),
    (None, 'PRE_PRIMARY', 'GENERAL', 'Mathematics (Numeracy)', 'CMN-PP-MAT',   'CORE',            False, False, 50,  0),
    (None, 'PRE_PRIMARY', 'GENERAL', 'Environmental Awareness','CMN-PP-EVS',   'CORE',            False, False, 50,  0),
    (None, 'PRE_PRIMARY', 'GENERAL', 'Art & Craft',            'CMN-PP-ART',   'EXTRA_CURRICULAR',True,  False, 25,  25),
    (None, 'PRE_PRIMARY', 'GENERAL', 'Physical Development',   'CMN-PP-PHY',   'EXTRA_CURRICULAR',True,  False, 0,   50),
    (None, 'PRE_PRIMARY', 'GENERAL', 'Music & Rhymes',         'CMN-PP-MUS',   'EXTRA_CURRICULAR',True,  False, 0,   50),

    # PRIMARY common
    (None, 'PRIMARY',     'GENERAL', 'English',                'CMN-PRI-ENG',  'LANGUAGE',        False, False, 100, 0),
    (None, 'PRIMARY',     'GENERAL', 'Hindi',                  'CMN-PRI-HIN',  'LANGUAGE',        False, False, 100, 0),
    (None, 'PRIMARY',     'GENERAL', 'Mathematics',            'CMN-PRI-MAT',  'CORE',            False, False, 100, 0),
    (None, 'PRIMARY',     'GENERAL', 'Environmental Studies',  'CMN-PRI-EVS',  'CORE',            False, False, 100, 0),
    (None, 'PRIMARY',     'GENERAL', 'Art Education',          'CMN-PRI-ART',  'EXTRA_CURRICULAR',True,  False, 50,  50),
    (None, 'PRIMARY',     'GENERAL', 'Physical Education',     'CMN-PRI-PE',   'EXTRA_CURRICULAR',True,  False, 0,   100),
    (None, 'PRIMARY',     'GENERAL', 'General Knowledge',      'CMN-PRI-GK',   'CORE',            False, True,  100, 0),

    # MIDDLE common
    (None, 'MIDDLE',      'GENERAL', 'English Language & Lit', 'CMN-MID-ENG',  'LANGUAGE',        False, False, 100, 0),
    (None, 'MIDDLE',      'GENERAL', 'Hindi',                  'CMN-MID-HIN',  'LANGUAGE',        False, False, 100, 0),
    (None, 'MIDDLE',      'GENERAL', 'Mathematics',            'CMN-MID-MAT',  'CORE',            False, False, 100, 0),
    (None, 'MIDDLE',      'GENERAL', 'Science',                'CMN-MID-SCI',  'CORE',            True,  False, 80,  20),
    (None, 'MIDDLE',      'GENERAL', 'Social Science',         'CMN-MID-SST',  'CORE',            False, False, 100, 0),
    (None, 'MIDDLE',      'GENERAL', 'Physical Education',     'CMN-MID-PE',   'EXTRA_CURRICULAR',True,  False, 0,   100),

    # =======================================================================
    # CBSE
    # =======================================================================

    # CBSE — PRE_PRIMARY
    ('CBSE', 'PRE_PRIMARY', 'GENERAL', 'Moral Education',         'CBSE-PP-MOR',  'EXTRA_CURRICULAR',False, False, 50,  0),

    # CBSE — PRIMARY (Class 1–5)
    ('CBSE', 'PRIMARY',     'GENERAL', 'Sanskrit (Introductory)', 'CBSE-PRI-SAN', 'LANGUAGE',        False, True,  100, 0),
    ('CBSE', 'PRIMARY',     'GENERAL', 'Computer Science (Intro)','CBSE-PRI-CS',  'CORE',            True,  True,  50,  50),

    # CBSE — MIDDLE (Class 6–8)
    ('CBSE', 'MIDDLE',      'GENERAL', 'Sanskrit',                'CBSE-MID-SAN', 'LANGUAGE',        False, True,  100, 0),
    ('CBSE', 'MIDDLE',      'GENERAL', 'Computer Science',        'CBSE-MID-CS',  'CORE',            True,  True,  50,  50),
    ('CBSE', 'MIDDLE',      'GENERAL', 'French',                  'CBSE-MID-FR',  'LANGUAGE',        False, True,  100, 0),
    ('CBSE', 'MIDDLE',      'GENERAL', 'German',                  'CBSE-MID-GER', 'LANGUAGE',        False, True,  100, 0),

    # CBSE — SECONDARY (Class 9–10)
    ('CBSE', 'SECONDARY',   'GENERAL', 'English Language & Literature', 'CBSE-SEC-ENG', 'LANGUAGE',  False, False, 100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Hindi Course A',           'CBSE-SEC-HINA','LANGUAGE',        False, False, 100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Hindi Course B',           'CBSE-SEC-HINB','LANGUAGE',        False, True,  100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Mathematics Standard',     'CBSE-SEC-MATS','CORE',            False, False, 100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Mathematics Basic',        'CBSE-SEC-MATB','CORE',            False, True,  100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Science (Physics+Chem+Bio)','CBSE-SEC-SCI','CORE',            True,  False, 80,  20),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Social Science',           'CBSE-SEC-SST', 'CORE',            False, False, 100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Information Technology',   'CBSE-SEC-IT',  'ELECTIVE',        True,  True,  50,  50),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Artificial Intelligence',  'CBSE-SEC-AI',  'ELECTIVE',        True,  True,  50,  50),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Sanskrit',                 'CBSE-SEC-SAN', 'LANGUAGE',        False, True,  100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'French',                   'CBSE-SEC-FR',  'LANGUAGE',        False, True,  100, 0),
    ('CBSE', 'SECONDARY',   'GENERAL', 'Physical Education',       'CBSE-SEC-PE',  'EXTRA_CURRICULAR',True,  False, 0,   100),

    # CBSE — SENIOR_SECONDARY Science stream (Class 11–12)
    ('CBSE', 'SENIOR_SECONDARY', 'GENERAL', 'English Core',        'CBSE-SS-ENG',  'LANGUAGE',        False, False, 100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI',     'Physics',             'CBSE-SS-PHY',  'CORE',            True,  False, 70,  30),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI',     'Chemistry',           'CBSE-SS-CHE',  'CORE',            True,  False, 70,  30),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI',     'Biology',             'CBSE-SS-BIO',  'CORE',            True,  True,  70,  30),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI',     'Mathematics',         'CBSE-SS-MAT',  'CORE',            False, True,  100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI',     'Computer Science',    'CBSE-SS-CS',   'ELECTIVE',        True,  True,  70,  30),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI',     'Physical Education',  'CBSE-SS-PE',   'EXTRA_CURRICULAR',True,  True,  0,   100),
    # CBSE — SENIOR_SECONDARY Commerce stream
    ('CBSE', 'SENIOR_SECONDARY', 'COM',     'Accountancy',         'CBSE-SS-ACC',  'CORE',            False, False, 100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'COM',     'Business Studies',    'CBSE-SS-BST',  'CORE',            False, False, 100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'COM',     'Economics',           'CBSE-SS-ECO',  'CORE',            False, False, 100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'COM',     'Mathematics (Commerce)','CBSE-SS-MATC','ELECTIVE',        False, True,  100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'COM',     'Informatics Practices','CBSE-SS-IP',  'ELECTIVE',        True,  True,  70,  30),
    # CBSE — SENIOR_SECONDARY Humanities stream
    ('CBSE', 'SENIOR_SECONDARY', 'HUM',     'History',             'CBSE-SS-HIS',  'CORE',            False, False, 100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM',     'Political Science',   'CBSE-SS-POL',  'CORE',            False, False, 100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM',     'Geography',           'CBSE-SS-GEO',  'CORE',            True,  False, 70,  30),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM',     'Sociology',           'CBSE-SS-SOC',  'ELECTIVE',        False, True,  100, 0),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM',     'Psychology',          'CBSE-SS-PSY',  'ELECTIVE',        True,  True,  70,  30),

    # =======================================================================
    # ICSE
    # =======================================================================

    # ICSE — PRIMARY (Class 1–5)
    ('ICSE', 'PRIMARY',     'GENERAL', 'English',                 'ICSE-PRI-ENG', 'LANGUAGE',        False, False, 100, 0),
    ('ICSE', 'PRIMARY',     'GENERAL', 'Mathematics',             'ICSE-PRI-MAT', 'CORE',            False, False, 100, 0),
    ('ICSE', 'PRIMARY',     'GENERAL', 'Environmental Studies',   'ICSE-PRI-EVS', 'CORE',            False, False, 100, 0),
    ('ICSE', 'PRIMARY',     'GENERAL', 'Hindi / Regional Lang',   'ICSE-PRI-HIN', 'LANGUAGE',        False, False, 100, 0),
    ('ICSE', 'PRIMARY',     'GENERAL', 'Art & Craft',             'ICSE-PRI-ART', 'EXTRA_CURRICULAR',True,  False, 50,  50),

    # ICSE — MIDDLE (Class 6–8)
    ('ICSE', 'MIDDLE',      'GENERAL', 'English Language',        'ICSE-MID-ENGL','LANGUAGE',        False, False, 100, 0),
    ('ICSE', 'MIDDLE',      'GENERAL', 'English Literature',      'ICSE-MID-ENGT','LANGUAGE',        False, False, 100, 0),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Hindi',                   'ICSE-MID-HIN', 'LANGUAGE',        False, False, 100, 0),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Mathematics',             'ICSE-MID-MAT', 'CORE',            False, False, 100, 0),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Physics',                 'ICSE-MID-PHY', 'CORE',            True,  False, 80,  20),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Chemistry',               'ICSE-MID-CHE', 'CORE',            True,  False, 80,  20),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Biology',                 'ICSE-MID-BIO', 'CORE',            True,  False, 80,  20),
    ('ICSE', 'MIDDLE',      'GENERAL', 'History & Civics',        'ICSE-MID-HST', 'CORE',            False, False, 100, 0),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Geography',               'ICSE-MID-GEO', 'CORE',            True,  False, 80,  20),
    ('ICSE', 'MIDDLE',      'GENERAL', 'Computer Applications',   'ICSE-MID-COMP','ELECTIVE',        True,  True,  50,  50),

    # ICSE — SECONDARY (Class 9–10)
    # Group I (Compulsory)
    ('ICSE', 'SECONDARY',   'GENERAL', 'English Language (Group I)',   'ICSE-SEC-ENGL','LANGUAGE',   False, False, 100, 0),
    ('ICSE', 'SECONDARY',   'GENERAL', 'English Literature (Group I)', 'ICSE-SEC-ENGT','LANGUAGE',   False, False, 100, 0),
    ('ICSE', 'SECONDARY',   'GENERAL', 'History & Civics (Group I)',   'ICSE-SEC-HST', 'CORE',       False, False, 100, 0),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Geography (Group I)',          'ICSE-SEC-GEO', 'CORE',       True,  False, 80,  20),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Hindi (Group I)',              'ICSE-SEC-HIN', 'LANGUAGE',   False, False, 100, 0),
    # Group II (Any 2 of 3 sciences + Math)
    ('ICSE', 'SECONDARY',   'GENERAL', 'Mathematics (Group II)',       'ICSE-SEC-MAT', 'CORE',       False, False, 100, 0),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Physics (Group II)',           'ICSE-SEC-PHY', 'CORE',       True,  True,  80,  20),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Chemistry (Group II)',         'ICSE-SEC-CHE', 'CORE',       True,  True,  80,  20),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Biology (Group II)',           'ICSE-SEC-BIO', 'CORE',       True,  True,  80,  20),
    # Group III (Any 1 elective)
    ('ICSE', 'SECONDARY',   'GENERAL', 'Computer Applications (Gr III)','ICSE-SEC-COMP','ELECTIVE',  True,  True,  50,  50),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Economics (Group III)',        'ICSE-SEC-ECO', 'ELECTIVE',   False, True,  100, 0),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Commercial Studies (Gr III)', 'ICSE-SEC-COM', 'ELECTIVE',   False, True,  100, 0),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Environmental Science (Gr III)','ICSE-SEC-ENV','ELECTIVE',   True,  True,  50,  50),
    ('ICSE', 'SECONDARY',   'GENERAL', 'Physical Education (Gr III)', 'ICSE-SEC-PE',  'EXTRA_CURRICULAR',True, True, 0,  100),

    # ICSE — SENIOR_SECONDARY (ISC — Class 11–12) Science
    ('ICSE', 'SENIOR_SECONDARY', 'SCI',  'English (ISC)',            'ISC-SS-ENG',   'LANGUAGE',    False, False, 100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI',  'Physics (ISC)',            'ISC-SS-PHY',   'CORE',        True,  False, 70,  30),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI',  'Chemistry (ISC)',          'ISC-SS-CHE',   'CORE',        True,  False, 70,  30),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI',  'Biology (ISC)',            'ISC-SS-BIO',   'CORE',        True,  True,  70,  30),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI',  'Mathematics (ISC)',        'ISC-SS-MAT',   'CORE',        False, True,  100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI',  'Computer Science (ISC)',   'ISC-SS-CS',    'ELECTIVE',    True,  True,  70,  30),
    # ICSE — SENIOR_SECONDARY Commerce
    ('ICSE', 'SENIOR_SECONDARY', 'COM',  'Accounts (ISC)',           'ISC-SS-ACC',   'CORE',        False, False, 100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'COM',  'Commerce (ISC)',           'ISC-SS-COMM',  'CORE',        False, False, 100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'COM',  'Economics (ISC)',          'ISC-SS-ECO',   'CORE',        False, False, 100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM',  'History (ISC)',            'ISC-SS-HIS',   'CORE',        False, False, 100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM',  'Political Science (ISC)',  'ISC-SS-POL',   'CORE',        False, False, 100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM',  'Sociology (ISC)',          'ISC-SS-SOC',   'ELECTIVE',    False, True,  100, 0),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM',  'Psychology (ISC)',         'ISC-SS-PSY',   'ELECTIVE',    True,  True,  70,  30),

    # =======================================================================
    # IB
    # =======================================================================

    # IB — PYP (PRE_PRIMARY + PRIMARY — Pre-Primary Years Programme)
    ('IB', 'PRE_PRIMARY', 'IB_GROUP', 'PYP Language Arts',         'IB-PYP-LA',    'LANGUAGE',        False, False, 50,  0),
    ('IB', 'PRE_PRIMARY', 'IB_GROUP', 'PYP Mathematics',           'IB-PYP-MAT',   'CORE',            False, False, 50,  0),
    ('IB', 'PRE_PRIMARY', 'IB_GROUP', 'PYP Science (PSPE)',        'IB-PYP-SCI',   'CORE',            True,  False, 25,  25),
    ('IB', 'PRE_PRIMARY', 'IB_GROUP', 'PYP Social Studies',        'IB-PYP-SS',    'CORE',            False, False, 50,  0),
    ('IB', 'PRE_PRIMARY', 'IB_GROUP', 'PYP Arts',                  'IB-PYP-ART',   'EXTRA_CURRICULAR',True,  False, 0,   50),

    ('IB', 'PRIMARY',     'IB_GROUP', 'PYP Language Arts (Upper)', 'IB-PYPU-LA',   'LANGUAGE',        False, False, 100, 0),
    ('IB', 'PRIMARY',     'IB_GROUP', 'PYP Mathematics (Upper)',   'IB-PYPU-MAT',  'CORE',            False, False, 100, 0),
    ('IB', 'PRIMARY',     'IB_GROUP', 'PYP Science (Upper)',       'IB-PYPU-SCI',  'CORE',            True,  False, 80,  20),
    ('IB', 'PRIMARY',     'IB_GROUP', 'PYP Social Studies (Upper)','IB-PYPU-SS',   'CORE',            False, False, 100, 0),
    ('IB', 'PRIMARY',     'IB_GROUP', 'PYP Arts (Upper)',          'IB-PYPU-ART',  'EXTRA_CURRICULAR',True,  False, 50,  50),

    # IB — MYP (MIDDLE — Middle Years Programme, Gr 6–10)
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Language & Literature', 'IB-MYP-LA',    'LANGUAGE',        False, False, 100, 0),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Language Acquisition',  'IB-MYP-LAQ',   'LANGUAGE',        False, True,  100, 0),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Mathematics',           'IB-MYP-MAT',   'CORE',            False, False, 100, 0),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Sciences',              'IB-MYP-SCI',   'CORE',            True,  False, 80,  20),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Individuals & Societies','IB-MYP-IS',   'CORE',            False, False, 100, 0),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Arts',                  'IB-MYP-ART',   'EXTRA_CURRICULAR',True,  False, 50,  50),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Design (Technology)',   'IB-MYP-DES',   'ELECTIVE',        True,  True,  50,  50),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Physical & Health Ed.', 'IB-MYP-PE',    'EXTRA_CURRICULAR',True,  False, 0,   100),
    ('IB', 'MIDDLE',      'IB_GROUP', 'MYP Personal Project',      'IB-MYP-PP',    'ELECTIVE',        False, False, 0,   100),

    # IB — SECONDARY (MYP 4–5 = Class 9–10)
    ('IB', 'SECONDARY',   'IB_GROUP', 'MYP Language & Literature (Yr4-5)', 'IB-MYPS-LA',  'LANGUAGE', False, False, 100, 0),
    ('IB', 'SECONDARY',   'IB_GROUP', 'MYP Mathematics Extended',          'IB-MYPS-MAT', 'CORE',     False, False, 100, 0),
    ('IB', 'SECONDARY',   'IB_GROUP', 'MYP Sciences (Yr4-5)',              'IB-MYPS-SCI', 'CORE',     True,  False, 80,  20),
    ('IB', 'SECONDARY',   'IB_GROUP', 'MYP Individuals & Societies (4-5)','IB-MYPS-IS',  'CORE',     False, False, 100, 0),
    ('IB', 'SECONDARY',   'IB_GROUP', 'MYP e-Assessment',                  'IB-MYPS-EA',  'ELECTIVE', False, True,  100, 0),

    # IB — SENIOR_SECONDARY (DP — Diploma Programme, Gr 11–12)
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Language A: Literature',     'IB-DP-LA',    'LANGUAGE',  False, False, 100, 0),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Language B (French)',         'IB-DP-LBF',   'LANGUAGE',  False, True,  100, 0),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Language B (Spanish)',        'IB-DP-LBS',   'LANGUAGE',  False, True,  100, 0),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP History',                     'IB-DP-HIS',   'CORE',      False, True,  100, 0),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Economics',                   'IB-DP-ECO',   'CORE',      False, True,  100, 0),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Geography',                   'IB-DP-GEO',   'CORE',      True,  True,  80,  20),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Mathematics: Analysis',       'IB-DP-MATA',  'CORE',      False, True,  100, 0),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Mathematics: Applications',   'IB-DP-MATB',  'CORE',      True,  True,  80,  20),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Physics HL',                  'IB-DP-PHY',   'CORE',      True,  True,  80,  20),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Chemistry HL',                'IB-DP-CHE',   'CORE',      True,  True,  80,  20),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Biology HL',                  'IB-DP-BIO',   'CORE',      True,  True,  80,  20),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Computer Science',            'IB-DP-CS',    'ELECTIVE',  True,  True,  70,  30),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Visual Arts',                 'IB-DP-VA',    'ELECTIVE',  True,  True,  50,  50),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Theory of Knowledge (TOK)',   'IB-DP-TOK',   'CORE',      False, False, 0,   100),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP Extended Essay (EE)',         'IB-DP-EE',    'ELECTIVE',  False, False, 0,   100),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'DP CAS (Creativity, Activity, Service)', 'IB-DP-CAS', 'EXTRA_CURRICULAR', True, False, 0, 100),
]


def seed_boards():
    """Create Board records if they don't exist. Use board_code for idempotent lookup."""
    board_objects = {}
    for bd in BOARDS:
        # board_code has unique constraint — use it as the idempotent key
        try:
            obj = Board.objects.get(board_code=bd['board_code'])
            # Update board_type if it got saved blank
            if not obj.board_type:
                obj.board_type = bd['board_type']
                obj.save(update_fields=['board_type'])
            created = False
        except Board.DoesNotExist:
            obj = Board.objects.create(
                board_type=bd['board_type'],
                board_name=bd['board_name'],
                board_code=bd['board_code'],
                minimum_passing_percentage=bd['minimum_passing_percentage'],
                description=bd['description'],
                grading_system={},
                is_active=True,
            )
            created = True
        board_objects[bd['board_type']] = obj
        status = 'created' if created else 'exists'
        print(f'  Board [{status}]: {obj.board_name} (type={obj.board_type})')
    return board_objects


def seed_subjects(board_objects):
    """Create Subject records — skip if code already exists."""
    created_count = 0
    skipped_count = 0

    for (board_key, class_group, stream, name, code, subject_type,
         has_practical, is_optional, theory_max, practical_max) in SUBJECTS:

        if Subject.objects.filter(code=code).exists():
            skipped_count += 1
            continue

        board = board_objects.get(board_key) if board_key else None
        Subject.objects.create(
            name=name,
            code=code,
            subject_type=subject_type,
            class_group=class_group,
            stream=stream,
            board=board,
            has_practical=has_practical,
            is_optional=is_optional,
            theory_max_marks=theory_max,
            practical_max_marks=practical_max,
            is_active=True,
            description='',
        )
        board_label = board_key or 'ALL'
        print(f'  Subject [created]: [{board_label}] [{class_group}] [{stream}] {name} ({code})')
        created_count += 1

    print(f'\n  Total: {created_count} created, {skipped_count} skipped (already exist)')


def main():
    print(f'\n=== Seeding Boards and Subject Library into schema: {SCHEMA} ===\n')
    with schema_context(SCHEMA):
        print('--- Step 1: Boards ---')
        board_objects = seed_boards()

        print('\n--- Step 2: Subjects ---')
        seed_subjects(board_objects)

    print('\n=== Done ===')


if __name__ == '__main__':
    main()

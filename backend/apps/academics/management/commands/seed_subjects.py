from django.core.management.base import BaseCommand
from django.db import connection
from apps.academics.models import Board, Subject


# Complete board-wise subject data
# Format: (board_type, class_group, stream, name, code_suffix, subject_type, has_practical, is_optional)
SUBJECT_DATA = [
    # =====================================================================
    # CBSE / NCERT
    # =====================================================================

    # PRIMARY (Class 1-5)
    ('CBSE', 'PRIMARY', 'GENERAL', 'English', 'ENG', 'CORE', False, False),
    ('CBSE', 'PRIMARY', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, False),
    ('CBSE', 'PRIMARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('CBSE', 'PRIMARY', 'GENERAL', 'Environmental Studies', 'EVS', 'CORE', False, False),
    ('CBSE', 'PRIMARY', 'GENERAL', 'Computer Science', 'CS', 'CORE', True, False),
    ('CBSE', 'PRIMARY', 'GENERAL', 'Art Education', 'ART', 'EXTRA_CURRICULAR', True, False),
    ('CBSE', 'PRIMARY', 'GENERAL', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, False),

    # MIDDLE (Class 6-8)
    ('CBSE', 'MIDDLE', 'GENERAL', 'English', 'ENG', 'CORE', False, False),
    ('CBSE', 'MIDDLE', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, False),
    ('CBSE', 'MIDDLE', 'GENERAL', 'Third Language', 'TL', 'LANGUAGE', False, True),
    ('CBSE', 'MIDDLE', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('CBSE', 'MIDDLE', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('CBSE', 'MIDDLE', 'GENERAL', 'Social Science', 'SST', 'CORE', False, False),
    ('CBSE', 'MIDDLE', 'VOC', 'Artificial Intelligence', 'AI', 'ELECTIVE', True, True),
    ('CBSE', 'MIDDLE', 'VOC', 'Information Technology', 'IT', 'ELECTIVE', True, True),

    # SECONDARY (Class 9-10)
    ('CBSE', 'SECONDARY', 'GENERAL', 'English', 'ENG', 'CORE', False, False),
    ('CBSE', 'SECONDARY', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, False),
    ('CBSE', 'SECONDARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('CBSE', 'SECONDARY', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('CBSE', 'SECONDARY', 'GENERAL', 'Social Science', 'SST', 'CORE', False, False),
    ('CBSE', 'SECONDARY', 'VOC', 'Computer Applications', 'CA', 'ELECTIVE', True, True),
    ('CBSE', 'SECONDARY', 'VOC', 'Artificial Intelligence', 'AI', 'ELECTIVE', True, True),
    ('CBSE', 'SECONDARY', 'VOC', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, True),

    # SENIOR SECONDARY (Class 11-12) - Science
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'Physics', 'PHY', 'CORE', True, False),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'Chemistry', 'CHE', 'CORE', True, False),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'Mathematics', 'MAT', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'Biology', 'BIO', 'CORE', True, False),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'Computer Science', 'CS', 'ELECTIVE', True, True),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'Informatics Practices', 'IP', 'ELECTIVE', True, True),
    ('CBSE', 'SENIOR_SECONDARY', 'SCI', 'English Core', 'ENG', 'CORE', False, False),

    # SENIOR SECONDARY (Class 11-12) - Commerce
    ('CBSE', 'SENIOR_SECONDARY', 'COM', 'Accountancy', 'ACC', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'COM', 'Business Studies', 'BS', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'COM', 'Economics', 'ECO', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'COM', 'Mathematics', 'MAT', 'ELECTIVE', False, True),
    ('CBSE', 'SENIOR_SECONDARY', 'COM', 'Informatics Practices', 'IP', 'ELECTIVE', True, True),
    ('CBSE', 'SENIOR_SECONDARY', 'COM', 'English Core', 'ENG', 'CORE', False, False),

    # SENIOR SECONDARY (Class 11-12) - Humanities
    ('CBSE', 'SENIOR_SECONDARY', 'HUM', 'History', 'HIS', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM', 'Political Science', 'POL', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM', 'Geography', 'GEO', 'CORE', False, False),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM', 'Psychology', 'PSY', 'ELECTIVE', False, True),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM', 'Sociology', 'SOC', 'ELECTIVE', False, True),
    ('CBSE', 'SENIOR_SECONDARY', 'HUM', 'English Core', 'ENG', 'CORE', False, False),

    # =====================================================================
    # ICSE / ISC
    # =====================================================================

    # PRIMARY (Class 1-5)
    ('ICSE', 'PRIMARY', 'GENERAL', 'English', 'ENG', 'CORE', False, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'Environmental Studies', 'EVS', 'CORE', False, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'General Knowledge', 'GK', 'CORE', False, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'Computer Studies', 'CS', 'CORE', True, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'Art', 'ART', 'EXTRA_CURRICULAR', True, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, False),
    ('ICSE', 'PRIMARY', 'GENERAL', 'Moral Science', 'MS', 'CORE', False, False),

    # MIDDLE (Class 6-8)
    ('ICSE', 'MIDDLE', 'GENERAL', 'English', 'ENG', 'CORE', False, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'Second Language', 'SL', 'LANGUAGE', False, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'Physics', 'PHY', 'CORE', True, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'Chemistry', 'CHE', 'CORE', True, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'Biology', 'BIO', 'CORE', True, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'History & Civics', 'HC', 'CORE', False, False),
    ('ICSE', 'MIDDLE', 'GENERAL', 'Geography', 'GEO', 'CORE', False, False),

    # SECONDARY (Class 9-10)
    ('ICSE', 'SECONDARY', 'GENERAL', 'English', 'ENG', 'CORE', False, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'Second Language', 'SL', 'LANGUAGE', False, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'Physics', 'PHY', 'CORE', True, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'Chemistry', 'CHE', 'CORE', True, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'Biology', 'BIO', 'CORE', True, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'History & Civics', 'HC', 'CORE', False, False),
    ('ICSE', 'SECONDARY', 'GENERAL', 'Geography', 'GEO', 'CORE', False, False),
    ('ICSE', 'SECONDARY', 'VOC', 'Computer Applications', 'CA', 'ELECTIVE', True, True),
    ('ICSE', 'SECONDARY', 'VOC', 'Economic Applications', 'EA', 'ELECTIVE', False, True),
    ('ICSE', 'SECONDARY', 'VOC', 'Commercial Studies', 'CMS', 'ELECTIVE', False, True),
    ('ICSE', 'SECONDARY', 'VOC', 'Environmental Science', 'ENVS', 'ELECTIVE', True, True),
    ('ICSE', 'SECONDARY', 'VOC', 'Home Science', 'HS', 'ELECTIVE', True, True),
    ('ICSE', 'SECONDARY', 'VOC', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, True),
    ('ICSE', 'SECONDARY', 'VOC', 'Art / Music', 'AM', 'EXTRA_CURRICULAR', True, True),

    # ISC SENIOR SECONDARY (Class 11-12) - Science
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'Physics', 'PHY', 'CORE', True, False),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'Chemistry', 'CHE', 'CORE', True, False),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'Mathematics', 'MAT', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'Biology', 'BIO', 'CORE', True, False),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'Computer Science', 'CS', 'ELECTIVE', True, True),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'Biotechnology', 'BT', 'ELECTIVE', True, True),
    ('ICSE', 'SENIOR_SECONDARY', 'SCI', 'English', 'ENG', 'CORE', False, False),

    # ISC SENIOR SECONDARY (Class 11-12) - Commerce
    ('ICSE', 'SENIOR_SECONDARY', 'COM', 'Accountancy', 'ACC', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'COM', 'Business Studies', 'BS', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'COM', 'Economics', 'ECO', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'COM', 'Mathematics', 'MAT', 'ELECTIVE', False, True),
    ('ICSE', 'SENIOR_SECONDARY', 'COM', 'Computer Science', 'CS', 'ELECTIVE', True, True),
    ('ICSE', 'SENIOR_SECONDARY', 'COM', 'English', 'ENG', 'CORE', False, False),

    # ISC SENIOR SECONDARY (Class 11-12) - Humanities
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'History', 'HIS', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'Geography', 'GEO', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'Political Science', 'POL', 'CORE', False, False),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'Sociology', 'SOC', 'ELECTIVE', False, True),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'Psychology', 'PSY', 'ELECTIVE', False, True),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'Economics', 'ECO', 'ELECTIVE', False, True),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'Legal Studies', 'LS', 'ELECTIVE', False, True),
    ('ICSE', 'SENIOR_SECONDARY', 'HUM', 'English', 'ENG', 'CORE', False, False),

    # =====================================================================
    # STATE BOARDS (Generic Template)
    # =====================================================================

    # PRIMARY (Class 1-5)
    ('STATE', 'PRIMARY', 'GENERAL', 'Regional Language', 'RL', 'LANGUAGE', False, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'English', 'ENG', 'LANGUAGE', False, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'Environmental Studies', 'EVS', 'CORE', False, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'General Science', 'GS', 'CORE', False, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'Social Studies', 'SS', 'CORE', False, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'Computer Studies', 'CS', 'CORE', True, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'Art', 'ART', 'EXTRA_CURRICULAR', True, False),
    ('STATE', 'PRIMARY', 'GENERAL', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, False),

    # MIDDLE (Class 6-8)
    ('STATE', 'MIDDLE', 'GENERAL', 'Regional Language', 'RL', 'LANGUAGE', False, False),
    ('STATE', 'MIDDLE', 'GENERAL', 'English', 'ENG', 'LANGUAGE', False, False),
    ('STATE', 'MIDDLE', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, True),
    ('STATE', 'MIDDLE', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('STATE', 'MIDDLE', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('STATE', 'MIDDLE', 'GENERAL', 'Social Science', 'SST', 'CORE', False, False),

    # SECONDARY (Class 9-10)
    ('STATE', 'SECONDARY', 'GENERAL', 'Regional Language', 'RL', 'LANGUAGE', False, False),
    ('STATE', 'SECONDARY', 'GENERAL', 'English', 'ENG', 'LANGUAGE', False, False),
    ('STATE', 'SECONDARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('STATE', 'SECONDARY', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('STATE', 'SECONDARY', 'GENERAL', 'Social Science', 'SST', 'CORE', False, False),
    ('STATE', 'SECONDARY', 'VOC', 'Computer Science', 'CS', 'ELECTIVE', True, True),
    ('STATE', 'SECONDARY', 'VOC', 'Information Technology', 'IT', 'ELECTIVE', True, True),
    ('STATE', 'SECONDARY', 'VOC', 'Home Science', 'HS', 'ELECTIVE', True, True),
    ('STATE', 'SECONDARY', 'VOC', 'Agriculture', 'AGR', 'ELECTIVE', True, True),
    ('STATE', 'SECONDARY', 'VOC', 'Commerce Basics', 'CB', 'ELECTIVE', False, True),
    ('STATE', 'SECONDARY', 'VOC', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, True),

    # SENIOR SECONDARY (Class 11-12) - Science
    ('STATE', 'SENIOR_SECONDARY', 'SCI', 'Physics', 'PHY', 'CORE', True, False),
    ('STATE', 'SENIOR_SECONDARY', 'SCI', 'Chemistry', 'CHE', 'CORE', True, False),
    ('STATE', 'SENIOR_SECONDARY', 'SCI', 'Mathematics', 'MAT', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'SCI', 'Biology', 'BIO', 'CORE', True, False),
    ('STATE', 'SENIOR_SECONDARY', 'SCI', 'Computer Science', 'CS', 'ELECTIVE', True, True),
    ('STATE', 'SENIOR_SECONDARY', 'SCI', 'Electronics', 'ELE', 'ELECTIVE', True, True),

    # SENIOR SECONDARY (Class 11-12) - Commerce
    ('STATE', 'SENIOR_SECONDARY', 'COM', 'Accountancy', 'ACC', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'COM', 'Business Studies', 'BS', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'COM', 'Economics', 'ECO', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'COM', 'Statistics', 'STAT', 'ELECTIVE', False, True),
    ('STATE', 'SENIOR_SECONDARY', 'COM', 'Computer Applications', 'CA', 'ELECTIVE', True, True),

    # SENIOR SECONDARY (Class 11-12) - Humanities/Arts
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'History', 'HIS', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'Political Science', 'POL', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'Geography', 'GEO', 'CORE', False, False),
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'Sociology', 'SOC', 'ELECTIVE', False, True),
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'Psychology', 'PSY', 'ELECTIVE', False, True),
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'Economics', 'ECO', 'ELECTIVE', False, True),
    ('STATE', 'SENIOR_SECONDARY', 'HUM', 'Fine Arts', 'FA', 'ELECTIVE', True, True),

    # =====================================================================
    # IB (International Baccalaureate)
    # =====================================================================

    # PYP - Primary Years Programme
    ('IB', 'PRIMARY', 'GENERAL', 'Language', 'LANG', 'CORE', False, False),
    ('IB', 'PRIMARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('IB', 'PRIMARY', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('IB', 'PRIMARY', 'GENERAL', 'Social Studies', 'SS', 'CORE', False, False),
    ('IB', 'PRIMARY', 'GENERAL', 'Arts', 'ART', 'EXTRA_CURRICULAR', True, False),
    ('IB', 'PRIMARY', 'GENERAL', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, False),
    ('IB', 'PRIMARY', 'GENERAL', 'Personal, Social & Emotional Learning', 'PSEL', 'CORE', False, False),

    # MYP - Middle Years Programme
    ('IB', 'MIDDLE', 'GENERAL', 'Language & Literature', 'LL', 'CORE', False, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Language Acquisition', 'LA', 'CORE', False, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Individuals & Societies', 'IS', 'CORE', False, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Sciences', 'SCI', 'CORE', True, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Arts', 'ART', 'EXTRA_CURRICULAR', True, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Design', 'DES', 'CORE', True, False),
    ('IB', 'MIDDLE', 'GENERAL', 'Physical & Health Education', 'PHE', 'EXTRA_CURRICULAR', True, False),

    # DP - Diploma Programme (Senior Secondary equivalent)
    # Group 1 - Studies in Language & Literature
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'English A: Language & Literature', 'ENG-LL', 'CORE', False, False),
    # Group 2 - Language Acquisition
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Language Acquisition', 'LA', 'CORE', False, False),
    # Group 3 - Individuals & Societies
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'History', 'HIS', 'ELECTIVE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Geography', 'GEO', 'ELECTIVE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Economics', 'ECO', 'ELECTIVE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Psychology', 'PSY', 'ELECTIVE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Business Management', 'BM', 'ELECTIVE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Global Politics', 'GP', 'ELECTIVE', False, False),
    # Group 4 - Sciences
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Physics', 'PHY', 'ELECTIVE', True, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Chemistry', 'CHE', 'ELECTIVE', True, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Biology', 'BIO', 'ELECTIVE', True, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Computer Science', 'CS', 'ELECTIVE', True, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Environmental Systems & Societies', 'ESS', 'ELECTIVE', True, False),
    # Group 5 - Mathematics
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Mathematics: Analysis & Approaches', 'MAT-AA', 'CORE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Mathematics: Applications & Interpretation', 'MAT-AI', 'CORE', False, False),
    # Group 6 - Arts
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Visual Arts', 'VA', 'ELECTIVE', True, True),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Music', 'MUS', 'ELECTIVE', True, True),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Theatre', 'THE', 'ELECTIVE', True, True),
    # Core (Mandatory)
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Theory of Knowledge', 'TOK', 'CORE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'Extended Essay', 'EE', 'CORE', False, False),
    ('IB', 'SENIOR_SECONDARY', 'IB_GROUP', 'CAS (Creativity, Activity, Service)', 'CAS', 'CORE', False, False),

    # =====================================================================
    # MPBSE (Madhya Pradesh Board) - follows State Board template with specifics
    # =====================================================================

    # PRIMARY (Class 1-5)
    ('MPBSE', 'PRIMARY', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'English', 'ENG', 'LANGUAGE', False, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'Environmental Studies', 'EVS', 'CORE', False, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'General Science', 'GS', 'CORE', False, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'Computer Studies', 'CS', 'CORE', True, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'Art', 'ART', 'EXTRA_CURRICULAR', True, False),
    ('MPBSE', 'PRIMARY', 'GENERAL', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, False),

    # MIDDLE (Class 6-8)
    ('MPBSE', 'MIDDLE', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, False),
    ('MPBSE', 'MIDDLE', 'GENERAL', 'English', 'ENG', 'LANGUAGE', False, False),
    ('MPBSE', 'MIDDLE', 'GENERAL', 'Sanskrit', 'SAN', 'LANGUAGE', False, True),
    ('MPBSE', 'MIDDLE', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('MPBSE', 'MIDDLE', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('MPBSE', 'MIDDLE', 'GENERAL', 'Social Science', 'SST', 'CORE', False, False),

    # SECONDARY (Class 9-10)
    ('MPBSE', 'SECONDARY', 'GENERAL', 'Hindi', 'HIN', 'LANGUAGE', False, False),
    ('MPBSE', 'SECONDARY', 'GENERAL', 'English', 'ENG', 'LANGUAGE', False, False),
    ('MPBSE', 'SECONDARY', 'GENERAL', 'Sanskrit', 'SAN', 'LANGUAGE', False, True),
    ('MPBSE', 'SECONDARY', 'GENERAL', 'Mathematics', 'MAT', 'CORE', False, False),
    ('MPBSE', 'SECONDARY', 'GENERAL', 'Science', 'SCI', 'CORE', True, False),
    ('MPBSE', 'SECONDARY', 'GENERAL', 'Social Science', 'SST', 'CORE', False, False),
    ('MPBSE', 'SECONDARY', 'VOC', 'Computer Science', 'CS', 'ELECTIVE', True, True),
    ('MPBSE', 'SECONDARY', 'VOC', 'Physical Education', 'PE', 'EXTRA_CURRICULAR', True, True),

    # SENIOR SECONDARY (Class 11-12) - Science
    ('MPBSE', 'SENIOR_SECONDARY', 'SCI', 'Physics', 'PHY', 'CORE', True, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'SCI', 'Chemistry', 'CHE', 'CORE', True, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'SCI', 'Mathematics', 'MAT', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'SCI', 'Biology', 'BIO', 'CORE', True, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'SCI', 'Computer Science', 'CS', 'ELECTIVE', True, True),

    # SENIOR SECONDARY (Class 11-12) - Commerce
    ('MPBSE', 'SENIOR_SECONDARY', 'COM', 'Accountancy', 'ACC', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'COM', 'Business Studies', 'BS', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'COM', 'Economics', 'ECO', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'COM', 'Mathematics', 'MAT', 'ELECTIVE', False, True),

    # SENIOR SECONDARY (Class 11-12) - Humanities/Arts
    ('MPBSE', 'SENIOR_SECONDARY', 'HUM', 'History', 'HIS', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'HUM', 'Political Science', 'POL', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'HUM', 'Geography', 'GEO', 'CORE', False, False),
    ('MPBSE', 'SENIOR_SECONDARY', 'HUM', 'Sociology', 'SOC', 'ELECTIVE', False, True),
    ('MPBSE', 'SENIOR_SECONDARY', 'HUM', 'Economics', 'ECO', 'ELECTIVE', False, True),
]


# Board definitions: (board_code, board_name, board_type)
BOARD_DEFINITIONS = [
    ('CBSE', 'Central Board of Secondary Education', 'CBSE'),
    ('ICSE', 'Indian Certificate of Secondary Education', 'ICSE'),
    ('MPBSE', 'Madhya Pradesh Board of Secondary Education', 'MPBSE'),
    ('STATE', 'State Board (Generic)', 'STATE'),
    ('IB', 'International Baccalaureate', 'IB'),
]


class Command(BaseCommand):
    help = 'Seed subjects for all boards with class group and stream classification'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing subjects before seeding',
        )

    def handle(self, *args, **options):
        schema_name = connection.schema_name
        self.stdout.write(f'Seeding subjects on schema: {schema_name}')

        if options['clear']:
            deleted_count = Subject.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'Cleared {deleted_count} existing subjects'))

        # Ensure all boards exist, matching by board_code
        boards = {}
        for board_code, board_name, board_type in BOARD_DEFINITIONS:
            board = Board.objects.filter(board_code=board_code, is_deleted=False).first()
            if not board:
                # Try matching by board_type
                board = Board.objects.filter(board_type=board_type, is_deleted=False).first()
            if not board:
                # Create the board
                # Use a board_type that exists in choices, fall back to OTHER
                valid_types = [c[0] for c in Board.BOARD_TYPE_CHOICES]
                bt = board_type if board_type in valid_types else 'OTHER'
                board, created = Board.objects.get_or_create(
                    board_code=board_code,
                    defaults={
                        'board_type': bt,
                        'board_name': board_name,
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Created board: {board_name} ({board_code})'))
            boards[board_code] = board

        created_count = 0
        skipped_count = 0

        for entry in SUBJECT_DATA:
            board_code, class_group, stream, name, code_suffix, subject_type, has_practical, is_optional = entry

            board = boards.get(board_code)
            if not board:
                self.stdout.write(self.style.WARNING(
                    f'  Board "{board_code}" not found, skipping {name}'
                ))
                skipped_count += 1
                continue

            # Generate unique code: BOARD-CLASSGROUP-STREAM-CODESUFFIX
            code = f'{board_code}-{class_group[:3]}-{stream[:3]}-{code_suffix}'

            # Check if subject already exists
            if Subject.objects.filter(code=code).exists():
                skipped_count += 1
                continue

            Subject.objects.create(
                name=name,
                code=code,
                subject_type=subject_type,
                class_group=class_group,
                stream=stream,
                board=board,
                theory_max_marks=100,
                practical_max_marks=50 if has_practical else 0,
                has_practical=has_practical,
                is_optional=is_optional,
                is_active=True,
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done! Created {created_count} subjects, skipped {skipped_count} (already exist or board missing)'
        ))

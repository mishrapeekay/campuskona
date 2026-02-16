from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.students.models import (
    Student,
    StudentDocument,
    StudentParent,
    StudentHealthRecord,
    StudentNote
)
from apps.authentication.serializers import UserSerializer
from apps.core.encryption import (
    mask_aadhar,
    mask_samagra_family_id,
    mask_samagra_member_id
)

User = get_user_model()
try:
    from apps.academics.models import StudentEnrollment
except ImportError:
    StudentEnrollment = None


class StudentSerializer(serializers.ModelSerializer):
    """
    Student serializer with user account information
    Includes masked sensitive data for parent/student views
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    current_class = serializers.SerializerMethodField()

    # Masked fields for display (DPDP compliance)
    aadhar_number_masked = serializers.SerializerMethodField()
    samagra_family_id_masked = serializers.SerializerMethodField()
    samagra_member_id_masked = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = [
            'id',
            'admission_number',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_age(self, obj):
        return obj.get_age()

    def get_aadhar_number_masked(self, obj):
        """Return masked Aadhar number (XXXXXXXX9012)"""
        return mask_aadhar(obj.aadhar_number) if obj.aadhar_number else None

    def get_samagra_family_id_masked(self, obj):
        """Return masked Samagra Family ID (XXXX5678)"""
        return mask_samagra_family_id(obj.samagra_family_id) if obj.samagra_family_id else None

    def get_samagra_member_id_masked(self, obj):
        """Return masked Samagra Member ID (XXXXX6789)"""
        return mask_samagra_member_id(obj.samagra_member_id) if obj.samagra_member_id else None

    def get_current_class(self, obj):
        """
        Get current class - returns None if enrollment not implemented
        """
        try:
            if hasattr(obj, 'get_current_class_enrollment'):
                enrollment = obj.get_current_class_enrollment()
                if enrollment and hasattr(enrollment, 'class_section'):
                    return {
                        'id': str(enrollment.id),
                        'class_name': enrollment.class_section.get_full_name(),
                        'academic_year': str(enrollment.academic_year)
                    }
        except Exception:
            pass
        return None


class StudentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new student with user account
    """
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)
    # Override phone fields to remove strict validator
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True, allow_null=True)
    emergency_contact_number = serializers.CharField(max_length=15, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Student
        exclude = ['user', 'is_deleted', 'deleted_at']
        read_only_fields = ['id', 'admission_number', 'created_at', 'updated_at']
        extra_kwargs = {
            # All non-essential fields are optional on create
            'photo': {'required': False, 'allow_null': True},
            'middle_name': {'required': False, 'allow_blank': True},
            'blood_group': {'required': False, 'allow_blank': True},
            'aadhar_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'current_address_line1': {'required': False, 'allow_blank': True, 'allow_null': True},
            'current_address_line2': {'required': False, 'allow_blank': True, 'allow_null': True},
            'current_city': {'required': False, 'allow_blank': True, 'allow_null': True},
            'current_state': {'required': False, 'allow_blank': True, 'allow_null': True},
            'current_pincode': {'required': False, 'allow_blank': True, 'allow_null': True},
            'permanent_address_line1': {'required': False, 'allow_blank': True, 'allow_null': True},
            'permanent_address_line2': {'required': False, 'allow_blank': True, 'allow_null': True},
            'permanent_city': {'required': False, 'allow_blank': True, 'allow_null': True},
            'permanent_state': {'required': False, 'allow_blank': True, 'allow_null': True},
            'permanent_pincode': {'required': False, 'allow_blank': True, 'allow_null': True},
            'father_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'father_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'father_occupation': {'required': False, 'allow_blank': True, 'allow_null': True},
            'mother_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'mother_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'mother_occupation': {'required': False, 'allow_blank': True, 'allow_null': True},
            'guardian_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'guardian_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'guardian_relation': {'required': False, 'allow_blank': True, 'allow_null': True},
            'emergency_contact_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'emergency_contact_relation': {'required': False, 'allow_blank': True, 'allow_null': True},
            'category': {'required': False, 'allow_blank': True},
            'religion': {'required': False, 'allow_blank': True},
            'nationality': {'required': False, 'allow_blank': True},
            'previous_school_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'previous_school_board': {'required': False, 'allow_blank': True, 'allow_null': True},
            'transfer_certificate_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'house': {'required': False, 'allow_blank': True},
            'roll_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'medical_conditions': {'required': False, 'allow_blank': True, 'allow_null': True},
            'allergies': {'required': False, 'allow_blank': True, 'allow_null': True},
            'special_needs': {'required': False, 'allow_blank': True, 'allow_null': True},
            'samagra_family_id': {'required': False, 'allow_blank': True, 'allow_null': True},
            'samagra_member_id': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate_aadhar_number(self, value):
        """Check if Aadhar number already exists"""
        if value and Student.objects.filter(aadhar_number=value).exists():
            raise serializers.ValidationError("Student with this Aadhar number already exists")
        return value

    def validate_samagra_member_id(self, value):
        """Check if Samagra Member ID already exists"""
        if value and Student.objects.filter(samagra_member_id=value).exists():
            raise serializers.ValidationError("Student with this Samagra Member ID already exists")
        return value

    def validate(self, data):
        """Cross-field validation for Samagra IDs"""
        # If member ID is provided, family ID should also be provided
        samagra_member_id = data.get('samagra_member_id')
        samagra_family_id = data.get('samagra_family_id')

        if samagra_member_id and not samagra_family_id:
            raise serializers.ValidationError({
                'samagra_family_id': 'Samagra Family ID is required when Samagra Member ID is provided'
            })

        return data

    def create(self, validated_data):
        """Create student with linked user account"""
        import uuid, re
        email = validated_data.pop('email', None) or f'student_{uuid.uuid4().hex[:8]}@placeholder.local'
        password = validated_data.pop('password', None)

        # User.phone must be a valid unique 10-digit Indian number.
        # Use the student's phone_number if valid, else generate a unique placeholder.
        raw_phone = validated_data.get('phone_number', '') or ''
        if re.match(r'^[6-9]\d{9}$', str(raw_phone)):
            phone = raw_phone
        else:
            phone = '9' + str(int(uuid.uuid4().int % 10**9)).zfill(9)

        # Create user account
        user = User.objects.create_user(
            email=email,
            password=password or User.objects.make_random_password(),
            user_type='STUDENT',
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=phone,
            is_active=True
        )

        # Create student profile
        student = Student.objects.create(user=user, **validated_data)
        return student


class StudentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating student information
    """
    # Override phone fields to remove strict validator — seed data has placeholder values
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True, allow_null=True)
    emergency_contact_number = serializers.CharField(max_length=15, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Student
        exclude = ['user', 'admission_number', 'is_deleted', 'deleted_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            # Photo is optional on update — only sent when a new file is uploaded
            'photo': {'required': False, 'allow_null': True},
        }

    def validate_aadhar_number(self, value):
        """Check if Aadhar number already exists for other students"""
        if value:
            existing = Student.objects.filter(aadhar_number=value).exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError("Student with this Aadhar number already exists")
        return value

    def validate_samagra_member_id(self, value):
        """Check if Samagra Member ID already exists for other students"""
        if value:
            existing = Student.objects.filter(samagra_member_id=value).exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError("Student with this Samagra Member ID already exists")
        return value

    def validate(self, data):
        """Cross-field validation for Samagra IDs"""
        # If member ID is provided, family ID should also be provided
        samagra_member_id = data.get('samagra_member_id')
        samagra_family_id = data.get('samagra_family_id')

        if samagra_member_id and not samagra_family_id:
            raise serializers.ValidationError({
                'samagra_family_id': 'Samagra Family ID is required when Samagra Member ID is provided'
            })

        return data


class StudentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for student lists
    """
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()
    roll_number = serializers.SerializerMethodField()
    board = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id',
            'admission_number',
            'full_name',
            'first_name',
            'last_name',
            'date_of_birth',
            'age',
            'gender',
            'photo',
            'admission_date',
            'admission_status',
            'class_name',
            'section_name',
            'roll_number',
            'board',
            'phone_number',
            'email'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_age(self, obj):
        return obj.get_age()

    def _get_active_enrollment(self, obj):
        if hasattr(obj, '_active_enrollment_cache'):
            return obj._active_enrollment_cache
        
        if StudentEnrollment:
             enrollment = obj.class_enrollments.filter(is_active=True).first()
             obj._active_enrollment_cache = enrollment
             return enrollment
        return None

    def get_class_name(self, obj):
        enrollment = self._get_active_enrollment(obj)
        if enrollment and enrollment.section:
            return enrollment.section.class_instance.display_name
        return "-"

    def get_section_name(self, obj):
        enrollment = self._get_active_enrollment(obj)
        if enrollment and enrollment.section:
            return enrollment.section.name
        return "-"

    def get_roll_number(self, obj):
        enrollment = self._get_active_enrollment(obj)
        if enrollment:
            return enrollment.roll_number
        return "-"

    def get_board(self, obj):
        enrollment = self._get_active_enrollment(obj)
        if enrollment and enrollment.section:
            return enrollment.section.class_instance.board.board_code
        return "-"


class StudentDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for student documents
    """
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentDocument
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'verified_by',
            'verified_at',
            'is_deleted',
            'deleted_at',
        ]

    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return obj.verified_by.get_full_name()
        return None


class StudentParentSerializer(serializers.ModelSerializer):
    """
    Serializer for student-parent relationships
    """
    parent_details = UserSerializer(source='parent', read_only=True)
    student_details = StudentListSerializer(source='student', read_only=True)

    class Meta:
        model = StudentParent
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def validate(self, data):
        """Ensure parent user type is PARENT"""
        if data.get('parent') and data['parent'].user_type != 'PARENT':
            raise serializers.ValidationError({
                'parent': 'Selected user is not a parent account'
            })
        return data


class StudentParentCreateSerializer(serializers.Serializer):
    """
    Serializer for creating parent and linking to student
    """
    student_id = serializers.UUIDField()
    relation = serializers.ChoiceField(choices=StudentParent.RELATION_CHOICES)
    is_primary_contact = serializers.BooleanField(default=False)
    is_emergency_contact = serializers.BooleanField(default=False)
    can_pickup = serializers.BooleanField(default=True)

    # Parent details
    parent_email = serializers.EmailField()
    parent_first_name = serializers.CharField(max_length=150)
    parent_last_name = serializers.CharField(max_length=150)
    parent_phone = serializers.CharField(max_length=10)
    parent_password = serializers.CharField(write_only=True, required=False)

    def validate_parent_email(self, value):
        """Check if parent email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate_student_id(self, value):
        """Check if student exists"""
        if not Student.objects.filter(id=value).exists():
            raise serializers.ValidationError("Student not found")
        return value

    def create(self, validated_data):
        """Create parent user and link to student"""
        student_id = validated_data.pop('student_id')
        relation = validated_data.pop('relation')
        is_primary_contact = validated_data.pop('is_primary_contact')
        is_emergency_contact = validated_data.pop('is_emergency_contact')
        can_pickup = validated_data.pop('can_pickup')

        # Create parent user account
        parent = User.objects.create_user(
            email=validated_data['parent_email'],
            password=validated_data.get('parent_password') or User.objects.make_random_password(),
            user_type='PARENT',
            first_name=validated_data['parent_first_name'],
            last_name=validated_data['parent_last_name'],
            phone_number=validated_data['parent_phone'],
            is_active=True
        )

        # Link parent to student
        student = Student.objects.get(id=student_id)
        student_parent = StudentParent.objects.create(
            student=student,
            parent=parent,
            relation=relation,
            is_primary_contact=is_primary_contact,
            is_emergency_contact=is_emergency_contact,
            can_pickup=can_pickup
        )

        return student_parent


class StudentHealthRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for student health records
    """
    class Meta:
        model = StudentHealthRecord
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]


class StudentNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for student notes
    """
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentNote
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'created_by',
            'is_deleted',
            'deleted_at',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None


class StudentBulkUploadSerializer(serializers.Serializer):
    """
    Serializer for bulk student upload via CSV/Excel
    """
    file = serializers.FileField()

    def validate_file(self, value):
        """Validate file type"""
        allowed_extensions = ['.csv', '.xlsx', '.xls']
        file_extension = value.name[value.name.rfind('.'):].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        return value

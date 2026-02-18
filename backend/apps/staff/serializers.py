from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.staff.models import (
    StaffMember,
    StaffDocument,
    # StaffAttendance and StaffLeave moved to attendance app
    StaffQualification,
    StaffExperience
)
from apps.authentication.serializers import UserSerializer

User = get_user_model()


class StaffMemberSerializer(serializers.ModelSerializer):
    """
    Staff member serializer with user account information
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    total_experience = serializers.SerializerMethodField()

    class Meta:
        model = StaffMember
        fields = '__all__'
        read_only_fields = [
            'id',
            'employee_id',
            'created_at',
            'updated_at',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_age(self, obj):
        return obj.get_age()

    def get_total_experience(self, obj):
        return obj.get_total_experience()


class StaffMemberCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new staff member with user account
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=False)
    user_type = serializers.ChoiceField(
        choices=['TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_MANAGER'],
        required=True
    )
    # Override phone fields to remove strict validator
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    alternate_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    emergency_contact_number = serializers.CharField(max_length=15, required=False, allow_blank=True)

    class Meta:
        model = StaffMember
        exclude = ['user']
        read_only_fields = ['id', 'employee_id', 'created_at', 'updated_at']
        extra_kwargs = {
            # Make address and emergency contact fields optional on create
            'emergency_contact_name': {'required': False, 'allow_blank': True},
            'emergency_contact_relation': {'required': False, 'allow_blank': True},
            'current_address_line1': {'required': False, 'allow_blank': True},
            'current_address_line2': {'required': False, 'allow_blank': True},
            'current_city': {'required': False, 'allow_blank': True},
            'current_state': {'required': False, 'allow_blank': True},
            'current_pincode': {'required': False, 'allow_blank': True},
            'permanent_address_line1': {'required': False, 'allow_blank': True},
            'permanent_address_line2': {'required': False, 'allow_blank': True},
            'permanent_city': {'required': False, 'allow_blank': True},
            'permanent_state': {'required': False, 'allow_blank': True},
            'permanent_pincode': {'required': False, 'allow_blank': True},
            'photo': {'required': False, 'allow_null': True},
        }

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate_aadhar_number(self, value):
        """Check if Aadhar number already exists"""
        if value and StaffMember.objects.filter(aadhar_number=value).exists():
            raise serializers.ValidationError("Staff member with this Aadhar number already exists")
        return value

    def validate_pan_number(self, value):
        """Check if PAN number already exists"""
        if value and StaffMember.objects.filter(pan_number=value).exists():
            raise serializers.ValidationError("Staff member with this PAN number already exists")
        return value

    def create(self, validated_data):
        """Create staff member with linked user account"""
        import uuid
        email = validated_data.pop('email')
        password = validated_data.pop('password', None)
        user_type = validated_data.pop('user_type')

        # User.phone field is required and must pass the Indian 10-digit validator.
        # Use the staff phone_number if it looks valid, otherwise generate a unique
        # 10-digit placeholder starting with 9 so the user account can be created.
        raw_phone = validated_data.get('phone_number', '') or ''
        import re
        if re.match(r'^[6-9]\d{9}$', str(raw_phone)):
            phone = raw_phone
        else:
            # Derive a unique 10-digit placeholder from uuid (starts with 9)
            phone = '9' + str(int(uuid.uuid4().int % 10**9)).zfill(9)

        # Create user account
        user = User.objects.create_user(
            email=email,
            password=password or User.objects.make_random_password(),
            user_type=user_type,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=phone,
            is_active=True
        )

        # Create staff profile
        staff_member = StaffMember.objects.create(user=user, **validated_data)
        return staff_member


class StaffMemberUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating staff information
    """
    # Override phone fields to remove the strict Indian format validator —
    # seed data contains placeholder values like '9-EMP-0043'. Real validation
    # should happen on the frontend form instead.
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    alternate_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    emergency_contact_number = serializers.CharField(max_length=15, required=False, allow_blank=True)

    class Meta:
        model = StaffMember
        exclude = ['user', 'employee_id']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            # Address and emergency contact fields are not always available —
            # allow empty values so partial staff profiles can be saved.
            'emergency_contact_name': {'required': False, 'allow_blank': True},
            'emergency_contact_relation': {'required': False, 'allow_blank': True},
            'current_address_line1': {'required': False, 'allow_blank': True},
            'current_city': {'required': False, 'allow_blank': True},
            'current_state': {'required': False, 'allow_blank': True},
            'current_pincode': {'required': False, 'allow_blank': True},
            'permanent_address_line1': {'required': False, 'allow_blank': True},
            'permanent_city': {'required': False, 'allow_blank': True},
            'permanent_state': {'required': False, 'allow_blank': True},
            'permanent_pincode': {'required': False, 'allow_blank': True},
            # Photo is optional on update — only sent when a new file is uploaded
            'photo': {'required': False, 'allow_null': True},
        }

    def validate_aadhar_number(self, value):
        """Check if Aadhar number already exists for other staff"""
        if value:
            existing = StaffMember.objects.filter(aadhar_number=value).exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError("Staff member with this Aadhar number already exists")
        return value

    def validate_pan_number(self, value):
        """Check if PAN number already exists for other staff"""
        if value:
            existing = StaffMember.objects.filter(pan_number=value).exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError("Staff member with this PAN number already exists")
        return value


class StaffMemberListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for staff lists
    """
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()

    class Meta:
        model = StaffMember
        fields = [
            'id',
            'employee_id',
            'full_name',
            'first_name',
            'last_name',
            'designation',
            'department',
            'date_of_birth',
            'age',
            'gender',
            'photo',
            'joining_date',
            'employment_type',
            'employment_status',
            'phone_number',
            'email',
            'subjects_taught',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_age(self, obj):
        return obj.get_age()


class StaffDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for staff documents
    """
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StaffDocument
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'verified_by',
            'verified_at',
        ]

    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return obj.verified_by.get_full_name()
        return None


# NOTE: StaffAttendanceSerializer and StaffLeaveSerializer have been moved to apps.attendance.serializers

class StaffQualificationSerializer(serializers.ModelSerializer):
    """
    Serializer for staff qualifications
    """
    class Meta:
        model = StaffQualification
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


class StaffExperienceSerializer(serializers.ModelSerializer):
    """
    Serializer for staff work experience
    """
    duration_years = serializers.SerializerMethodField()

    class Meta:
        model = StaffExperience
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

    def get_duration_years(self, obj):
        return obj.get_duration_years()

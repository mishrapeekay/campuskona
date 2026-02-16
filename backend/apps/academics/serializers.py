from rest_framework import serializers
from apps.academics.models import (
    AcademicYear,
    Board,
    Subject,
    Class,
    Section,
    ClassSubject,
    StudentEnrollment,
    StudentSubject,
    SyllabusUnit,
    LessonPlan,
    LessonPlanItem
)
from apps.students.serializers import StudentListSerializer
from apps.staff.serializers import StaffMemberListSerializer


class AcademicYearSerializer(serializers.ModelSerializer):
    """
    Serializer for Academic Year
    """
    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def validate(self, data):
        """Validate academic year dates"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date'
                })
        return data


class BoardSerializer(serializers.ModelSerializer):
    """
    Serializer for Board
    """
    class Meta:
        model = Board
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Subject
    """
    board_name = serializers.SerializerMethodField()
    total_max_marks = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def get_board_name(self, obj):
        if obj.board:
            return obj.board.board_name
        return 'All Boards'

    def get_total_max_marks(self, obj):
        return obj.get_total_max_marks()


class ClassSerializer(serializers.ModelSerializer):
    """
    Serializer for Class
    """
    board_details = BoardSerializer(source='board', read_only=True)
    section_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def get_section_count(self, obj):
        return obj.sections.filter(is_deleted=False, is_active=True).count()


class SectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Section
    """
    class_details = ClassSerializer(source='class_instance', read_only=True)
    class_teacher_details = StaffMemberListSerializer(source='class_teacher', read_only=True)
    academic_year_details = AcademicYearSerializer(source='academic_year', read_only=True)
    full_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_student_count(self, obj):
        return obj.get_student_count()

    def get_is_full(self, obj):
        return obj.is_full()


class SectionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for section lists
    """
    class_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            'id',
            'name',
            'class_name',
            'full_name',
            'academic_year',
            'room_number',
            'max_students',
            'student_count',
            'is_active'
        ]

    def get_class_name(self, obj):
        return obj.class_instance.display_name

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_student_count(self, obj):
        return obj.get_student_count()


class ClassSubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Class-Subject mapping
    """
    class_details = ClassSerializer(source='class_instance', read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)
    teacher_details = StaffMemberListSerializer(source='teacher', read_only=True)
    academic_year_details = AcademicYearSerializer(source='academic_year', read_only=True)

    class Meta:
        model = ClassSubject
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Student Enrollment
    """
    student_details = StudentListSerializer(source='student', read_only=True)
    section_details = SectionListSerializer(source='section', read_only=True)
    academic_year_details = AcademicYearSerializer(source='academic_year', read_only=True)

    class Meta:
        model = StudentEnrollment
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]

    def validate(self, data):
        """Validate enrollment"""
        section = data.get('section')
        academic_year = data.get('academic_year')

        if section and academic_year:
            # Check if section belongs to academic year
            if section.academic_year != academic_year:
                raise serializers.ValidationError({
                    'section': 'Section does not belong to the selected academic year'
                })

            # Check if section is full
            if section.is_full():
                raise serializers.ValidationError({
                    'section': 'Section is at maximum capacity'
                })

        return data


class StudentSubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Student Subject selection
    """
    subject_details = SubjectSerializer(source='subject', read_only=True)
    enrollment_details = StudentEnrollmentSerializer(source='enrollment', read_only=True)

    class Meta:
        model = StudentSubject
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]


class SyllabusUnitSerializer(serializers.ModelSerializer):
    """
    Serializer for Syllabus Unit
    """
    class Meta:
        model = SyllabusUnit
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'deleted_at']


class LessonPlanItemSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson Plan Item
    """
    syllabus_unit_title = serializers.CharField(source='syllabus_unit.title', read_only=True)
    
    class Meta:
        model = LessonPlanItem
        fields = '__all__'
        read_only_fields = ['id', 'lesson_plan', 'created_at', 'updated_at', 'deleted_at']


class LessonPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson Plan
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    items = LessonPlanItemSerializer(many=True, required=False)

    class Meta:
        model = LessonPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'deleted_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        lesson_plan = LessonPlan.objects.create(**validated_data)
        
        for item_data in items_data:
            LessonPlanItem.objects.create(lesson_plan=lesson_plan, **item_data)
            
        return lesson_plan

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update lesson plan fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update items if provided
        if items_data is not None:
            # Delete existing items - simple replacement strategy
            instance.items.all().delete()
            # Create new items
            for item_data in items_data:
                LessonPlanItem.objects.create(lesson_plan=instance, **item_data)
                
        return instance


class SyllabusCompletionSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    total_units = serializers.IntegerField()
    completed_units = serializers.IntegerField()
    coverage_percentage = serializers.FloatField()

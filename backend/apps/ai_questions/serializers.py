from rest_framework import serializers
from .models import QuestionBank, MCQOption


class MCQOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQOption
        fields = ['id', 'option_text', 'is_correct', 'display_order']


class QuestionBankSerializer(serializers.ModelSerializer):
    options = MCQOptionSerializer(many=True, read_only=True)
    subject_name = serializers.ReadOnlyField(source='subject.name')
    class_name = serializers.ReadOnlyField(source='class_obj.display_name')

    class Meta:
        model = QuestionBank
        fields = [
            'id', 'subject', 'subject_name', 'class_obj', 'class_name',
            'syllabus_unit', 'lesson_plan_item', 'question_text',
            'question_type', 'bloom_level', 'difficulty', 'marks',
            'explanation', 'is_ai_generated', 'options', 'is_active',
            'created_at'
        ]


class AIQuestionGenerateSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    class_id = serializers.IntegerField()
    syllabus_unit_id = serializers.IntegerField(required=False, allow_null=True)
    lesson_plan_item_id = serializers.IntegerField(required=False, allow_null=True)
    count = serializers.IntegerField(default=5, min_value=1, max_value=20)
    bloom_levels = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    content_text = serializers.CharField(required=False) # Manual content if needed

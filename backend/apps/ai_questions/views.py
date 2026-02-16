from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import QuestionBank, MCQOption
from .serializers import (
    QuestionBankSerializer, MCQOptionSerializer, AIQuestionGenerateSerializer
)
from .services.question_generator import QuestionGeneratorService
from apps.academics.models import Subject, Class, SyllabusUnit, LessonPlanItem


class QuestionBankViewSet(viewsets.ModelViewSet):
    """
    Manage the question bank
    """
    queryset = QuestionBank.objects.all()
    serializer_class = QuestionBankSerializer
    filterset_fields = ['subject', 'class_obj', 'bloom_level', 'difficulty', 'question_type']
    search_fields = ['question_text', 'explanation']

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_ai_questions(self, request):
        """
        API endpoint to trigger AI question generation
        """
        serializer = AIQuestionGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        subject = get_object_or_404(Subject, id=data['subject_id'])
        class_obj = get_object_or_404(Class, id=data['class_id'])
        
        # Get content text from either payload or linked models
        content_text = data.get('content_text', '')
        syllabus_unit = None
        lesson_item = None
        
        if not content_text:
            if data.get('lesson_plan_item_id'):
                lesson_item = get_object_or_404(LessonPlanItem, id=data['lesson_plan_item_id'])
                content_text = f"Topic: {lesson_item.topic}. Homework/Context: {lesson_item.homework}. resources: {lesson_item.resources_used}"
            elif data.get('syllabus_unit_id'):
                syllabus_unit = get_object_or_404(SyllabusUnit, id=data['syllabus_unit_id'])
                content_text = f"Title: {syllabus_unit.title}. Objectives: {syllabus_unit.learning_objectives}. Description: {syllabus_unit.description}"
        
        if not content_text:
            return Response(
                {"error": "Providing content text or a valid syllabus/lesson unit is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate questions
        generator = QuestionGeneratorService()
        questions_data = generator.generate_from_lesson_content(
            content_text, 
            subject.name, 
            class_obj.display_name,
            count=data['count'],
            bloom_levels=data.get('bloom_levels')
        )
        
        if not questions_data:
            return Response(
                {"error": "AI generation failed. Please check LLM configuration."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save questions if requested (or return for review)
        # For now, let's return them for review first, but provide an option to auto-save
        auto_save = request.query_params.get('save', 'false').lower() == 'true'
        
        if auto_save:
            saved_questions = generator.save_generated_questions(
                questions_data, 
                subject, 
                class_obj,
                syllabus_unit=syllabus_unit,
                lesson_item=lesson_item
            )
            return Response(
                QuestionBankSerializer(saved_questions, many=True).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(questions_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk-save')
    def bulk_save_questions(self, request):
        """
        Save multiple questions at once after review
        """
        # Implementation for bulk saving reviewed questions
        # This would expect the same format returned by the 'generate' endpoint
        # ...
        return Response({"message": "Bulk save not yet implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

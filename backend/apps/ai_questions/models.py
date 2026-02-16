from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel, TenantManager
from apps.academics.models import Subject, SyllabusUnit, LessonPlanItem, Class


class BloomTaxonomyLevel(models.TextChoices):
    REMEMBER = 'REMEMBER', 'Remember'
    UNDERSTAND = 'UNDERSTAND', 'Understand'
    APPLY = 'APPLY', 'Apply'
    ANALYZE = 'ANALYZE', 'Analyze'
    EVALUATE = 'EVALUATE', 'Evaluate'
    CREATE = 'CREATE', 'Create'


class QuestionDifficulty(models.TextChoices):
    EASY = 'EASY', 'Easy'
    MEDIUM = 'MEDIUM', 'Medium'
    HARD = 'HARD', 'Hard'


class QuestionType(models.TextChoices):
    MCQ = 'MCQ', 'Multiple Choice'
    TRUE_FALSE = 'TRUE_FALSE', 'True/False'
    SHORT_ANSWER = 'SHORT_ANSWER', 'Short Answer'
    LONG_ANSWER = 'LONG_ANSWER', 'Long Answer'


class QuestionBank(BaseModel):
    """
    Storing questions for exams and practice
    """
    objects = TenantManager()

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='questions')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='questions')
    syllabus_unit = models.ForeignKey(
        SyllabusUnit, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='questions'
    )
    lesson_plan_item = models.ForeignKey(
        LessonPlanItem, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='questions'
    )

    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20, 
        choices=QuestionType.choices, 
        default=QuestionType.MCQ
    )
    bloom_level = models.CharField(
        max_length=20, 
        choices=BloomTaxonomyLevel.choices, 
        default=BloomTaxonomyLevel.REMEMBER
    )
    difficulty = models.CharField(
        max_length=20, 
        choices=QuestionDifficulty.choices, 
        default=QuestionDifficulty.MEDIUM
    )
    
    marks = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    explanation = models.TextField(blank=True, help_text="Explanation for the correct answer")
    
    # AI Metadata
    is_ai_generated = models.BooleanField(default=False)
    ai_model = models.CharField(max_length=100, blank=True, null=True)
    ai_prompt_version = models.CharField(max_length=50, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ai_question_bank'
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.question_text[:50]}... ({self.bloom_level})"


class MCQOption(BaseModel):
    """
    Options for MCQ type questions
    """
    objects = TenantManager()

    question = models.ForeignKey(QuestionBank, on_delete=models.CASCADE, related_name='options')
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'ai_mcq_options'
        ordering = ['display_order']

    def __str__(self):
        return f"{self.option_text[:30]} ({'Correct' if self.is_correct else 'Incorrect'})"

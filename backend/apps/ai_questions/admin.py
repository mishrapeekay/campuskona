from django.contrib import admin
from .models import QuestionBank, MCQOption


class MCQOptionInline(admin.TabularInline):
    model = MCQOption
    extra = 4


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ('question_text_short', 'subject', 'class_obj', 'bloom_level', 'difficulty', 'is_ai_generated')
    list_filter = ('subject', 'class_obj', 'bloom_level', 'difficulty', 'is_ai_generated')
    search_fields = ('question_text', 'explanation')
    inlines = [MCQOptionInline]
    
    def question_text_short(self, obj):
        return obj.question_text[:50]
    question_text_short.short_description = 'Question'


@admin.register(MCQOption)
class MCQOptionAdmin(admin.ModelAdmin):
    list_display = ('option_text', 'question', 'is_correct', 'display_order')
    list_filter = ('is_correct',)
    search_fields = ('option_text', 'question__question_text')

import logging
from .llm_service import LLMService
from apps.ai_questions.models import BloomTaxonomyLevel, QuestionBank, MCQOption

logger = logging.getLogger('apps.ai_questions')

class QuestionGeneratorService:
    """
    Business logic for generating questions from lesson content
    """

    def __init__(self):
        self.llm = LLMService()

    def generate_from_lesson_content(self, content_text, subject_name, class_name, count=5, bloom_levels=None):
        """
        Generates questions based on provided text content.
        """
        if not bloom_levels:
            bloom_levels = [BloomTaxonomyLevel.REMEMBER, BloomTaxonomyLevel.UNDERSTAND, BloomTaxonomyLevel.APPLY]
        
        bloom_str = ", ".join(bloom_levels)
        
        system_prompt = f"""
        You are an expert educational content creator specializing in {subject_name} for {class_name}.
        Your task is to generate {count} high-quality Multiple Choice Questions (MCQs) based on Bloom's Taxonomy.
        
        Target Bloom's levels: {bloom_str}
        
        Rules:
        1. Each question must have exactly 4 options.
        2. Exactly one option must be correct.
        3. Provide a clear explanation for the correct answer.
        4. Categorize each question by Bloom's level and Difficulty (EASY, MEDIUM, HARD).
        5. Return ONLY a JSON object with the structure:
        {{
            "questions": [
                {{
                    "question_text": "...",
                    "options": [
                        {{"text": "...", "is_correct": true}},
                        {{"text": "...", "is_correct": false}},
                        ...
                    ],
                    "bloom_level": "...",
                    "difficulty": "...",
                    "explanation": "..."
                }}
            ]
        }}
        """
        
        user_prompt = f"""
        Lesson Content:
        ---
        {content_text}
        ---
        
        Generate {count} questions from the content above.
        """
        
        try:
            response_data = self.llm.generate_completion(user_prompt, system_prompt)
            return response_data.get('questions', [])
        except Exception as e:
            logger.error(f"Failed to generate questions: {e}")
            return []

    def save_generated_questions(self, questions_data, subject, class_obj, syllabus_unit=None, lesson_item=None):
        """
        Saves the generated questions to the database.
        """
        saved_questions = []
        for q_data in questions_data:
            try:
                question = QuestionBank.objects.create(
                    subject=subject,
                    class_obj=class_obj,
                    syllabus_unit=syllabus_unit,
                    lesson_plan_item=lesson_item,
                    question_text=q_data['question_text'],
                    question_type='MCQ',
                    bloom_level=q_data.get('bloom_level', BloomTaxonomyLevel.REMEMBER),
                    difficulty=q_data.get('difficulty', 'MEDIUM'),
                    explanation=q_data.get('explanation', ''),
                    is_ai_generated=True
                )
                
                for opt_data in q_data['options']:
                    MCQOption.objects.create(
                        question=question,
                        option_text=opt_data['text'],
                        is_correct=opt_data['is_correct']
                    )
                
                saved_questions.append(question)
            except Exception as e:
                logger.error(f"Error saving question: {e}")
                
        return saved_questions

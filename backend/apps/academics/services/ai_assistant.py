from apps.ai_questions.services.llm_service import LLMService
import json

class AIAssistantService:
    """
    AI Service for Academic assistance (Lesson planning, content generation).
    """
    
    @staticmethod
    def suggest_lesson_plan(subject_name, class_name, unit_title, unit_description):
        """
        Generates a structured lesson plan suggestion using AI.
        """
        prompt = f"""
        Act as an experienced curriculum designer. Generate a detailed lesson plan for a single class session.
        Subject: {subject_name}
        Grade: {class_name}
        Topic/Unit: {unit_title}
        Unit Content: {unit_description}
        
        Provide the output in valid JSON format with the following keys:
        - objectives: List of learning goals
        - duration: Total time in minutes
        - structure: List of segments (e.g., Introduction, Demonstration, Activity, Recap) with duration and description
        - assessment_questions: 3 questions to check student understanding
        - resources_needed: Equipment or material list
        """
        
        try:
            # Reusing the existing LLMService from ai_questions
            response_text = LLMService.get_completion(prompt)
            # In a real scenario, we'd clean the response to ensure it's pure JSON
            # For this MVP, we assume the LLM follows instructions.
            try:
                # Basic cleanup if needed
                start_index = response_text.find('{')
                end_index = response_text.rfind('}') + 1
                return json.loads(response_text[start_index:end_index])
            except:
                return {"error": "Failed to parse AI response into structure"}
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def generate_quiz_from_lesson(lesson_content):
        """
        Generates quiz questions based on the lesson content provided.
        """
        # (This could lead into the existing ai_questions generator)
        pass

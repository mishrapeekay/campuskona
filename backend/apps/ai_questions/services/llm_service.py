import logging
import json
from django.conf import settings
from decouple import config

logger = logging.getLogger('apps.ai_questions')

class LLMService:
    """
    Wrapper for LLM APIs (OpenAI / Claude)
    """
    
    def __init__(self, provider=None):
        self.provider = provider or config('LLM_PROVIDER', default='openai')
        self.api_key = config('OPENAI_API_KEY', default='') if self.provider == 'openai' else config('CLAUDE_API_KEY', default='')
        
    def generate_completion(self, prompt, system_prompt="You are an educational assistant.", temperature=0.7, max_tokens=1000):
        if not self.api_key:
            logger.warning(f"No API key found for {self.provider}. Returning mock response.")
            return self._mock_response(prompt)
            
        if self.provider == 'openai':
            return self._call_openai(prompt, system_prompt, temperature, max_tokens)
        elif self.provider == 'claude':
            return self._call_claude(prompt, system_prompt, temperature, max_tokens)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

    def _call_openai(self, prompt, system_prompt, temperature, max_tokens):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            
            response = client.chat.completions.create(
                model=config('OPENAI_MODEL', default='gpt-4o'),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={ "type": "json_object" } # Ensure JSON output
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            raise e

    def _call_claude(self, prompt, system_prompt, temperature, max_tokens):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            
            response = client.messages.create(
                model=config('CLAUDE_MODEL', default='claude-3-5-sonnet-20240620'),
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            # Claude doesn't have a direct JSON response format like OpenAI yet in the same way, 
            # so we'll have to parse it or hope it's clean JSON.
            content = response.content[0].text
            return json.loads(content)
        except Exception as e:
            logger.error(f"Error calling Claude API: {e}")
            raise e

    def _mock_response(self, prompt):
        """Mock response for testing without API keys"""
        # This is a very basic mock and should be improved or replaced with real API calls
        return {
            "questions": [
                {
                    "question_text": "Sample AI Question: What is the main objective of lesson content?",
                    "options": [
                        {"text": "Option A - Learning", "is_correct": True},
                        {"text": "Option B - Confusion", "is_correct": False},
                        {"text": "Option C - Nothing", "is_correct": False},
                        {"text": "Option D - Testing", "is_correct": False}
                    ],
                    "bloom_level": "UNDERSTAND",
                    "difficulty": "MEDIUM",
                    "explanation": "Mock explanation."
                }
            ]
        }

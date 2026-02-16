"""
AI Timetable Generation Services.

This package contains the core scheduling engine:
- constraints.py: Hard & soft constraint definitions
- generator.py: CSP backtracking solver for feasible timetables
- optimizer.py: Genetic algorithm for optimizing soft constraints
- validators.py: Pre/post generation validation
"""

from .apply import apply_generated_timetable, rollback_generated_timetable, analyze_generated_timetable

__all__ = [
    'apply_generated_timetable',
    'rollback_generated_timetable',
    'analyze_generated_timetable',
]

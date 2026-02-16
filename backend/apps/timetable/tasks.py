"""
Celery tasks for AI timetable generation.
"""

from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from django.utils import timezone


def update_progress(run, percent, message):
    """Update a generation run's progress."""
    run.progress_percent = percent
    run.progress_message = message
    run.save(update_fields=['progress_percent', 'progress_message'])


@shared_task(bind=True, max_retries=0, time_limit=600, soft_time_limit=540)
def generate_timetable_task(self, run_id):
    """
    Main Celery task for AI timetable generation.

    Pipeline:
    1. Validate inputs (0-10%)
    2. CSP generation — feasible timetable (10-60%)
    3. GA optimization — optimize soft constraints (60-90%)
    4. Finalize results (90-100%)

    Time limit: 10 minutes hard, 9 minutes soft.
    """
    from apps.timetable.models import TimetableGenerationRun

    run = TimetableGenerationRun.objects.select_related('config').get(id=run_id)
    run.celery_task_id = self.request.id
    run.status = 'VALIDATING'
    run.started_at = timezone.now()
    run.save(update_fields=['celery_task_id', 'status', 'started_at'])

    try:
        # ====== STEP 1: Validate (0-10%) ======
        update_progress(run, 2, 'Validating configuration...')

        from .services.validators import validate_generation_config, collect_generation_inputs

        errors = validate_generation_config(run.config)
        if errors:
            run.status = 'FAILED'
            run.error_message = '\n'.join(errors)
            run.completed_at = timezone.now()
            run.save(update_fields=['status', 'error_message', 'completed_at'])
            return

        update_progress(run, 5, 'Collecting generation inputs...')
        inputs = collect_generation_inputs(run.config)
        update_progress(run, 10, 'Validation complete.')

        # ====== STEP 2: CSP Generation (10-60%) ======
        run.status = 'GENERATING'
        run.save(update_fields=['status'])

        def csp_progress(pct, msg):
            # Map CSP progress (0-100) to overall (10-60)
            overall = 10 + int(pct * 0.5)
            update_progress(run, overall, msg)

        update_progress(run, 12, 'Building constraint model...')

        from .services.generator import TimetableGenerator

        generator = TimetableGenerator(inputs, progress_callback=csp_progress)
        feasible = generator.generate()

        if feasible is None:
            run.status = 'FAILED'
            run.error_message = (
                'No feasible timetable found with current constraints. '
                'Try: reducing subject periods, adding more teachers, '
                'or relaxing teacher availability.'
            )
            run.completed_at = timezone.now()
            run.duration_seconds = (run.completed_at - run.started_at).total_seconds()
            run.save(update_fields=[
                'status', 'error_message', 'completed_at', 'duration_seconds'
            ])
            return

        update_progress(run, 60, 'Feasible timetable generated.')

        # ====== STEP 3: Optimization (60-90%) ======
        algorithm = run.config.algorithm

        if algorithm in ('GENETIC', 'HYBRID'):
            run.status = 'OPTIMIZING'
            run.save(update_fields=['status'])

            def ga_progress(pct, msg):
                overall = 60 + int(pct * 0.3)
                update_progress(run, overall, msg)

            from .services.optimizer import TimetableOptimizer

            optimizer = TimetableOptimizer(
                feasible_timetable=feasible,
                inputs=inputs,
                config=run.config,
                progress_callback=ga_progress,
            )
            optimized, score = optimizer.optimize()
        else:
            # CSP-only mode: score the feasible timetable as-is
            from .services.optimizer import TimetableOptimizer
            optimizer = TimetableOptimizer(
                feasible_timetable=feasible,
                inputs=inputs,
                config=run.config,
            )
            optimized = feasible
            score = optimizer.fitness(feasible)

        update_progress(run, 90, 'Optimization complete.')

        # ====== STEP 4: Finalize (90-100%) ======
        update_progress(run, 95, 'Serializing results...')

        generated_data = _serialize_timetable(optimized, inputs)
        warnings = _generate_warnings(optimized, inputs)

        run.generated_timetable = generated_data
        run.fitness_score = round(score, 2)
        run.conflicts_found = 0  # Should be 0 if hard constraints satisfied
        run.warnings = warnings
        run.status = 'COMPLETED'
        run.completed_at = timezone.now()
        run.duration_seconds = (run.completed_at - run.started_at).total_seconds()
        run.progress_percent = 100
        run.progress_message = f'Complete. Score: {score:.1f}/100'
        run.save()

    except SoftTimeLimitExceeded:
        run.status = 'FAILED'
        run.error_message = (
            'Generation timed out (9 minute limit). '
            'Try fewer classes or simpler constraints.'
        )
        run.completed_at = timezone.now()
        if run.started_at:
            run.duration_seconds = (run.completed_at - run.started_at).total_seconds()
        run.save()

    except Exception as e:
        run.status = 'FAILED'
        run.error_message = str(e)
        run.completed_at = timezone.now()
        if run.started_at:
            run.duration_seconds = (run.completed_at - run.started_at).total_seconds()
        run.save()
        raise


def _serialize_timetable(timetable, inputs):
    """
    Convert internal timetable representation to JSON-serializable format.

    Output structure:
    {
        "sections": {
            "<section_id>": {
                "class_name": "Class 10",
                "section_name": "A",
                "days": {
                    "MONDAY": [
                        {
                            "slot_index": 0,
                            "slot_name": "Period 1",
                            "subject_id": "<id>",
                            "subject_name": "Mathematics",
                            "teacher_id": "<id>",
                            "room_id": "<id>"
                        }, ...
                    ]
                }
            }
        }
    }
    """
    sections_data = {}

    # Build section info lookup
    section_info = {s['id']: s for s in inputs['sections']}
    slot_info = {idx: s for idx, s in enumerate(inputs['slots'])}

    for section in inputs['sections']:
        sid = section['id']
        section_key = str(sid)
        days_data = {}

        for day in inputs['days']:
            day_entries = []
            for slot_idx in range(len(inputs['slots'])):
                assignment = timetable.get((sid, day, slot_idx))
                slot = slot_info.get(slot_idx, {})

                if assignment:
                    day_entries.append({
                        'slot_index': slot_idx,
                        'slot_id': slot.get('id'),
                        'slot_name': slot.get('name', f'Period {slot_idx + 1}'),
                        'subject_id': str(assignment['subject_id']) if assignment['subject_id'] else None,
                        'subject_name': assignment.get('subject_name', ''),
                        'teacher_id': str(assignment['teacher_id']) if assignment['teacher_id'] else None,
                        'room_id': str(assignment['room_id']) if assignment.get('room_id') else None,
                    })
                else:
                    day_entries.append({
                        'slot_index': slot_idx,
                        'slot_id': slot.get('id'),
                        'slot_name': slot.get('name', f'Period {slot_idx + 1}'),
                        'subject_id': None,
                        'subject_name': '',
                        'teacher_id': None,
                        'room_id': None,
                    })

            days_data[day] = day_entries

        sections_data[section_key] = {
            'class_name': section.get('class_name', ''),
            'section_name': section.get('name', ''),
            'days': days_data,
        }

    return {'sections': sections_data}


def _generate_warnings(timetable, inputs):
    """Generate warning messages for the completed timetable."""
    warnings = []

    # Check for empty slots
    for section in inputs['sections']:
        sid = section['id']
        empty_count = 0
        for day in inputs['days']:
            for slot_idx in range(len(inputs['slots'])):
                if timetable.get((sid, day, slot_idx)) is None:
                    empty_count += 1

        if empty_count > 0:
            warnings.append(
                f"{section.get('class_name', '')} {section.get('name', '')}: "
                f"{empty_count} empty period(s) in the week."
            )

    return warnings

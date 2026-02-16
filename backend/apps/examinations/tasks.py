"""
Celery tasks for AI exam schedule generation.
"""

from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from django.utils import timezone


def update_exam_progress(run, percent, message):
    """Update an exam schedule run's progress."""
    run.progress_percent = percent
    run.progress_message = message
    run.save(update_fields=['progress_percent', 'progress_message'])


@shared_task(bind=True, max_retries=0, time_limit=600, soft_time_limit=540)
def generate_exam_schedule_task(self, run_id):
    """
    Main Celery task for AI exam schedule generation.

    Pipeline:
    1. Validate inputs (0-10%)
    2. CSP generation — feasible schedule (10-60%)
    3. GA optimization — optimize soft constraints (60-90%)
    4. Finalize results (90-100%)

    Time limit: 10 minutes hard, 9 minutes soft.
    """
    from apps.examinations.models import ExamScheduleRun

    run = ExamScheduleRun.objects.select_related('config').get(id=run_id)
    run.celery_task_id = self.request.id
    run.status = 'VALIDATING'
    run.started_at = timezone.now()
    run.save(update_fields=['celery_task_id', 'status', 'started_at'])

    try:
        # ====== STEP 1: Validate (0-10%) ======
        update_exam_progress(run, 2, 'Validating configuration...')

        from .services.exam_schedule_validators import (
            validate_exam_schedule_config,
            collect_exam_inputs,
        )

        errors = validate_exam_schedule_config(run.config)
        if errors:
            run.status = 'FAILED'
            run.error_message = '\n'.join(errors)
            run.completed_at = timezone.now()
            run.save(update_fields=['status', 'error_message', 'completed_at'])
            return

        update_exam_progress(run, 5, 'Collecting inputs...')
        inputs = collect_exam_inputs(run.config)
        update_exam_progress(run, 10, 'Validation complete.')

        # ====== STEP 2: CSP Generation (10-60%) ======
        run.status = 'GENERATING'
        run.save(update_fields=['status'])

        def csp_progress(pct, msg):
            overall = 10 + int(pct * 0.5)
            update_exam_progress(run, overall, msg)

        update_exam_progress(run, 12, 'Building constraint model...')

        from .services.exam_scheduler import ExamScheduleGenerator

        generator = ExamScheduleGenerator(inputs, progress_callback=csp_progress)
        feasible = generator.generate()

        if feasible is None:
            run.status = 'FAILED'
            run.error_message = (
                'No feasible exam schedule found. Try: extending the date range, '
                'reducing minimum gap between exams, adding more exam halls, '
                'or allowing more exam days.'
            )
            run.completed_at = timezone.now()
            run.duration_seconds = (run.completed_at - run.started_at).total_seconds()
            run.save(update_fields=[
                'status', 'error_message', 'completed_at', 'duration_seconds'
            ])
            return

        update_exam_progress(run, 60, 'Feasible schedule generated.')

        # ====== STEP 3: Optimization (60-90%) ======
        algorithm = run.config.algorithm

        if algorithm in ('GENETIC', 'HYBRID'):
            run.status = 'OPTIMIZING'
            run.save(update_fields=['status'])

            def ga_progress(pct, msg):
                overall = 60 + int(pct * 0.3)
                update_exam_progress(run, overall, msg)

            from .services.exam_optimizer import ExamScheduleOptimizer

            optimizer = ExamScheduleOptimizer(
                feasible_schedule=feasible,
                inputs=inputs,
                config=run.config,
                progress_callback=ga_progress,
            )
            optimized, score = optimizer.optimize()
        else:
            from .services.exam_optimizer import ExamScheduleOptimizer
            optimizer = ExamScheduleOptimizer(
                feasible_schedule=feasible,
                inputs=inputs,
                config=run.config,
            )
            optimized = feasible
            score = optimizer.fitness(feasible)

        update_exam_progress(run, 90, 'Optimization complete.')

        # ====== STEP 4: Finalize (90-100%) ======
        update_exam_progress(run, 95, 'Serializing results...')

        generated_data = _serialize_exam_schedule(optimized, inputs)
        warnings = _generate_exam_warnings(optimized, inputs)

        run.generated_schedule = generated_data
        run.fitness_score = round(score, 2)
        run.conflicts_found = 0
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
            'Try fewer classes or a wider date range.'
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


def _serialize_exam_schedule(schedule, inputs):
    """
    Convert internal schedule to JSON-serializable format.

    Output structure:
    {
        "exams": [
            {
                "class_id": "<id>",
                "class_name": "Class 10",
                "subject_id": "<id>",
                "subject_name": "Mathematics",
                "date": "2026-03-15",
                "session": "MORNING",
                "hall_ids": ["<id>", ...],
                "section_ids": ["<id>", ...],
                "student_count": 120
            }, ...
        ],
        "summary": {
            "total_exams": 25,
            "total_days": 10,
            "date_range": {"start": "2026-03-15", "end": "2026-03-28"}
        }
    }
    """
    # Build lookup for exam info
    exam_info = {}
    for section in inputs['sections']:
        for subj in inputs['subjects'].get(section['class_id'], []):
            key = (section['class_id'], subj['subject_id'])
            if key not in exam_info:
                exam_info[key] = {
                    'class_id': section['class_id'],
                    'class_name': section.get('class_name', ''),
                    'subject_id': subj['subject_id'],
                    'subject_name': subj.get('subject_name', ''),
                    'duration_minutes': subj.get('duration_minutes', 180),
                    'max_marks': subj.get('max_marks', 100),
                    'min_passing_marks': subj.get('min_passing_marks', 33),
                    'section_ids': [],
                    'student_count': 0,
                }
            exam_info[key]['section_ids'].append(str(section['id']))
            exam_info[key]['student_count'] += section.get('student_count', 40)

    exams = []
    all_dates = set()

    for key, val in schedule.items():
        info = exam_info.get(key, {})
        exam_date = val['date']
        all_dates.add(exam_date)

        exams.append({
            'class_id': str(key[0]),
            'class_name': info.get('class_name', ''),
            'subject_id': str(key[1]),
            'subject_name': info.get('subject_name', ''),
            'date': exam_date.isoformat(),
            'session': val['session'],
            'hall_ids': [str(h) for h in val.get('hall_ids', [])],
            'section_ids': info.get('section_ids', []),
            'student_count': info.get('student_count', 0),
            'duration_minutes': info.get('duration_minutes', 180),
            'max_marks': info.get('max_marks', 100),
            'min_passing_marks': info.get('min_passing_marks', 33),
        })

    # Sort by date then session
    exams.sort(key=lambda e: (e['date'], 0 if e['session'] == 'MORNING' else 1))

    sorted_dates = sorted(all_dates)
    summary = {
        'total_exams': len(exams),
        'total_days': len(sorted_dates),
        'date_range': {
            'start': sorted_dates[0].isoformat() if sorted_dates else '',
            'end': sorted_dates[-1].isoformat() if sorted_dates else '',
        },
    }

    return {'exams': exams, 'summary': summary}


def _generate_exam_warnings(schedule, inputs):
    """Generate warnings for the completed schedule."""
    warnings = []

    # Check for classes with back-to-back exams
    class_dates = {}
    for key, val in schedule.items():
        cid = key[0]
        if cid not in class_dates:
            class_dates[cid] = []
        class_dates[cid].append(val['date'])

    class_names = {}
    for section in inputs['sections']:
        class_names[section['class_id']] = section.get('class_name', str(section['class_id']))

    for cid, dates in class_dates.items():
        sorted_dates = sorted(set(dates))
        for i in range(len(sorted_dates) - 1):
            gap = (sorted_dates[i + 1] - sorted_dates[i]).days
            if gap == 1:
                warnings.append(
                    f"{class_names.get(cid, cid)}: Exams on consecutive days "
                    f"({sorted_dates[i].isoformat()} and {sorted_dates[i + 1].isoformat()})."
                )

    return warnings

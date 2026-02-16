from celery import shared_task
from apps.analytics.services import AnalyticsService
import logging

logger = logging.getLogger(__name__)

@shared_task(name="apps.analytics.tasks.calculate_daily_investor_metrics")
def calculate_daily_investor_metrics():
    """
    Daily task to aggregate investor metrics.
    Recommended to run at midnight.
    """
    logger.info("Starting daily investor metrics calculation")
    try:
        metric = AnalyticsService.calculate_metrics()
        logger.info(f"Successfully calculated metrics for {metric.date}")
        return {
            "status": "success",
            "date": str(metric.date),
            "mrr": float(metric.mrr)
        }
    except Exception as e:
        logger.error(f"Error calculating investor metrics: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

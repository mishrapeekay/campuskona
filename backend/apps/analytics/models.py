from django.db import models
from apps.core.models import BaseModel
import uuid

class InvestorMetric(BaseModel):
    """
    Historical snapshots of key investor metrics.
    Calculated daily/monthly via cron jobs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(auto_now_add=True, unique=True)
    
    # Financial Metrics
    mrr = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    arr = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Growth Metrics
    total_schools = models.IntegerField(default=0)
    active_schools = models.IntegerField(default=0)
    new_schools_this_month = models.IntegerField(default=0)
    churn_count = models.IntegerField(default=0)
    churn_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0) # Percentage
    
    # Unit Economics
    cac = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ltv = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Geographical distribution (JSON: {"State": Count})
    region_distribution = models.JSONField(default=dict)

    class Meta:
        db_table = 'analytics_investor_metrics'
        ordering = ['-date']

    def __str__(self):
        return f"Metrics for {self.date}"

class MarketingSpend(BaseModel):
    """
    Tracking marketing costs to calculate CAC.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    month = models.DateField(help_text="First day of the month")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    channel = models.CharField(max_length=50, help_text="e.g., Google Ads, LinkedIn, Sales Team")
    
    class Meta:
        db_table = 'analytics_marketing_spend'
        unique_together = ['month', 'channel']
        ordering = ['-month']

    def __str__(self):
        return f"{self.channel} - {self.month}: {self.amount}"

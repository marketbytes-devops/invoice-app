from django.db import models
from django.utils import timezone

class Branch(models.Model):
    branch_name = models.CharField(max_length=500)
    branch_address = models.TextField()
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    gstin = models.CharField(max_length=15)
    phone_code = models.CharField(max_length=5, default='+91')
    phone = models.CharField(max_length=15)
    website = models.URLField()
    series_prefix = models.CharField(max_length=10, blank=True, null=True, default='')  
    last_invoice_number = models.IntegerField(default=0)
    last_reset_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.branch_address}, {self.city}, {self.state}"

    def get_next_invoice_number(self):
        today = timezone.now().date()
        financial_year_start = timezone.datetime(today.year if today.month >= 4 else today.year - 1, 4, 1).date()

        if not self.last_reset_date or self.last_reset_date < financial_year_start:
            self.last_invoice_number = 0
            self.last_reset_date = financial_year_start
            self.save()

        self.last_invoice_number += 1
        self.save()

        financial_year_end = financial_year_start.year + 1
        return f"{self.series_prefix}{financial_year_start.year}{financial_year_end}{str(self.last_invoice_number).zfill(4)}"
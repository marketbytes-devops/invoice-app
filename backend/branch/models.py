from django.db import models
from django.utils import timezone

class Branch(models.Model):
    branch_name = models.CharField(max_length=500, blank=True, null=True)
    branch_address = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)
    phone_code = models.CharField(max_length=5, default='+91', blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    website = models.CharField(max_length=250, blank=True, null=True)
    series_prefix = models.CharField(max_length=10, blank=True, null=True, default='')  
    last_invoice_number = models.IntegerField(default=0)
    last_reset_date = models.DateField(null=True, blank=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    def __str__(self):
        return f"{self.branch_address}, {self.city}, {self.state}"

    def get_next_invoice_number(self):
        today = timezone.now().date()
        # Financial year starts April 1st
        if today.month >= 4:
            start_year = today.year
            end_year = today.year + 1
        else:
            start_year = today.year - 1
            end_year = today.year
        
        financial_year_start = timezone.datetime(start_year, 4, 1).date()

        # Reset if last reset was before this FY start
        if not self.last_reset_date or self.last_reset_date < financial_year_start:
            self.last_invoice_number = 0
            self.last_reset_date = financial_year_start
            self.save()

        self.last_invoice_number += 1
        self.save()

        # Format: MBC/25-26/001
        fy_part = f"{str(start_year)[-2:]}-{str(end_year)[-2:]}"
        seq_part = str(self.last_invoice_number).zfill(3)
        prefix = self.series_prefix if self.series_prefix else "MBC"
        
        return f"{prefix}/{fy_part}/{seq_part}"
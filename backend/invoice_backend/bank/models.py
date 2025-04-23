from django.db import models
from django.utils import timezone
 
class BankAccount(models.Model):
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50) 
    ifsc_code = models.CharField(max_length=20)
    swift_code = models.CharField(max_length=20)
    micr_code = models.CharField(max_length=20)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
 
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"

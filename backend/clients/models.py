from django.db import models

class Client(models.Model):
    CLIENT_TAX_CHOICES = [
        ("gst", "GST"),
        ("vat", "VAT"),
        ("nil", "Nil"),
    ]

    client_name = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    tax_type = models.CharField(max_length=3, choices=CLIENT_TAX_CHOICES, blank=True, null=True)
    gst = models.CharField(max_length=20, blank=True, null=True)
    vat = models.CharField(max_length=20, blank=True, null=True)
    website = models.CharField(max_length=250, blank=True, null=True)
    invoice_series = models.CharField(
        max_length=20,
        choices=[("domestic", "Domestic"), ("international", "International")],
        blank=True, null=True
    )
    status = models.BooleanField(default=True)
    phone_code = models.CharField(max_length=5, default='+91', blank=True, null=True)
    gstin = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.tax_type == "gst":
            self.vat = 0.00  
        elif self.tax_type == "vat":
            self.gst = 0.00 
        else: 
            self.gst = 0.00
            self.vat = 0.00
        super().save(*args, **kwargs)

    def __str__(self):
        return self.client_name if self.client_name else "Client"
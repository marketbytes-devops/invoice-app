from django.db import models

class Client(models.Model):
    CLIENT_TAX_CHOICES = [
        ("gst", "GST"),
        ("vat", "VAT"),
        ("nil", "Nil"),
    ]

    client_name = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    tax_type = models.CharField(max_length=3, choices=CLIENT_TAX_CHOICES)
    gst = models.CharField(max_length=20, blank=True, null=True)
    vat = models.CharField(max_length=20, blank=True, null=True)
    website = models.CharField(max_length=250)
    invoice_series = models.CharField(
        max_length=20,
        choices=[("domestic", "Domestic"), ("international", "International")],
    )
    status = models.BooleanField(default=True)
    phone_code = models.CharField(max_length=5, default='+91')
    pincode = models.CharField(max_length=10, blank=True, null=True)

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
        return self.client_name
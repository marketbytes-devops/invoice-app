from django.db import models
from django.utils import timezone

class Tax(models.Model):
    name = models.CharField(max_length=100)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.percentage}%"

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=255, unique=True, blank=True)  # Initial format: INV-00001
    final_invoice_number = models.CharField(max_length=255, unique=True, blank=True, null=True)  # Final format: MB24250001
    invoice_type = models.CharField(max_length=50, choices=[("product", "Product"), ("service", "Service")])
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE)
    branch_address = models.ForeignKey('branch.Branch', on_delete=models.CASCADE)
    bank_account = models.ForeignKey('bank.BankAccount', on_delete=models.CASCADE)
    invoice_date = models.DateField()
    due_date = models.DateField()
    currency_type = models.CharField(max_length=10)
    payment_terms = models.CharField(max_length=50)
    tax_option = models.CharField(max_length=3, choices=[("yes", "Yes"), ("no", "No")], default="no")
    tax_name = models.CharField(max_length=100, blank=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_due = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_final = models.BooleanField(default=False) 
    is_saved_final = models.BooleanField(default=False)

    def calculate_totals(self):
        if self.pk:
            items = self.items.all()
            self.subtotal = sum(item.total for item in items)
            self.gst = sum(item.total_gst for item in items)
            self.total_due = self.subtotal + self.gst - self.discount - self.amount_paid
        else:
            self.subtotal = 0
            self.gst = 0
            self.total_due = -self.discount - self.amount_paid

    def save(self, *args, **kwargs):
        # Check if this is an update (not a new object)
        if self.pk:
            old_instance = Invoice.objects.get(pk=self.pk)
            # If branch_address has changed and is_final is True, regenerate final_invoice_number
            if old_instance.branch_address != self.branch_address and self.is_final:
                self.final_invoice_number = self.branch_address.get_next_invoice_number()
        else:
            # For new invoices, generate invoice_number if not final
            if not self.invoice_number and not self.is_final:
                last_invoice = Invoice.objects.filter(invoice_number__startswith="INV-").order_by("-id").first()
                if last_invoice and last_invoice.invoice_number.startswith("INV-"):
                    try:
                        new_number = int(last_invoice.invoice_number.split("-")[-1]) + 1
                    except ValueError:
                        new_number = 1
                else:
                    new_number = 1
                self.invoice_number = f"INV-{str(new_number).zfill(5)}"

        if self.tax_option == 'yes' and self.tax_rate and not self.tax_name:
            tax = Tax.objects.filter(percentage=self.tax_rate).first()
            if tax:
                self.tax_name = tax.name

        super().save(*args, **kwargs)
        self.calculate_totals()
        super().save(update_fields=['subtotal', 'gst', 'total_due'])

    def generate_final_invoice_number(self):
        if not self.final_invoice_number and self.is_final:
            self.final_invoice_number = self.branch_address.get_next_invoice_number()
            self.save()

    def __str__(self):
        return f"Invoice #{self.final_invoice_number or self.invoice_number} for {self.client}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    item_type = models.CharField(max_length=20, choices=[("product", "Product"), ("service", "Service")])
    product = models.ForeignKey('product.Product', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_gst = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        if self.item_type == "product" and self.product:
            self.name = self.product.name
            self.unit_cost = self.product.unit_cost
        self.total = self.quantity * self.unit_cost
        self.total_gst = self.total * (self.invoice.tax_rate / 100) if self.invoice.tax_option == "yes" and self.invoice.tax_rate else 0
        super().save(*args, **kwargs)
        self.invoice.save()  

    def __str__(self):
        return f"{self.name} ({self.quantity})"

class Client(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Branch(models.Model):
    branch_address = models.TextField()
    def __str__(self):
        return self.branch_address[:50]

class BankAccount(models.Model):
    account_number = models.CharField(max_length=50)
    def __str__(self):
        return self.account_number

class Product(models.Model):
    name = models.CharField(max_length=255)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self):
        return self.name
    
class Logo(models.Model):
    logo_image = models.ImageField(upload_to='logos/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Logo uploaded at {self.uploaded_at}"
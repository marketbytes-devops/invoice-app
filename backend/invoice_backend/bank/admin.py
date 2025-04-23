from django.contrib import admin
from .models import BankAccount
 
@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = (
        "bank_name",
        "account_number",
        "account_type",
        "ifsc_code",
        "swift_code",
        "micr_code",
        "created_at",
        "updated_at",
    )
    list_filter = ("bank_name", "account_type", "created_at")
    search_fields = ("bank_name", "account_number", "ifsc_code", "swift_code", "micr_code")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
 
    fieldsets = (
        ("Bank Details", {
            "fields": ("bank_name", "account_number", "account_type"),
        }),
        ("Codes", {
            "fields": ("ifsc_code", "swift_code", "micr_code"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )
 
admin.site.site_header = "Bank Account Management"
admin.site.site_title = "Bank Accounts"
admin.site.index_title = "Manage Bank Accounts"
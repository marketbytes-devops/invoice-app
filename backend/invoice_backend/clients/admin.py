 
from django.contrib import admin
from .models import Client
 
@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "client_name",
        "country",
        "state",
        "city",
        "phone",
        "tax_type",
        "gst",
        "vat",
        "website",
        "invoice_series",
        "status",
    )
    list_filter = ("country", "state", "city", "tax_type", "invoice_series", "status")
    search_fields = ("client_name", "phone", "country", "state", "city", "website")
    ordering = ("client_name",)
    fieldsets = (
        ("Client Information", {
            "fields": ("client_name", "country", "state", "city", "address", "phone", "website")
        }),
        ("Tax Details", {
            "fields": ("tax_type", "gst", "vat"),
            "classes": ("collapse",),
        }),
        ("Invoice & Status", {
            "fields": ("invoice_series", "status"),
        }),
    )
 
admin.site.site_header = "Client Management Admin"
admin.site.site_title = "Client Management"
admin.site.index_title = "Manage Clients"
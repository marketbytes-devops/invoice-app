from django.contrib import admin
from .models import Service

class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',) 
    ordering = ('name',)  
    list_per_page = 10  
admin.site.register(Service, ServiceAdmin)
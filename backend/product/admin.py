from django.contrib import admin
from .models import Product

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'unit_cost') 
    search_fields = ('name',)  
    list_filter = ('unit_cost',)  
    ordering = ('name',) 
    list_per_page = 10 

admin.site.register(Product, ProductAdmin)

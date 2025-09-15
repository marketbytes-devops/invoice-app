from rest_framework import serializers
from .models import Branch

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'branch_name', 'branch_address', 'state', 'city', 'gstin', 'phone_code', 'phone', 'website', 'series_prefix', 'last_invoice_number', 'last_reset_date', 'pincode']
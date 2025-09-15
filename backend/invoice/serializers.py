from rest_framework import serializers
from .models import Tax, Invoice, InvoiceItem, Logo

class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = ['id', 'name', 'percentage']

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'invoice', 'item_type', 'product', 'name', 'quantity', 'unit_cost', 'total', 'total_gst']
        extra_kwargs = {
            'name': {'required': False, 'allow_null': True},
            'product': {'required': False, 'allow_null': True},
        }

    def validate(self, data):
        if data['item_type'] == 'service' and not data.get('name'):
            raise serializers.ValidationError({"name": "This field may not be null for service items."})
        if data['item_type'] == 'product' and not data.get('product'):
            raise serializers.ValidationError({"product": "This field may not be null for product items."})
        return data

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    tax_name = serializers.CharField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'final_invoice_number', 'invoice_type', 'client', 'branch_address', 'bank_account',
            'invoice_date', 'due_date', 'currency_type', 'payment_terms', 'tax_option', 'tax_rate','tax_name',
            'subtotal', 'gst', 'discount', 'amount_paid', 'total_due', 'items', 'is_final', 'is_saved_final'
        ]
        read_only_fields = ['invoice_number', 'final_invoice_number', 'subtotal', 'gst', 'total_due']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
        instance.calculate_totals()
        instance.save()
        if instance.is_final:
            instance.generate_final_invoice_number()
        return instance
    

class LogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logo
        fields = ['id', 'logo_image', 'uploaded_at']
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Tax, Invoice, InvoiceItem, Logo
from .serializers import TaxSerializer, InvoiceSerializer, InvoiceItemSerializer, LogoSerializer

# Existing Views
class TaxListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer

class TaxDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer

class InvoiceListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class InvoiceItemListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer

class InvoiceItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer

class FinalInvoiceListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Invoice.objects.filter(is_saved_final=True)
    serializer_class = InvoiceSerializer

class FinalInvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Invoice.objects.filter(is_saved_final=True)
    serializer_class = InvoiceSerializer

# New View for Logo Upload, Retrieval, and Update
class LogoUploadView(generics.CreateAPIView, generics.RetrieveAPIView, generics.UpdateAPIView):
    permission_classes = [AllowAny]
    queryset = Logo.objects.all()
    serializer_class = LogoSerializer

    def get(self, request, *args, **kwargs):
        logo = self.get_queryset().last()
        if logo:
            serializer = self.get_serializer(logo)
            return Response(serializer.data)
        return Response({'company_name': '', 'logo_image': None})

    def post(self, request, *args, **kwargs):
        logo_instance = Logo.objects.last() or Logo()
        
        file = request.FILES.get('logo_image')
        company_name = request.data.get('company_name')

        if file:
            logo_instance.logo_image = file
        if company_name:
            logo_instance.company_name = company_name
            
        logo_instance.save()
        serializer = self.get_serializer(logo_instance)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)

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
        logo = self.get_queryset().last()  # Retrieve the latest uploaded logo
        if logo:
            serializer = self.get_serializer(logo)
            return Response(serializer.data)
        return Response({'error': 'Logo not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('logo_image')
        if file:
            logo_instance = Logo(logo_image=file)
            logo_instance.save()
            serializer = self.get_serializer(logo_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        logo = self.get_queryset().last()  # Retrieve the latest uploaded logo
        if logo:
            file = request.FILES.get('logo_image')
            if file:
                logo.logo_image = file
                logo.save()
                serializer = self.get_serializer(logo)
                return Response(serializer.data)
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Logo not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, *args, **kwargs):
        return self.put(request, *args, **kwargs)

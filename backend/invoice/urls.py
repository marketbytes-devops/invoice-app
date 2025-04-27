from django.urls import path
from .views import TaxListCreateView, TaxDetailView, InvoiceListCreateView, InvoiceDetailView, InvoiceItemListCreateView, InvoiceItemDetailView, FinalInvoiceListCreateView, FinalInvoiceDetailView, LogoUploadView

urlpatterns = [
    path('taxes/', TaxListCreateView.as_view(), name='tax-list-create'),
    path('taxes/<int:pk>/', TaxDetailView.as_view(), name='tax-detail'),
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoice-items/', InvoiceItemListCreateView.as_view(), name='invoice-item-list-create'),
    path('invoice-items/<int:pk>/', InvoiceItemDetailView.as_view(), name='invoice-item-detail'),
    path('final-invoices/', FinalInvoiceListCreateView.as_view(), name='final-invoice-list-create'),
    path('final-invoices/<int:pk>/', FinalInvoiceDetailView.as_view(), name='final-invoice-detail'),
    path('settings/logo/', LogoUploadView.as_view(), name='logo-upload'), 
]
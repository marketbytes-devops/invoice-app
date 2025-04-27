from django.urls import path
from .views import ServiceListCreateView, ServiceDetailView

urlpatterns = [
    path('services/', ServiceListCreateView.as_view(), name='service_list_create'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service_detail'),
]

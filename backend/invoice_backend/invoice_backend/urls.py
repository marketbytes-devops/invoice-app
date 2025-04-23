from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authapp.urls')),  
    path('api/products/', include('product.urls')),
    path('api/services/', include('services.urls')),
    path('api/bank/', include('bank.urls')),
    path('api/clients/', include('clients.urls')),
    path('api/branch/', include('branch.urls')),
    path('api/invoices/', include('invoice.urls')),
    path('documentation/', include('documentation.urls')), 
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
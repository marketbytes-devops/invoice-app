 
from django.urls import path
from .views import BankAccountListCreateView, BankAccountDetailView
 
urlpatterns = [
    path('bank-accounts/', BankAccountListCreateView.as_view(), name='bank-account-list-create'),
    path('bank-accounts/<int:pk>/', BankAccountDetailView.as_view(), name='bank-account-detail'),
]
 
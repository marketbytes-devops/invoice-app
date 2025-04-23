from rest_framework import generics
from .models import BankAccount
from .serializers import BankAccountSerializer
from rest_framework.permissions import AllowAny
 
class BankAccountListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
 
class BankAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
 
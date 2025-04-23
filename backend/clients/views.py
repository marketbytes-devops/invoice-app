from rest_framework import generics
from .models import Client
from .serializers import ClientSerializer
from rest_framework.permissions import AllowAny
 
class ClientListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
 
class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes=[AllowAny]
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .models import Branch
from .serializers import BranchSerializer
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
 
class BranchViewSet(viewsets.ModelViewSet):
    permission_classes=[AllowAny]
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def list(self, request, *args, **kwargs):
        branch_addresses = self.get_queryset()
        serializer = self.get_serializer(branch_addresses, many=True)
        return Response(serializer.data)
 
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except NotFound:
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
       
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except NotFound:
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
 
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except NotFound:
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
       
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Service
from .serializers import ServiceSerializer
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ServiceListCreateView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(responses={200: ServiceSerializer(many=True)})
    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all services.
        """
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=ServiceSerializer, responses={201: ServiceSerializer})
    def post(self, request, *args, **kwargs):
        """
        Create a new service.
        """
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ServiceDetailView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(responses={200: ServiceSerializer})
    def get(self, request, pk, *args, **kwargs):
        """
        Retrieve a single service by ID.
        """
        try:
            service = Service.objects.get(pk=pk)
            serializer = ServiceSerializer(service)
            return Response(serializer.data)
        except Service.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(request_body=ServiceSerializer, responses={200: ServiceSerializer})
    def put(self, request, pk, *args, **kwargs):
        """
        Update a service by ID.
        """
        try:
            service = Service.objects.get(pk=pk)
            serializer = ServiceSerializer(service, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Service.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(request_body=ServiceSerializer, responses={200: ServiceSerializer})
    def patch(self, request, pk, *args, **kwargs):
        """
        Partially update a service by ID.
        """
        try:
            service = Service.objects.get(pk=pk)
            serializer = ServiceSerializer(service, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Service.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(responses={204: "No Content"})
    def delete(self, request, pk, *args, **kwargs):
        """
        Delete a service by ID.
        """
        try:
            service = Service.objects.get(pk=pk)
            service.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Service.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

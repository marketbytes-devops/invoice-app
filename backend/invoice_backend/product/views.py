from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ProductListCreateView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(responses={200: ProductSerializer(many=True)})
    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all products.
        """
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=ProductSerializer, responses={201: ProductSerializer})
    def post(self, request, *args, **kwargs):
        """
        Create a new product.
        """
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(responses={200: ProductSerializer})
    def get(self, request, pk, *args, **kwargs):
        """
        Retrieve a single product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(request_body=ProductSerializer, responses={200: ProductSerializer})
    def put(self, request, pk, *args, **kwargs):
        """
        Update a product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(request_body=ProductSerializer, responses={200: ProductSerializer})
    def patch(self, request, pk, *args, **kwargs):
        """
        Partially update a product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(responses={204: "No Content"})
    def delete(self, request, pk, *args, **kwargs):
        """
        Delete a product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

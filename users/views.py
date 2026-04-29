from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

GOOGLE_CLIENT_ID = "741298892182-05156vc2ucgcl6h38gvh9mumu5uke20g.apps.googleusercontent.com"
from rest_framework.views import APIView
from rest_framework.response import Response
from ml.predictor import predict_next_7

class StockPredictView(APIView):
    def post(self, request):
        symbol = request.data.get("symbol")
        if not symbol:
            return Response({"error": "symbol required"}, status=400)

        try:
            result = predict_next_7(symbol)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GoogleAuthView(APIView):
    permission_classes=[AllowAny]
    def post(self, request):
        id_token_value = request.data.get("id_token")

        if not id_token_value:
            return Response({"error": "id_token missing"}, status=400)

        try:
            # Validate Google token
            google_data = id_token.verify_oauth2_token(
                id_token_value,
                requests.Request(),
                GOOGLE_CLIENT_ID
            )

            email = google_data["email"]
            name = google_data.get("name", "")

            # Create user if not exists
            user, created = User.objects.get_or_create(
                username=email,
                email=email,
                defaults={"first_name": name}
            )

            # Issue JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response({
                "access": str(access),
                "refresh": str(refresh)
            })

        except Exception as e:
            print("Google Login Error:", e)
            return Response({"error": "Invalid Google token"}, status=400)

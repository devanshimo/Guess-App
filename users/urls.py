from django.urls import path
from .views import RegisterUserView, GoogleAuthView,StockPredictView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # registration
    path('register/', RegisterUserView.as_view(), name='register'),

    # normal JWT login (username/password)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Google login endpoint
    path('google/', GoogleAuthView.as_view(), name='google_auth'),
    path("predict/", StockPredictView.as_view()),

]

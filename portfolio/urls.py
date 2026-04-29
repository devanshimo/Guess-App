# backend/portfolio/urls.py
from django.urls import path
from .views import (
    search_symbols,
    PredictStock,
    PortfolioSummaryView,
    StockListCreateView,
    StockDetailView,
    PortfolioListCreateView,
    StockAnalyticsView,
    TransactionCreateView,
    get_live_price,
)

app_name = "portfolio"

urlpatterns = [
    path("search-symbols/", search_symbols, name="search-symbols"),
    path("predict/<str:symbol>/", PredictStock.as_view(), name="predict-stock"),
    path("summary/", PortfolioSummaryView.as_view(), name="portfolio-summary"),
    path("stocks/", StockListCreateView.as_view(), name="stock-list-create"),
    path("stocks/<int:pk>/", StockDetailView.as_view(), name="stock-detail"),
    path("portfolios/", PortfolioListCreateView.as_view(), name="portfolio-list-create"),
    path("analytics/stock/<int:pk>/", StockAnalyticsView.as_view(), name="stock-analytics"),
    path("live-price/", get_live_price),
    path("transactions/", TransactionCreateView.as_view(), name="transaction-list-create"),
]

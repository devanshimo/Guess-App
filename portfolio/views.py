# backend/portfolio/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny


from .models import Stock, Portfolio, Transaction
from .serializers import StockSerializer, PortfolioSerializer, TransactionSerializer

import yfinance as yf
from datetime import timedelta

# Attempt to import your existing predictor
ML_AVAILABLE = False
try:
    from ml.predictor import predict_next_7
    ML_AVAILABLE = True
except Exception:
    ML_AVAILABLE = False


# ---------------------------
# AUTOCOMPLETE / SEARCH SYMBOLS
# ---------------------------
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_symbols(request):
    q = request.GET.get("q", "").strip().upper()
    if not q:
        return Response([], status=status.HTTP_200_OK)

    # Comprehensive mock data with REAL stocks
    all_stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
        {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
        {"symbol": "GOOGL", "name": "Alphabet Inc. (Google)", "exchange": "NASDAQ"},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
        {"symbol": "META", "name": "Meta Platforms Inc. (Facebook)", "exchange": "NASDAQ"},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
        {"symbol": "NFLX", "name": "Netflix Inc.", "exchange": "NASDAQ"},
        {"symbol": "BTC-USD", "name": "Bitcoin USD", "exchange": "CRYPTO"},
        {"symbol": "ETH-USD", "name": "Ethereum USD", "exchange": "CRYPTO"},
        {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "exchange": "NYSE"},
        {"symbol": "QQQ", "name": "Invesco QQQ Trust", "exchange": "NASDAQ"},
        {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE"},
        {"symbol": "WMT", "name": "Walmart Inc.", "exchange": "NYSE"},
        {"symbol": "PG", "name": "Procter & Gamble Company", "exchange": "NYSE"},
        {"symbol": "DIS", "name": "Walt Disney Company", "exchange": "NYSE"},
        {"symbol": "BA", "name": "Boeing Company", "exchange": "NYSE"},
        {"symbol": "IBM", "name": "International Business Machines", "exchange": "NYSE"},
        {"symbol": "XOM", "name": "Exxon Mobil Corporation", "exchange": "NYSE"},
        {"symbol": "CVX", "name": "Chevron Corporation", "exchange": "NYSE"},
        {"symbol": "KO", "name": "Coca-Cola Company", "exchange": "NYSE"},
        {"symbol": "PEP", "name": "PepsiCo Inc.", "exchange": "NASDAQ"},
        {"symbol": "T", "name": "AT&T Inc.", "exchange": "NYSE"},
        {"symbol": "VZ", "name": "Verizon Communications Inc.", "exchange": "NYSE"},
        {"symbol": "ADBE", "name": "Adobe Inc.", "exchange": "NASDAQ"},
        {"symbol": "CRM", "name": "Salesforce Inc.", "exchange": "NYSE"},
        {"symbol": "INTC", "name": "Intel Corporation", "exchange": "NASDAQ"},
        {"symbol": "CSCO", "name": "Cisco Systems Inc.", "exchange": "NASDAQ"},
        {"symbol": "AMD", "name": "Advanced Micro Devices Inc.", "exchange": "NASDAQ"},
        {"symbol": "SBUX", "name": "Starbucks Corporation", "exchange": "NASDAQ"},
        {"symbol": "NKE", "name": "Nike Inc.", "exchange": "NYSE"},
        {"symbol": "MCD", "name": "McDonald's Corporation", "exchange": "NYSE"},
        {"symbol": "COST", "name": "Costco Wholesale Corporation", "exchange": "NASDAQ"},
        {"symbol": "ABNB", "name": "Airbnb Inc.", "exchange": "NASDAQ"},
        {"symbol": "UBER", "name": "Uber Technologies Inc.", "exchange": "NYSE"},
        {"symbol": "LYFT", "name": "Lyft Inc.", "exchange": "NASDAQ"},
        {"symbol": "SNAP", "name": "Snap Inc.", "exchange": "NYSE"},
        {"symbol": "TWTR", "name": "Twitter Inc.", "exchange": "NYSE"},
        {"symbol": "SHOP", "name": "Shopify Inc.", "exchange": "NYSE"},
        {"symbol": "SQ", "name": "Block Inc. (Square)", "exchange": "NYSE"},
        {"symbol": "PYPL", "name": "PayPal Holdings Inc.", "exchange": "NASDAQ"},
        {"symbol": "COIN", "name": "Coinbase Global Inc.", "exchange": "NASDAQ"},
    ]
    
    # Smart search - match by symbol or name
    results = []
    for stock in all_stocks:
        symbol_match = q in stock["symbol"].upper()
        name_match = q in stock["name"].upper()
        
        if symbol_match or name_match:
            results.append(stock)
    
    # If no direct matches, show popular stocks starting with the query
    if not results and len(q) >= 2:
        results = [stock for stock in all_stocks if stock["symbol"].startswith(q)]
    
    # If still no results, show any partial matches
    if not results:
        for stock in all_stocks:
            if any(q in part for part in [stock["symbol"], stock["name"]]):
                results.append(stock)
    
    return Response(results[:10], status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_live_price(request):
    symbol = request.GET.get("symbol", "").upper().strip()
    
    if not symbol:
        return Response({"error": "symbol parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Use yfinance to get current price
        ticker = yf.Ticker(symbol)
        
        # Get historical data for the last 2 days to calculate change
        hist = ticker.history(period="2d")
        
        if hist.empty:
            return Response({
                "error": f"No data found for symbol: {symbol}"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get current price (last close price)
        current_price = float(hist["Close"].iloc[-1])
        
        # Calculate price change
        if len(hist) >= 2:
            previous_price = float(hist["Close"].iloc[-2])
            change = current_price - previous_price
            change_percent = (change / previous_price) * 100
        else:
            change = 0
            change_percent = 0

        # Return properly formatted response
        return Response({
            "symbol": symbol,
            "price": current_price,
            "change": change,
            "change_percent": change_percent,
            "currency": "USD",
            "timestamp": hist.index[-1].isoformat()
        })

    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return Response({
            "error": f"Failed to fetch price for {symbol}: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ---------------------------
# PREDICTION (per-symbol GET)
# ---------------------------
class PredictStock(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, symbol):
        symbol = (symbol or "").upper().strip()
        if not symbol:
            return Response({"detail": "symbol required"}, status=status.HTTP_400_BAD_REQUEST)

        # use your predictor if available
        if ML_AVAILABLE:
            try:
                result = predict_next_7(symbol)
                return Response(result)
            except Exception as e:
                # fall through to fallback below if predictor fails
                print("predictor error:", e)

        # fallback naive prediction
        try:
            df = yf.download(symbol, period="6mo", progress=False)
            if df is None or df.empty:
                return Response({"detail": "no data for symbol"}, status=status.HTTP_404_NOT_FOUND)

            close = df["Close"].values
            last_price = float(close[-1])
            preds = [last_price * (1 + 0.001 * i) for i in range(1, 8)]
            last_date = df.index[-1]
            future_dates = [(last_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(1, 8)]

            return Response({
                "prediction": [float(p) for p in preds],
                "future_dates": future_dates,
                "last_price": last_price,
                "note": "fallback (naive) prediction used"
            })
        except Exception as e:
            return Response({"detail": "prediction failed", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------
# PORTFOLIO SUMMARY
# ---------------------------
class PortfolioSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        portfolios = Portfolio.objects.all()
        response = []

        for p in portfolios:
            stocks = p.stocks.all()
            invested = sum(float(s.quantity) * float(s.avg_buy_price) for s in stocks)
            current = sum(float(s.quantity) * float(s.last_price) for s in stocks)
            pl = current - invested
            pl_percent = (pl / invested * 100) if invested > 0 else 0

            response.append({
                "id": p.id,
                "name": p.name,
                "invested": round(invested, 2),
                "current": round(current, 2),
                "pl": round(pl, 2),
                "pl_percent": round(pl_percent, 2),
            })

        return Response(response)


# ---------------------------
# STOCK CRUD (auto-fill last_price & name via yfinance)
# ---------------------------
class StockListCreateView(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        data = serializer.validated_data
        symbol = (data.get("symbol") or "").upper().strip()

        last_price = 0.0
        name = symbol

        try:
            hist = yf.download(symbol, period="1d", progress=False)
            if hist is not None and not hist.empty:
                last_price = float(hist["Close"].iloc[-1])
        except Exception:
            last_price = 0.0

        try:
            info = yf.Ticker(symbol).info
            name = info.get("shortName") or info.get("longName") or name
        except Exception:
            pass

        serializer.save(name=name, last_price=last_price, symbol=symbol)


class StockDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]


# ---------------------------
# PORTFOLIO CRUD
# ---------------------------
class PortfolioListCreateView(generics.ListCreateAPIView):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]


# ---------------------------
# STOCK ANALYTICS (transactions)
# ---------------------------
class StockAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            stock = Stock.objects.get(id=pk)
        except Stock.DoesNotExist:
            return Response({"detail": "stock not found"}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "symbol": stock.symbol,
            "name": stock.name,
            "quantity": stock.quantity,
            "avg_buy": float(stock.avg_buy_price),
            "current_price": float(stock.last_price),
            "value": float(stock.quantity) * float(stock.last_price),
        }

        txns = Transaction.objects.filter(stock=stock).order_by('-timestamp')
        data["transactions"] = TransactionSerializer(txns, many=True).data

        return Response(data)


# ---------------------------
# TRANSACTIONS
# ---------------------------
class TransactionCreateView(generics.ListCreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

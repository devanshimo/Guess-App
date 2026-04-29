# backend/portfolio/serializers.py
from rest_framework import serializers
from .models import Stock, Portfolio, Transaction

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = "__all__"
        read_only_fields = ("id",)


class PortfolioSerializer(serializers.ModelSerializer):
    # include nested stocks read-only
    stocks = StockSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = ["id", "name", "stocks"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ("id", "timestamp")

    def create(self, validated_data):
        """
        Create transaction and apply business logic (update stock qty / avg price).
        """
        instance = super().create(validated_data)
        # apply repository-level changes
        try:
            instance.apply()
        except Exception:
            # In production, you'd handle/log this properly.
            pass
        return instance

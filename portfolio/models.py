# backend/portfolio/models.py
from django.db import models

class Portfolio(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Stock(models.Model):
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name="stocks"
    )

    symbol = models.CharField(max_length=20)
    name = models.CharField(max_length=255)

    quantity = models.PositiveIntegerField(default=0)
    avg_buy_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    last_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        # safe guard if portfolio deleted or unset
        portfolio_name = self.portfolio.name if self.portfolio_id else "NoPortfolio"
        return f"{self.symbol} ({portfolio_name})"


class Transaction(models.Model):
    TYPE_CHOICES = [
        ("BUY", "Buy"),
        ("SELL", "Sell")
    ]

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name="transactions"
    )
    type = models.CharField(max_length=4, choices=TYPE_CHOICES)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} {self.quantity} of {self.stock.symbol}"

    def apply(self):
        """
        Apply the transaction to the linked Stock:
         - BUY: increase quantity and update avg_buy_price
         - SELL: decrease quantity (does not change avg_buy_price)
        """
        stock = self.stock

        # convert Decimal to float safely for arithmetic
        old_qty = float(stock.quantity or 0)
        old_avg = float(stock.avg_buy_price or 0)
        qty = float(self.quantity)
        price = float(self.price)

        if self.type == "BUY":
            total_cost = (old_qty * old_avg) + (qty * price)
            new_qty = old_qty + qty
            if new_qty > 0:
                new_avg = total_cost / new_qty
            else:
                new_avg = 0.0

            stock.quantity = int(new_qty)
            stock.avg_buy_price = round(new_avg, 2)

        elif self.type == "SELL":
            new_qty = max(0, old_qty - qty)
            stock.quantity = int(new_qty)
            # avg_buy_price remains unchanged on sell

        stock.save()

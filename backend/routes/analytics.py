# analytics.py
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import mongo
from bson import ObjectId
import datetime
from collections import defaultdict

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

# ✅ Get farmer analytics
@analytics_bp.route("/farmer/<farmer_email>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_farmer_analytics(farmer_email):
    try:
        print(f"📊 Fetching analytics for farmer: {farmer_email}")

        # Get all orders for this farmer
        orders = list(mongo.db.orders.find({"farmer_email": farmer_email}).sort("created_at", -1))
        print(f"📦 Found {len(orders)} orders for farmer {farmer_email}")

        # Get farmer's products
        products = list(mongo.db.products.find({"farmer_email": farmer_email}).sort("created_at", -1))

        # Calculate basic analytics
        total_sales = len(orders)
        total_revenue = sum(float(order.get("total_price", 0.0)) for order in orders)
        total_quantity_sold = sum(int(order.get("quantity", 0)) for order in orders)

        # Monthly sales data (last 6 months)
        monthly_sales = defaultdict(int)
        monthly_revenue = defaultdict(float)

        for order in orders:
            c_at = order.get("created_at")
            if not c_at:
                continue
            month_year = c_at.strftime("%b %Y")
            monthly_sales[month_year] += int(order.get("quantity", 0))
            monthly_revenue[month_year] += float(order.get("total_price", 0.0))

        # Sort months chronologically
        sorted_months = sorted(monthly_sales.keys(),
                               key=lambda x: datetime.datetime.strptime(x, "%b %Y")) if monthly_sales else []

        # Product performance
        product_performance = defaultdict(lambda: {"quantity": 0, "revenue": 0.0})
        for order in orders:
            product_name = order.get("product_name", "Unknown")
            product_performance[product_name]["quantity"] += int(order.get("quantity", 0))
            product_performance[product_name]["revenue"] += float(order.get("total_price", 0.0))

        # Current stock status
        current_stock = sum(int(product.get("quantity", 0)) for product in products)
        total_products_listed = len(products)

        # Recent activity (last 7 days)
        week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        recent_orders = len([order for order in orders if order.get("created_at") and order["created_at"] > week_ago])

        labels = sorted_months[-6:]
        analytics_data = {
            "farmer_email": farmer_email,
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "total_quantity_sold": total_quantity_sold,
            "current_stock": current_stock,
            "total_products_listed": total_products_listed,
            "recent_orders_7days": recent_orders,

            "monthly_sales": {
                "labels": labels,
                "quantities": [monthly_sales[month] for month in labels],
                "revenues": [monthly_revenue[month] for month in labels]
            },

            "product_performance": [
                {
                    "name": name,
                    "quantity": data["quantity"],
                    "revenue": data["revenue"]
                }
                for name, data in product_performance.items()
            ],

            "stock_distribution": [
                {
                    "name": product.get("name"),
                    "quantity": int(product.get("quantity", 0)),
                    "status": "Out of Stock" if int(product.get("quantity", 0)) == 0 else
                              "Low Stock" if int(product.get("quantity", 0)) <= 5 else
                              "Good Stock"
                }
                for product in products
            ]
        }

        print(f"✅ Analytics data for {farmer_email}: {total_sales} sales, ₹{total_revenue} revenue")
        return jsonify(analytics_data)

    except Exception as e:
        print("❌ Error fetching farmer analytics:", str(e))
        return jsonify({"error": "Failed to fetch analytics", "details": str(e)}), 500

# Health
@analytics_bp.route("/health", methods=["GET"], strict_slashes=False)
@cross_origin()
def analytics_health_check():
    return jsonify({
        "status": "healthy",
        "service": "analytics",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "message": "Analytics service is running"
    })

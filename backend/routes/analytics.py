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
        orders = list(mongo.db.orders.find({"farmer_email": farmer_email}))
        print(f"📦 Found {len(orders)} orders for farmer {farmer_email}")
        
        # Get farmer's products
        products = list(mongo.db.products.find({"farmer_email": farmer_email}))
        
        # Calculate basic analytics
        total_sales = len(orders)
        total_revenue = sum(order["total_price"] for order in orders)
        total_quantity_sold = sum(order["quantity"] for order in orders)
        
        # Monthly sales data (last 6 months)
        monthly_sales = defaultdict(int)
        monthly_revenue = defaultdict(float)
        
        for order in orders:
            month_year = order["created_at"].strftime("%b %Y")
            monthly_sales[month_year] += order["quantity"]
            monthly_revenue[month_year] += order["total_price"]
        
        # Sort months chronologically
        sorted_months = sorted(monthly_sales.keys(), 
                             key=lambda x: datetime.datetime.strptime(x, "%b %Y"))
        
        # Product performance
        product_performance = defaultdict(lambda: {"quantity": 0, "revenue": 0})
        
        for order in orders:
            product_name = order["product_name"]
            product_performance[product_name]["quantity"] += order["quantity"]
            product_performance[product_name]["revenue"] += order["total_price"]
        
        # Current stock status
        current_stock = sum(product["quantity"] for product in products)
        total_products_listed = len(products)
        
        # Recent activity (last 7 days)
        week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        recent_orders = len([order for order in orders if order["created_at"] > week_ago])
        
        analytics_data = {
            "farmer_email": farmer_email,
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "total_quantity_sold": total_quantity_sold,
            "current_stock": current_stock,
            "total_products_listed": total_products_listed,
            "recent_orders_7days": recent_orders,
            
            "monthly_sales": {
                "labels": sorted_months[-6:],  # Last 6 months
                "quantities": [monthly_sales[month] for month in sorted_months[-6:]],
                "revenues": [monthly_revenue[month] for month in sorted_months[-6:]]
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
                    "name": product["name"],
                    "quantity": product["quantity"],
                    "status": "Out of Stock" if product["quantity"] == 0 else 
                              "Low Stock" if product["quantity"] <= 5 else 
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

# ✅ Health check
@analytics_bp.route("/health", methods=["GET"], strict_slashes=False)
@cross_origin()
def analytics_health_check():
    return jsonify({
        "status": "healthy", 
        "service": "analytics",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "message": "Analytics service is running"
    })
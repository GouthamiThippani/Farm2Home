from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import mongo
from bson import ObjectId
import datetime

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

# ✅ Get farmer analytics
@analytics_bp.route("/farmer/<farmer_email>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_farmer_analytics(farmer_email):
    try:
        print(f"📊 Fetching analytics for farmer: {farmer_email}")
        
        # Get all orders for this farmer
        orders = list(mongo.db.orders.find({"farmer_email": farmer_email}))
        
        # Calculate analytics
        total_sales = len(orders)
        total_revenue = sum(order["total_price"] for order in orders)
        
        # Monthly sales data
        monthly_sales = {}
        for order in orders:
            month = order["created_at"].strftime("%b")  # Jan, Feb, etc.
            monthly_sales[month] = monthly_sales.get(month, 0) + 1
        
        # Fill all months
        all_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_data = [monthly_sales.get(month, 0) for month in all_months]
        
        # Product performance
        product_sales = {}
        for order in orders:
            product_name = order["product_name"]
            product_sales[product_name] = product_sales.get(product_name, 0) + order["quantity"]
        
        analytics_data = {
            "farmer_email": farmer_email,
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "monthly_sales": {
                "labels": all_months,
                "data": monthly_data
            },
            "product_performance": product_sales,
            "recent_orders": len(orders)
        }
        
        print(f"✅ Analytics data for {farmer_email}: {total_sales} sales, ₹{total_revenue} revenue")
        return jsonify(analytics_data)
        
    except Exception as e:
        print("❌ Error fetching farmer analytics:", str(e))
        return jsonify({"error": "Failed to fetch analytics"}), 500

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
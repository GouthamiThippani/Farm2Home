from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import mongo
from bson import ObjectId
import datetime

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

# ✅ HEALTH CHECK FOR ORDERS
@orders_bp.route("/health", methods=["GET"], strict_slashes=False)
@cross_origin()
def orders_health_check():
    return jsonify({
        "status": "healthy", 
        "service": "orders",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "message": "Orders service is running"
    })

# Helper to convert ObjectId to string
def serialize_order(o):
    if not o:
        return None
    return {
        "_id": str(o["_id"]),
        "product_id": str(o["product_id"]),
        "product_name": o["product_name"],
        "buyer_email": o["buyer_email"],
        "buyer_name": o["buyer_name"],
        "farmer_email": o["farmer_email"],
        "farmer_name": o["farmer_name"],
        "quantity": o["quantity"],
        "total_price": o["total_price"],
        "status": o.get("status", "confirmed"),
        "created_at": o["created_at"].isoformat() if o.get("created_at") else datetime.datetime.utcnow().isoformat()
    }

# Create new order
@orders_bp.route("/", methods=["POST"], strict_slashes=False)
@cross_origin()
def create_order():
    try:
        data = request.get_json()
        print("🛒 Received order data:", data)
        
        product_id = data.get("product_id")
        buyer_email = data.get("buyer_email")
        buyer_name = data.get("buyer_name")
        quantity = data.get("quantity")

        if not product_id or not buyer_email or not quantity:
            return jsonify({"error": "Product ID, buyer email, and quantity are required"}), 400

        # Validate product_id format
        try:
            product_object_id = ObjectId(product_id)
        except:
            return jsonify({"error": "Invalid product ID format"}), 400

        # Get product details
        product = mongo.db.products.find_one({"_id": product_object_id})
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Check if enough quantity available
        if product["quantity"] < int(quantity):
            return jsonify({"error": f"Not enough quantity available. Only {product['quantity']} kg left"}), 400

        # Calculate total price
        total_price = product["price"] * int(quantity)

        order = {
            "product_id": product_id,
            "product_name": product["name"],
            "buyer_email": buyer_email,
            "buyer_name": buyer_name,
            "farmer_email": product["farmer_email"],
            "farmer_name": product["farmer_name"],
            "quantity": int(quantity),
            "total_price": total_price,
            "status": "confirmed",
            "created_at": datetime.datetime.utcnow()
        }

        # Update product quantity (reduce available quantity)
        mongo.db.products.update_one(
            {"_id": product_object_id},
            {"$inc": {"quantity": -int(quantity)}}
        )

        # Save order
        res = mongo.db.orders.insert_one(order)
        order["_id"] = str(res.inserted_id)
        
        print("✅ Order created successfully:", order["_id"])
        return jsonify(serialize_order(order)), 201
        
    except Exception as e:
        print("❌ Error creating order:", str(e))
        return jsonify({"error": "Failed to create order", "details": str(e)}), 500

# Get all orders (for admin purposes)
@orders_bp.route("/", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_all_orders():
    try:
        orders = list(mongo.db.orders.find().sort("created_at", -1))
        print(f"📊 Returning {len(orders)} orders")
        return jsonify([serialize_order(o) for o in orders])
    except Exception as e:
        print("❌ Error fetching all orders:", str(e))
        return jsonify({"error": "Failed to fetch orders"}), 500

# Get orders for a buyer
@orders_bp.route("/buyer/<buyer_email>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_buyer_orders(buyer_email):
    try:
        print(f"👤 Fetching orders for buyer: {buyer_email}")
        orders = list(mongo.db.orders.find({"buyer_email": buyer_email}).sort("created_at", -1))
        print(f"📦 Found {len(orders)} orders for {buyer_email}")
        return jsonify([serialize_order(o) for o in orders])
    except Exception as e:
        print("❌ Error fetching buyer orders:", str(e))
        return jsonify({"error": "Failed to fetch buyer orders"}), 500

# Get orders for a farmer (sales)
@orders_bp.route("/farmer/<farmer_email>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_farmer_orders(farmer_email):
    try:
        print(f"👨‍🌾 Fetching orders for farmer: {farmer_email}")
        orders = list(mongo.db.orders.find({"farmer_email": farmer_email}).sort("created_at", -1))
        print(f"💰 Found {len(orders)} orders for farmer {farmer_email}")
        return jsonify([serialize_order(o) for o in orders])
    except Exception as e:
        print("❌ Error fetching farmer orders:", str(e))
        return jsonify({"error": "Failed to fetch farmer orders"}), 500

# Get specific order by ID
@orders_bp.route("/<order_id>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_order(order_id):
    try:
        print(f"🔍 Fetching order: {order_id}")
        order = mongo.db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            return jsonify({"error": "Order not found"}), 404
        return jsonify(serialize_order(order))
    except Exception as e:
        print("❌ Error fetching order:", str(e))
        return jsonify({"error": "Failed to fetch order"}), 500

# Update order status
@orders_bp.route("/<order_id>", methods=["PUT"], strict_slashes=False)
@cross_origin()
def update_order(order_id):
    try:
        data = request.get_json()
        print(f"✏️ Updating order {order_id} with data:", data)
        
        status = data.get("status")
        if status not in ["pending", "confirmed", "shipped", "delivered", "cancelled"]:
            return jsonify({"error": "Invalid status"}), 400

        result = mongo.db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": status}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Order not found"}), 404
            
        return jsonify({"message": "Order updated successfully", "status": status})
    except Exception as e:
        print("❌ Error updating order:", str(e))
        return jsonify({"error": "Failed to update order"}), 500

# Delete order (with inventory restoration)
@orders_bp.route("/<order_id>", methods=["DELETE"], strict_slashes=False)
@cross_origin()
def delete_order(order_id):
    try:
        print(f"🗑️ Deleting order: {order_id}")
        
        # Get order details first to restore inventory
        order = mongo.db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Restore product quantity
        mongo.db.products.update_one(
            {"_id": ObjectId(order["product_id"])},
            {"$inc": {"quantity": order["quantity"]}}
        )
        
        # Delete order
        result = mongo.db.orders.delete_one({"_id": ObjectId(order_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Order not found"}), 404
            
        return jsonify({"message": "Order deleted successfully and inventory restored"})
    except Exception as e:
        print("❌ Error deleting order:", str(e))
        return jsonify({"error": "Failed to delete order"}), 500
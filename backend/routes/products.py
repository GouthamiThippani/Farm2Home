from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import mongo
from bson import ObjectId
import datetime

products_bp = Blueprint("products", __name__, url_prefix="/api/products")

# ✅ ADD HEALTH CHECK TO PRODUCTS BLUEPRINT
@products_bp.route("/health", methods=["GET"], strict_slashes=False)
@cross_origin()
def products_health_check():
    return jsonify({
        "status": "healthy", 
        "service": "products",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "message": "Products service is running"
    })

# Helper to convert ObjectId to string
def serialize_product(p):
    return {
        "_id": str(p["_id"]),
        "name": p["name"],
        "price": p["price"],
        "quantity": p["quantity"],
        "image": p.get("image"),
        "farmer_email": p.get("farmer_email", ""),
        "farmer_name": p.get("farmer_name", ""),
        "created_at": p["created_at"].isoformat() if p.get("created_at") else datetime.datetime.utcnow().isoformat()
    }

# Add product
@products_bp.route("/", methods=["POST"], strict_slashes=False)
@cross_origin()
def add_product():
    try:
        data = request.get_json()
        print("📦 Received product data:", data)
        
        name = data.get("name")
        price = data.get("price")
        quantity = data.get("quantity")
        image = data.get("image", None)
        farmer_email = data.get("farmer_email")
        farmer_name = data.get("farmer_name")

        if not name or not price or not quantity or not farmer_email:
            return jsonify({"error": "All fields including farmer email are required"}), 400

        product = {
            "name": name,
            "price": float(price),
            "quantity": int(quantity),
            "image": image,
            "farmer_email": farmer_email,
            "farmer_name": farmer_name,
            "created_at": datetime.datetime.utcnow()
        }

        res = mongo.db.products.insert_one(product)
        product["_id"] = str(res.inserted_id)
        print("✅ Product saved successfully:", product["_id"])
        return jsonify(serialize_product(product)), 201
    except Exception as e:
        print("❌ Error saving product:", e)
        return jsonify({"error": "Failed to save product"}), 500

# Get all products (for buyers to see all products)
@products_bp.route("/", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_products():
    try:
        products = list(mongo.db.products.find().sort("created_at", -1))
        print(f"📊 Returning {len(products)} products")
        return jsonify([serialize_product(p) for p in products])
    except Exception as e:
        print("❌ Error fetching products:", e)
        return jsonify({"error": "Failed to fetch products"}), 500

# Get products by specific farmer (for farmer's dashboard)
@products_bp.route("/farmer/<farmer_email>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_farmer_products(farmer_email):
    try:
        print(f"👨‍🌾 Fetching products for farmer: {farmer_email}")
        products = list(mongo.db.products.find({"farmer_email": farmer_email}).sort("created_at", -1))
        print(f"📊 Found {len(products)} products for {farmer_email}")
        return jsonify([serialize_product(p) for p in products])
    except Exception as e:
        print("❌ Error fetching farmer products:", e)
        return jsonify({"error": "Failed to fetch farmer products"}), 500

# Delete product
@products_bp.route("/<id>", methods=["DELETE"], strict_slashes=False)
@cross_origin()
def delete_product(id):
    try:
        print(f"🗑️ Deleting product: {id}")
        result = mongo.db.products.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Product deleted successfully"})
    except Exception as e:
        print("❌ Error deleting product:", e)
        return jsonify({"error": "Failed to delete product"}), 500

# Update product
@products_bp.route("/<id>", methods=["PUT"], strict_slashes=False)
@cross_origin()
def update_product(id):
    try:
        data = request.get_json()
        print(f"✏️ Updating product {id} with data:", data)
        
        update_data = {
            "name": data.get("name"),
            "price": float(data.get("price")),
            "quantity": int(data.get("quantity")),
        }
        if "image" in data and data["image"]:
            update_data["image"] = data["image"]

        result = mongo.db.products.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Product not found"}), 404
            
        return jsonify({"message": "Product updated successfully"})
    except Exception as e:
        print("❌ Error updating product:", e)
        return jsonify({"error": "Failed to update product"}), 500
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import mongo
from bson import ObjectId
import datetime

favorites_bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")

# ✅ HEALTH CHECK FOR FAVORITES
@favorites_bp.route("/health", methods=["GET"], strict_slashes=False)
@cross_origin()
def favorites_health_check():
    return jsonify({
        "status": "healthy", 
        "service": "favorites",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "message": "Favorites service is running"
    })

# Get user's favorites
@favorites_bp.route("/user/<user_email>", methods=["GET"], strict_slashes=False)
@cross_origin()
def get_user_favorites(user_email):
    try:
        print(f"❤️ Fetching favorites for user: {user_email}")
        
        # Get user's favorite product IDs
        user_favorites = mongo.db.favorites.find_one({"user_email": user_email})
        
        if not user_favorites:
            return jsonify({"favorites": []})
        
        favorite_ids = user_favorites.get("product_ids", [])
        
        # Convert string IDs to ObjectId for query
        object_ids = [ObjectId(product_id) for product_id in favorite_ids]
        
        # Get full product details for favorites
        favorite_products = list(mongo.db.products.find({"_id": {"$in": object_ids}}))
        
        # Serialize products
        serialized_products = []
        for product in favorite_products:
            serialized_products.append({
                "_id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "quantity": product["quantity"],
                "image": product.get("image"),
                "farmer_email": product.get("farmer_email", ""),
                "farmer_name": product.get("farmer_name", ""),
                "created_at": product["created_at"].isoformat() if product.get("created_at") else datetime.datetime.utcnow().isoformat()
            })
        
        print(f"✅ Found {len(serialized_products)} favorite products for {user_email}")
        return jsonify({"favorites": serialized_products})
        
    except Exception as e:
        print("❌ Error fetching favorites:", str(e))
        return jsonify({"error": "Failed to fetch favorites"}), 500

# Add product to favorites
@favorites_bp.route("/user/<user_email>/add/<product_id>", methods=["POST"], strict_slashes=False)
@cross_origin()
def add_to_favorites(user_email, product_id):
    try:
        print(f"➕ Adding product {product_id} to favorites for user: {user_email}")
        
        # Validate product exists
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        # Update or create user favorites
        result = mongo.db.favorites.update_one(
            {"user_email": user_email},
            {
                "$addToSet": {"product_ids": product_id},  # Add if not exists
                "$setOnInsert": {"created_at": datetime.datetime.utcnow()}
            },
            upsert=True  # Create if doesn't exist
        )
        
        print(f"✅ Product added to favorites for {user_email}")
        return jsonify({
            "message": "Product added to favorites",
            "user_email": user_email,
            "product_id": product_id
        })
        
    except Exception as e:
        print("❌ Error adding to favorites:", str(e))
        return jsonify({"error": "Failed to add to favorites"}), 500

# Remove product from favorites
@favorites_bp.route("/user/<user_email>/remove/<product_id>", methods=["DELETE"], strict_slashes=False)
@cross_origin()
def remove_from_favorites(user_email, product_id):
    try:
        print(f"➖ Removing product {product_id} from favorites for user: {user_email}")
        
        # Remove product from user's favorites
        result = mongo.db.favorites.update_one(
            {"user_email": user_email},
            {"$pull": {"product_ids": product_id}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Product not in favorites"}), 404
        
        print(f"✅ Product removed from favorites for {user_email}")
        return jsonify({
            "message": "Product removed from favorites",
            "user_email": user_email,
            "product_id": product_id
        })
        
    except Exception as e:
        print("❌ Error removing from favorites:", str(e))
        return jsonify({"error": "Failed to remove from favorites"}), 500

# Toggle favorite status
@favorites_bp.route("/user/<user_email>/toggle/<product_id>", methods=["POST"], strict_slashes=False)
@cross_origin()
def toggle_favorite(user_email, product_id):
    try:
        print(f"🔄 Toggling favorite for product {product_id} for user: {user_email}")
        
        # Validate product exists
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        # Check if product is already in favorites
        user_favorites = mongo.db.favorites.find_one({"user_email": user_email})
        is_favorite = False
        
        if user_favorites and product_id in user_favorites.get("product_ids", []):
            # Remove from favorites
            mongo.db.favorites.update_one(
                {"user_email": user_email},
                {"$pull": {"product_ids": product_id}}
            )
            action = "removed"
        else:
            # Add to favorites
            mongo.db.favorites.update_one(
                {"user_email": user_email},
                {
                    "$addToSet": {"product_ids": product_id},
                    "$setOnInsert": {"created_at": datetime.datetime.utcnow()}
                },
                upsert=True
            )
            action = "added"
            is_favorite = True
        
        print(f"✅ Favorite toggled: {action} for {user_email}")
        return jsonify({
            "message": f"Product {action} from favorites",
            "user_email": user_email,
            "product_id": product_id,
            "is_favorite": is_favorite
        })
        
    except Exception as e:
        print("❌ Error toggling favorite:", str(e))
        return jsonify({"error": "Failed to toggle favorite"}), 500

# Check if product is in user's favorites
@favorites_bp.route("/user/<user_email>/check/<product_id>", methods=["GET"], strict_slashes=False)
@cross_origin()
def check_favorite(user_email, product_id):
    try:
        print(f"🔍 Checking if product {product_id} is in favorites for user: {user_email}")
        
        user_favorites = mongo.db.favorites.find_one({"user_email": user_email})
        is_favorite = user_favorites and product_id in user_favorites.get("product_ids", [])
        
        return jsonify({
            "user_email": user_email,
            "product_id": product_id,
            "is_favorite": is_favorite
        })
        
    except Exception as e:
        print("❌ Error checking favorite:", str(e))
        return jsonify({"error": "Failed to check favorite"}), 500
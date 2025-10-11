from flask import Blueprint, request, jsonify
from models import mongo
from bson import ObjectId
import datetime

products_bp = Blueprint("products", __name__, url_prefix="/api/products")

# Helper to convert ObjectId to string
def serialize_product(p):
    return {
        "_id": str(p["_id"]),
        "name": p["name"],
        "price": p["price"],
        "quantity": p["quantity"],
        "image": p.get("image"),
        "created_at": p["created_at"].isoformat()
    }

# Add product
@products_bp.route("/", methods=["POST"],strict_slashes=False)
def add_product():
    try:
        data = request.get_json()
        name = data.get("name")
        price = data.get("price")
        quantity = data.get("quantity")
        image = data.get("image", None)

        if not name or not price or not quantity:
            return jsonify({"error": "All fields required"}), 400

        product = {
            "name": name,
            "price": price,
            "quantity": quantity,
            "image": image,
            "created_at": datetime.datetime.utcnow()
        }

        res = mongo.db.products.insert_one(product)
        product["_id"] = str(res.inserted_id)
        return jsonify(product), 201
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to save product"}), 500

# Get all products
@products_bp.route("/", methods=["GET"],strict_slashes=False)
def get_products():
    products = list(mongo.db.products.find().sort("created_at", -1))
    return jsonify([serialize_product(p) for p in products])

# Delete product
@products_bp.route("/<id>", methods=["DELETE"],strict_slashes=False)
def delete_product(id):
    try:
        mongo.db.products.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Deleted"})
    except:
        return jsonify({"error": "Failed"}), 500

# Update product
@products_bp.route("/<id>", methods=["PUT"],strict_slashes=False)
def update_product(id):
    try:
        data = request.get_json()
        update_data = {
            "name": data.get("name"),
            "price": data.get("price"),
            "quantity": data.get("quantity"),
        }
        if "image" in data and data["image"]:
            update_data["image"] = data["image"]

        mongo.db.products.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        return jsonify({"message": "Updated"})
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to update"}), 500

from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os

buyer_bp = Blueprint('buyer_bp', __name__, url_prefix='/api/buyer')

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/farm2home")
client = MongoClient(MONGO_URI)
db = client["farm2home"]
users = db["users"]

# ✅ Get buyer profile (if not found, return empty default profile)
@buyer_bp.route("/<email>", methods=["GET"])
def get_buyer(email):
    user = users.find_one({"email": email, "role": "buyer"})
    if not user:
        # Return default profile with ALL fields
        return jsonify({
            "email": email,
            "name": "",
            "phone": "",
            "business_name": "",
            "business_type": "",
            "location": ""
        }), 200

    # ✅ RETURN ALL FIELDS (even if they don't exist in database)
    user_data = {
        "_id": str(user["_id"]),
        "email": user.get("email", email),
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),  # This ensures phone field exists
        "business_name": user.get("business_name", ""),  # This ensures business_name field exists  
        "business_type": user.get("business_type", ""),  # This ensures business_type field exists
        "location": user.get("location", ""),  # This ensures location field exists
        "role": user.get("role", "buyer")
    }
    
    # Remove password if it exists
    user_data.pop("password", None)
    
    return jsonify(user_data), 200


# ✅ Save or update profile
@buyer_bp.route("", methods=["POST"])
def save_buyer():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    update_fields = {
        "name": data.get("name", ""),
        "phone": data.get("phone", ""),
        "business_name": data.get("business_name", ""),
        "business_type": data.get("business_type", ""),
        "location": data.get("location", ""),
        "role": "buyer"
    }

    users.update_one(
        {"email": email, "role": "buyer"},
        {"$set": update_fields},
        upsert=True
    )

    return jsonify({"message": "Profile saved successfully!"}), 200
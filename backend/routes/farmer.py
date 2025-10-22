from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os

farmer_bp = Blueprint('farmer_bp', __name__, url_prefix='/api/farmer')

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/farm2home")
client = MongoClient(MONGO_URI)
db = client["farm2home"]
users = db["users"]

# ✅ Get farmer profile (if not found, return empty default profile)
@farmer_bp.route("/<email>", methods=["GET"])
def get_farmer(email):
    user = users.find_one({"email": email, "role": "farmer"})
    if not user:
        # Return default profile with ALL fields
        return jsonify({
            "email": email,
            "name": "",
            "phone": "",
            "crops": [],
            "location": "",
            "farm_size": "",
            "experience_years": ""
        }), 200

    # ✅ RETURN ALL FIELDS (even if they don't exist in database)
    user_data = {
        "_id": str(user["_id"]),
        "email": user.get("email", email),
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),  # This ensures phone field exists
        "crops": user.get("crops", []),  # This ensures crops field exists  
        "location": user.get("location", ""),  # This ensures location field exists
        "farm_size": user.get("farm_size", ""),  # This ensures farm_size field exists
        "experience_years": user.get("experience_years", ""),  # This ensures experience_years exists
        "role": user.get("role", "farmer")
    }
    
    # Remove password if it exists
    user_data.pop("password", None)
    
    return jsonify(user_data), 200


# ✅ Save or update profile
@farmer_bp.route("", methods=["POST"])
def save_farmer():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    update_fields = {
        "name": data.get("name", ""),
        "phone": data.get("phone", ""),
        "crops": data.get("crops", []),
        "location": data.get("location", ""),
        "farm_size": data.get("farm_size", ""),
        "experience_years": data.get("experience_years", ""),
        "role": "farmer"
    }

    users.update_one(
        {"email": email, "role": "farmer"},
        {"$set": update_fields},
        upsert=True
    )

    return jsonify({"message": "Profile saved successfully!"}), 200

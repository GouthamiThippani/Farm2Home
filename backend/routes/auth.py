from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os
from bson import ObjectId  # add this import at the top


auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/farm2home")
client = MongoClient(MONGO_URI)
db = client["farm2home"]
users = db["users"]

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing fields"}), 400

    if users.find_one({"email": email, "role": role}):
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = generate_password_hash(password)
    user = {"name": name, "email": email, "password": hashed_pw, "role": role}
    result = users.insert_one(user)

    # Convert ObjectId to string
    user["_id"] = str(result.inserted_id)
    del user["password"]

    return jsonify({"message": "Signup successful", "user": user}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    user = users.find_one({"email": email, "role": role})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    user["_id"] = str(user["_id"])  # Convert ObjectId to string
    del user["password"]

    return jsonify({"message": "Login successful", "user": user}), 200

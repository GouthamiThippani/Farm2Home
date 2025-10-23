
from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.farmer import farmer_bp
from routes.products import products_bp
from routes.orders import orders_bp
from routes.buyer import buyer_bp
from routes.analytics import analytics_bp  # <-- ADD THIS LINE
from models import init_app, mongo
from config import Config
import datetime

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Initialize Mongo
init_app(app)
app.mongo = mongo

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(farmer_bp)
app.register_blueprint(products_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(buyer_bp)
app.register_blueprint(analytics_bp)  # <-- ADD THIS LINE

# ✅ HEALTH CHECK ROUTE
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "Farm2Home Backend is running",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "Farm2Home API"
    })

# ✅ Root endpoint
@app.route('/')
def home():
    return jsonify({
        "message": "Farm2Home API Server",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health",
            "products": "/api/products",
            "orders": "/api/orders",
            "auth": "/api/auth",
            "buyer": "/api/buyer",
            "analytics": "/api/analytics"  # <-- ADD THIS ENDPOINT TOO
        }
    })

if __name__ == "__main__":
    print("🚀 Starting Farm2Home Server on http://localhost:5000")
    print("✅ Health check available at: http://localhost:5000/api/health")
    print("✅ Products API available at: http://localhost:5000/api/products")
    print("✅ Orders API available at: http://localhost:5000/api/orders")
    print("✅ Buyer API available at: http://localhost:5000/api/buyer")
    print("✅ Analytics API available at: http://localhost:5000/api/analytics")  # <-- ADD THIS LINE
    app.run(debug=True, port=5000)
    
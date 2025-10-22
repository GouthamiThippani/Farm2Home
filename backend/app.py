from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.farmer import farmer_bp
from routes.products import products_bp
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

# ✅ HEALTH CHECK ROUTE (Fixed)
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "Farm2Home Backend is running",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "Farm2Home API"
    })

# ✅ ADD THIS: Root endpoint
@app.route('/')
def home():
    return jsonify({
        "message": "Farm2Home API Server",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health",
            "products": "/api/products",
            "auth": "/api/auth"
        }
    })

if __name__ == "__main__":
    print("🚀 Starting Farm2Home Server on http://localhost:5000")
    print("✅ Health check available at: http://localhost:5000/api/health")
    print("✅ Products API available at: http://localhost:5000/api/products")
    app.run(debug=True, port=5000)
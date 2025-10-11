from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.farmer import farmer_bp
from routes.products import products_bp  # Correct blueprint name
from models import init_app, mongo
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize Mongo
init_app(app)
app.mongo = mongo

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(farmer_bp)
app.register_blueprint(products_bp)  # Register product blueprint correctly

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'your-secret-key-here'

# CORS Configuration
cors = CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5501", "http://127.0.0.1:5501"],
        "methods": ["GET", "POST", "PUT", "OPTIONS"],
        "allow_headers": ["Authorization", "Content-Type"],
        "supports_credentials": True
    }
})

# Mock Database
users_db = {
    "abhi": {
        "password": generate_password_hash("abhirami"),
        "email": "abhi@example.com",
        "profile_image": "https://example.com/profile.jpg",
        "stats": {
            "activities": 12,
            "calories": 3450,
            "workouts": 8
        }
    }
}

# JWT Authentication Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            token = auth_header.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['username']
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    user = users_db.get(username)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'username': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'token': token,
        'user': {
            'username': username,
            'email': user['email'],
            'profileImage': user['profile_image']
        }
    })



@app.route('/profile', methods=['GET', 'PUT'])
@token_required  # Require authentication
def profile(current_user):
    user = users_db.get(current_user)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if request.method == 'GET':
        return jsonify({
            'username': current_user,
            'email': user['email'],
            'profileImage': user['profile_image'],
            'stats': user['stats']
        })

    if request.method == 'PUT':
        data = request.get_json()
        
        # Update allowed fields only
        if 'email' in data:
            user['email'] = data['email']
        if 'profileImage' in data:
            user['profile_image'] = data['profileImage']
        
        return jsonify({
            'message': 'Profile updated!',
            'updatedProfile': user
        })


@app.route('/api/user-stats', methods=['GET'])
@token_required
def user_stats(current_user):
    return jsonify(users_db[current_user]['stats'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
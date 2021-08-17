from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/', methods=['GET'])
def index():
    return "API is running..."


@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    image_data = request.form['image_data']

    response = jsonify(util.classify_image(image_data))

    return response


if __name__ == "__main__":
    print("Starting Python Flask Server For Sports Celebrity Image Classification...")
    util.load_saved_artifacts()
    app.run(debug=True)

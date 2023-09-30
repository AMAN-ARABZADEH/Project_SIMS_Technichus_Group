# Import necessary modules from Flask, Flask-CORS, and Google Translate
from flask import Flask, request, jsonify
from flask_cors import CORS
from googletrans import Translator, LANGUAGES

# (This code block appears to print out all supported languages and has been commented out)
"""
i = 0
for lang in LANGUAGES:
    i += 1
    print(f'{lang} - {LANGUAGES[lang]}')

print(f"Total supported languages are: {i}")
"""

# Create a Flask web server instance
app = Flask(__name__)
# Enable CORS for the Flask app (this allows cross-origin requests, useful for web apps hosted on different domains), else gives an error in the console
# Already tested
CORS(app)

# Define a function to split a long text into smaller chunks, due to limitation size translation Google free API version. 
def chunk_text(text, chunk_size=500):
    """Split text into smaller chunks to prevent translation errors due to length."""
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

# Define a route for the Flask app that will handle text translation requests
@app.route('/translate', methods=['POST'])
def translate_text():
    # Retrieve the input data from the HTTP POST request
    data = request.json
    text = data['text']
    target_language = data['language']

    # Create an instance of the Google Translate Translator
    translator = Translator()

    # Split the input text into smaller chunks using the previously defined function
    text_chunks = chunk_text(text)

    # Create an empty list to store translations
    translations = []

    # Translate each chunk of text and append the result to the translations list
    for chunk in text_chunks:
        translated_chunk = translator.translate(chunk, dest=target_language)
        translations.append(translated_chunk.text)

    # Combine the translated text chunks into a single string
    translated_text = ' '.join(translations)

    # Return the translated text as a JSON response
    return jsonify({'translated': translated_text})

# This conditional statement ensures the Flask app runs only when the script is executed directly
if __name__ == '__main__':
    app.run(debug=True)  # Start the Flask app in debug mode
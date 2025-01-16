from transformers import MarianTokenizer, MarianMTModel

from transformers import pipeline
from langdetect import detect  # Use langdetect to detect source language
import logging
import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

def summarize_blog(content):
    # Using Hugging Face's Summarization pipeline
    summarizer = pipeline("summarization", model="t5-small")
    summary = summarizer(content, max_length=100, min_length=30, do_sample=False)
    return summary[0]['summary_text']



logger = logging.getLogger(__name__)

def translate_text(content, target_lang):
    try:
        # Detect the source language dynamically
        source_lang = detect(content)

        # Log detected source language
        logger.info(f"Detected source language: {source_lang}")

        # Map source-target language pair to the appropriate model
        model_name_map = {
            ("en", "de"): "Helsinki-NLP/opus-mt-en-de",
            ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
            ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
            ("en", "it"): "Helsinki-NLP/opus-mt-en-it",
            ("en", "zh-cn"): "Helsinki-NLP/opus-mt-en-zh",
            ("en", "ja"): "Helsinki-NLP/opus-mt-en-ja",
            ("en", "ar"): "Helsinki-NLP/opus-mt-en-ar",
            ("en", "ru"): "Helsinki-NLP/opus-mt-en-ru",
            ("en", "pt"): "Helsinki-NLP/opus-mt-en-pt",
            ("en", "nl"): "Helsinki-NLP/opus-mt-en-nl",
            ("en", "ko"): "Helsinki-NLP/opus-mt-en-ko",
            ("en", "hi"): "Helsinki-NLP/opus-mt-en-hi",
            ("en", "sv"): "Helsinki-NLP/opus-mt-en-sv",
            ("en", "pl"): "Helsinki-NLP/opus-mt-en-pl",
            ("en", "da"): "Helsinki-NLP/opus-mt-en-da",
            ("en", "fi"): "Helsinki-NLP/opus-mt-en-fi",
            ("en", "cs"): "Helsinki-NLP/opus-mt-en-cs",
            ("en", "tr"): "Helsinki-NLP/opus-mt-en-tr",
            ("en", "he"): "Helsinki-NLP/opus-mt-en-he",
            ("en", "bg"): "Helsinki-NLP/opus-mt-en-bg",
            ("en", "uk"): "Helsinki-NLP/opus-mt-en-uk",
            ("en", "ro"): "Helsinki-NLP/opus-mt-en-ro",
            ("en", "id"): "Helsinki-NLP/opus-mt-en-id",
            ("en", "ms"): "Helsinki-NLP/opus-mt-en-ms",
            ("en", "th"): "Helsinki-NLP/opus-mt-en-th",
            ("en", "vi"): "Helsinki-NLP/opus-mt-en-vi",
            ("en", "no"): "Helsinki-NLP/opus-mt-en-no",
            ("en", "hu"): "Helsinki-NLP/opus-mt-en-hu",
            ("en", "lt"): "Helsinki-NLP/opus-mt-en-lt",
            ("en", "lv"): "Helsinki-NLP/opus-mt-en-lv",
            ("en", "et"): "Helsinki-NLP/opus-mt-en-et",
            ("en", "sk"): "Helsinki-NLP/opus-mt-en-sk",
            ("en", "sl"): "Helsinki-NLP/opus-mt-en-sl",
            ("en", "el"): "Helsinki-NLP/opus-mt-en-el",
            ("en", "sw"): "Helsinki-NLP/opus-mt-en-sw",
            ("de", "en"): "Helsinki-NLP/opus-mt-de-en",
            ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
            ("es", "en"): "Helsinki-NLP/opus-mt-es-en",
            ("it", "en"): "Helsinki-NLP/opus-mt-it-en",
            ("zh-cn", "en"): "Helsinki-NLP/opus-mt-zh-en",
            ("ja", "en"): "Helsinki-NLP/opus-mt-ja-en",
            ("ar", "en"): "Helsinki-NLP/opus-mt-ar-en",
            ("ru", "en"): "Helsinki-NLP/opus-mt-ru-en",
            ("pt", "en"): "Helsinki-NLP/opus-mt-pt-en",
            ("nl", "en"): "Helsinki-NLP/opus-mt-nl-en",
            ("ko", "en"): "Helsinki-NLP/opus-mt-ko-en",
            ("hi", "en"): "Helsinki-NLP/opus-mt-hi-en",
            ("sv", "en"): "Helsinki-NLP/opus-mt-sv-en",
            ("pl", "en"): "Helsinki-NLP/opus-mt-pl-en",
            ("da", "en"): "Helsinki-NLP/opus-mt-da-en",
            ("fi", "en"): "Helsinki-NLP/opus-mt-fi-en",
            ("cs", "en"): "Helsinki-NLP/opus-mt-cs-en",
            ("tr", "en"): "Helsinki-NLP/opus-mt-tr-en",
            ("he", "en"): "Helsinki-NLP/opus-mt-he-en",
            ("bg", "en"): "Helsinki-NLP/opus-mt-bg-en",
            ("uk", "en"): "Helsinki-NLP/opus-mt-uk-en",
            ("ro", "en"): "Helsinki-NLP/opus-mt-ro-en",
            ("id", "en"): "Helsinki-NLP/opus-mt-id-en",
            ("ms", "en"): "Helsinki-NLP/opus-mt-ms-en",
            ("th", "en"): "Helsinki-NLP/opus-mt-th-en",
            ("vi", "en"): "Helsinki-NLP/opus-mt-vi-en",
            ("no", "en"): "Helsinki-NLP/opus-mt-no-en",
            ("hu", "en"): "Helsinki-NLP/opus-mt-hu-en",
            ("lt", "en"): "Helsinki-NLP/opus-mt-lt-en",
            ("lv", "en"): "Helsinki-NLP/opus-mt-lv-en",
            ("et", "en"): "Helsinki-NLP/opus-mt-et-en",
            ("sk", "en"): "Helsinki-NLP/opus-mt-sk-en",
            ("sl", "en"): "Helsinki-NLP/opus-mt-sl-en",
            ("el", "en"): "Helsinki-NLP/opus-mt-el-en",
            ("sw", "en"): "Helsinki-NLP/opus-mt-sw-en",
        }

        # Get the appropriate model for the source-target pair
        model_name = model_name_map.get((source_lang, target_lang))

        if not model_name:
            # Fallback system: Translate to English first if no direct model is found
            logger.info(f"Fallback translation: {source_lang} -> en -> {target_lang}")
            
            # First, translate from source to English
            source_to_english_model = model_name_map.get((source_lang, "en"))
            if not source_to_english_model:
                raise ValueError(f"Unsupported source language for fallback: {source_lang}")
            
            tokenizer = MarianTokenizer.from_pretrained(source_to_english_model)
            model = MarianMTModel.from_pretrained(source_to_english_model)
            input_ids = tokenizer.encode(content, return_tensors="pt", max_length=512, truncation=True)
            outputs = model.generate(input_ids, max_length=512, num_beams=4, early_stopping=True)
            translated_to_english = tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Now, translate from English to target language
            english_to_target_model = model_name_map.get(("en", target_lang))
            if not english_to_target_model:
                raise ValueError(f"Unsupported target language for fallback: {target_lang}")
            
            tokenizer = MarianTokenizer.from_pretrained(english_to_target_model)
            model = MarianMTModel.from_pretrained(english_to_target_model)
            input_ids = tokenizer.encode(translated_to_english, return_tensors="pt", max_length=512, truncation=True)
            outputs = model.generate(input_ids, max_length=512, num_beams=4, early_stopping=True)

            translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            return translated_text

        # Load tokenizer and model for direct translation
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)

        # Perform translation
        input_ids = tokenizer.encode(content, return_tensors="pt", max_length=512, truncation=True)
        outputs = model.generate(input_ids, max_length=512, num_beams=4, early_stopping=True)

        translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated_text

    except Exception as e:
        logger.error(f"Translation failed: {str(e)}")
        raise ValueError(f"Translation failed: {str(e)}")

class SentimentAnalyzer:
    def __init__(self):
        base_path = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_path, 'model', 'trained_model.sav')
        vectorizer_path = os.path.join(base_path, 'model', 'vectorizer.pkl')  # Assuming you saved the vectorizer

        # Load the trained logistic regression model
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)

        # Load the vectorizer (ensure the vectorizer was saved during model training)
        with open(vectorizer_path, 'rb') as f:
            self.vectorizer = pickle.load(f)

    def analyze_sentiment(self, comment_text):
        # Convert the comment text into numeric features using the same vectorizer
        input_data = self.vectorizer.transform([comment_text])  # Transform text to numeric features
        
        # Predict the sentiment using the model
        prediction = self.model.predict(input_data)
        
        # Return 1 for positive sentiment, 0 for negative sentiment
        return prediction[0]  # 1 for positive, 0 for negative
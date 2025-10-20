import spacy
from typing import List

class SpacyKeywordExtractor():
    def __init__(self, model="en_core_web_sm"):
        self.nlp = spacy.load(model)

    def extract(self, text: str) -> List[str]:
        doc = self.nlp(text)
        keywords = set()
        
        for chunk in doc.noun_chunks:
            keywords.add(chunk.text.lower())
            
        for token in doc:
            if token.pos_ in ["PROPN", "NOUN"]:
                keywords.add(token.text.lower())

        return list(keywords)

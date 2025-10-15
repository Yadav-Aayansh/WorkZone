import yake
import spacy
from abc import ABC, abstractmethod
from typing import List

class KeywordExtractor(ABC):
    @abstractmethod
    def extract(self, text: str) -> List[str]:
        pass

class YakeKeywordExtractor(KeywordExtractor):
    def __init__(self, language="en", max_ngram_size=3, top_k=20):
        self.language = language
        self.max_ngram_size = max_ngram_size
        self.top_k = top_k

        self.custom_kw_extractor = yake.KeywordExtractor(
            lan=self.language, 
            n=self.max_ngram_size, 
            dedupLim=0.9, 
            top=self.top_k, 
            features=None
        )

    def extract(self, text: str) -> List[str]:
        keywords_with_scores = self.custom_kw_extractor.extract_keywords(text)
        return [keyword for keyword, score in keywords_with_scores]


class SpacyKeywordExtractor(KeywordExtractor):
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


if __name__ == '__main__':
    sample_jd = """
    We are seeking a Senior Backend Engineer to join our dynamic team.
    The ideal candidate will have 5+ years of experience with Python and Django.
    Responsibilities include designing and implementing RESTful APIs, working with
    PostgreSQL databases, and deploying services on AWS. Experience with Docker
    and CI/CD pipelines is a huge plus. You will collaborate with our front-end
    team, who use React, to deliver scalable solutions. Knowledge of machine
    learning principles is desirable but not required.
    """

    print("Sample Job Description")
    print(sample_jd)
    
    print("Keywords from YAKE (Statistical):")
    yake_extractor = YakeKeywordExtractor()
    yake_keywords = yake_extractor.extract(sample_jd)
    print(yake_keywords)
    
    print("Keywords from spaCy (Linguistic):")
    spacy_extractor = SpacyKeywordExtractor()
    spacy_keywords = spacy_extractor.extract(sample_jd)
    filtered_spacy_keywords = [kw for kw in spacy_keywords if len(kw.split()) <= 3 and len(kw) > 2]
    print(sorted(filtered_spacy_keywords))
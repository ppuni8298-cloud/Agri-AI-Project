import os
import json
from typing import Any

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from openai import OpenAI


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

PINECONE_INDEX_NAME = os.getenv(
    "PINECONE_INDEX_NAME",
    "agriculture"
)

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-3.5-turbo"
)


# =========================================================
# CHECK ENVIRONMENT VARIABLES
# =========================================================

if not PINECONE_API_KEY:
    raise RuntimeError(
        "PINECONE_API_KEY is missing."
    )

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is missing."
    )


# =========================================================
# EMBEDDING MODEL
# =========================================================

print("========================================")
print("Loading embedding model...")
print("========================================")

embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

print(
    "Embedding model loaded successfully."
)


# =========================================================
# PINECONE
# =========================================================

print("\n========================================")
print("Connecting to Pinecone...")
print("========================================")

pc = Pinecone(
    api_key=PINECONE_API_KEY
)

index = pc.Index(
    PINECONE_INDEX_NAME
)

print(
    "Pinecone connected successfully."
)

print(
    "Index:",
    PINECONE_INDEX_NAME
)


# =========================================================
# OPENAI
# =========================================================

client = OpenAI(
    api_key=OPENAI_API_KEY
)

print(
    "OpenAI client initialized."
)

print(
    "Model:",
    OPENAI_MODEL
)


# =========================================================
# CONFIG
# =========================================================

TOP_K = 7

# Do not make this too high.
# 0.30 allows valid agricultural questions
# with weaker semantic similarity.
SIMILARITY_THRESHOLD = 0.30


# =========================================================
# LANGUAGE DETECTION
# =========================================================

def detect_language(text: str):

    text = text or ""

    counts = {
        "kn": 0,
        "ta": 0,
        "te": 0,
        "hi": 0,
        "ml": 0,
        "bn": 0,
        "gu": 0,
        "mr": 0,
        "en": 0,
    }

    for char in text:

        code = ord(char)

        # Kannada
        if 0x0C80 <= code <= 0x0CFF:
            counts["kn"] += 1

        # Telugu
        elif 0x0C00 <= code <= 0x0C7F:
            counts["te"] += 1

        # Tamil
        elif 0x0B80 <= code <= 0x0BFF:
            counts["ta"] += 1

        # Malayalam
        elif 0x0D00 <= code <= 0x0D7F:
            counts["ml"] += 1

        # Devanagari
        elif 0x0900 <= code <= 0x097F:
            counts["hi"] += 1

        # Bengali
        elif 0x0980 <= code <= 0x09FF:
            counts["bn"] += 1

        # Gujarati
        elif 0x0A80 <= code <= 0x0AFF:
            counts["gu"] += 1

        # Latin
        elif "a" <= char.lower() <= "z":
            counts["en"] += 1

    best_language = max(
        counts,
        key=counts.get
    )

    if counts[best_language] == 0:
        return "en"

    return best_language


# =========================================================
# LANGUAGE NAMES
# =========================================================

LANGUAGE_NAMES = {

    "en": "English",

    "kn": "Kannada",

    "hi": "Hindi",

    "ta": "Tamil",

    "te": "Telugu",

    "ml": "Malayalam",

    "bn": "Bengali",

    "gu": "Gujarati",

    "mr": "Marathi",
}


# =========================================================
# KNOWN AGRICULTURAL TERMS
# =========================================================

AGRICULTURAL_TERMS = {

    # PMFBY
    "pmfby":
        "PMFBY Pradhan Mantri Fasal Bima Yojana "
        "crop insurance",

    "pmfby?":
        "PMFBY Pradhan Mantri Fasal Bima Yojana "
        "crop insurance",

    # PMBY - ambiguous, but commonly intended as PMFBY
    "pmby":
        "PMBY PMFBY Pradhan Mantri Fasal Bima Yojana "
        "crop insurance",

    "pmby?":
        "PMBY PMFBY Pradhan Mantri Fasal Bima Yojana "
        "crop insurance",

    # PM KISAN
    "pm kisan":
        "PM KISAN Pradhan Mantri Kisan Samman Nidhi "
        "farmer income support scheme",

    "pm-kisan":
        "PM KISAN Pradhan Mantri Kisan Samman Nidhi "
        "farmer income support scheme",

    # PM KMY
    "pm kmy":
        "PM KMY Pradhan Mantri Kisan Maan Dhan Yojana "
        "farmer pension scheme",

    "pm-kmy":
        "PM KMY Pradhan Mantri Kisan Maan Dhan Yojana "
        "farmer pension scheme",
}


# =========================================================
# KANNADA AGRICULTURAL TERMS
# =========================================================

KANNADA_AGRICULTURAL_TERMS = {

    # ಪಿಎಂಬಿವೈ
    "ಪಿಎಂಬಿವೈ":
        "PMFBY Pradhan Mantri Fasal Bima Yojana "
        "crop insurance",

    # ಪಿಎಂಎಫ್ಬಿವೈ
    "ಪಿಎಂಎಫ್ಬಿವೈ":
        "PMFBY Pradhan Mantri Fasal Bima Yojana "
        "crop insurance",

    # PM Kisan Kannada transliteration
    "ಪಿಎಂ ಕಿಸಾನ್":
        "PM KISAN Pradhan Mantri Kisan Samman Nidhi "
        "farmer scheme",

    "ಪಿಎಂ-ಕಿಸಾನ್":
        "PM KISAN Pradhan Mantri Kisan Samman Nidhi "
        "farmer scheme",

    # PM KMY
    "ಪಿಎಂ ಕಿಮೈ":
        "PM KMY Pradhan Mantri Kisan Maan Dhan Yojana "
        "farmer pension scheme",
}


# =========================================================
# NORMALIZE KNOWN ENGLISH AGRICULTURAL TERMS
# =========================================================

def normalize_known_agricultural_terms(
    query: str
):

    normalized = query.strip()

    lower_query = normalized.lower()

    # Exact match
    for term, expansion in AGRICULTURAL_TERMS.items():

        if lower_query == term:

            return expansion

    # Term at beginning
    for term, expansion in AGRICULTURAL_TERMS.items():

        if lower_query.startswith(
            term + " "
        ):

            remaining = normalized[
                len(term):
            ].strip()

            if remaining:

                return (
                    expansion
                    + " "
                    + remaining
                )

            return expansion

    return normalized


# =========================================================
# NORMALIZE KANNADA AGRICULTURAL TERMS
# =========================================================

def normalize_kannada_agricultural_terms(
    query: str
):

    normalized = query.strip()

    for term, expansion in KANNADA_AGRICULTURAL_TERMS.items():

        if term in normalized:

            remaining = normalized.replace(
                term,
                ""
            ).strip()

            if remaining:

                return (
                    expansion
                    + " "
                    + remaining
                )

            return expansion

    return normalized


# =========================================================
# QUERY NORMALIZATION FOR SEARCH
# =========================================================

def normalize_query_for_search(
    query: str,
    detected_language: str
):

    # -----------------------------------------------------
    # First check known English agricultural terms
    # -----------------------------------------------------

    known_term = normalize_known_agricultural_terms(
        query
    )

    if known_term != query.strip():

        print(
            "Known agricultural term detected:"
        )

        print(
            known_term
        )

        return known_term

    # -----------------------------------------------------
    # Kannada known terms
    # -----------------------------------------------------

    if detected_language == "kn":

        kannada_term = (
            normalize_kannada_agricultural_terms(
                query
            )
        )

        if kannada_term != query.strip():

            print(
                "Known Kannada agricultural term:"
            )

            print(
                kannada_term
            )

            return kannada_term

    # -----------------------------------------------------
    # Use OpenAI to normalize the query
    # -----------------------------------------------------

    language_name = LANGUAGE_NAMES.get(
        detected_language,
        "English"
    )

    prompt = f"""
You are preparing a search query for an
agricultural knowledge base.

User language:
{language_name}

User question:
{query}

Create a concise English search query
that captures the agricultural meaning.

IMPORTANT:

1. Expand agricultural acronyms when possible.

2. Correct obvious spelling mistakes.

3. Preserve important crop names.

4. Preserve pest names.

5. Preserve disease names.

6. Preserve fertilizer names.

7. Preserve government scheme names.

8. Preserve insurance scheme names.

9. Preserve agricultural technical terms.

10. If the user asks:

"What is maize?"

the search query should contain:
maize crop agriculture

11. If the user asks:

"What is maze?"

and it is clearly an agricultural question,
interpret the likely term as:
maize crop agriculture

12. If the user asks:

"What is PMFBY?"

include:
PMFBY Pradhan Mantri Fasal Bima Yojana
crop insurance

13. If the user asks a Kannada question,
translate its meaning into English for search.

14. Do NOT answer the question.

15. Return ONLY the search query.

Search query:
"""

    try:

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You create concise search "
                        "queries for an agricultural "
                        "knowledge base."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        result = (
            response
            .choices[0]
            .message
            .content
        )

        if result:

            result = result.strip()

            result = result.strip(
                '"'
            ).strip(
                "'"
            )

            if result:

                return result

    except Exception as e:

        print(
            "Query normalization error:",
            str(e)
        )

    # Fallback
    return query


# =========================================================
# CREATE EMBEDDING
# =========================================================

def create_embedding(
    text: str
):

    vector = embedding_model.encode(
        text,
        normalize_embeddings=True
    )

    return vector.tolist()


# =========================================================
# FORMAT SOURCE
# =========================================================

def format_source(
    match: Any,
    index_number: int
):

    metadata = (
        match.get(
            "metadata",
            {}
        ) or {}
    )

    source = (
        metadata.get("source")
        or metadata.get("file")
        or metadata.get("filename")
        or metadata.get("document")
        or "Unknown source"
    )

    page = (
        metadata.get("page")
        or metadata.get("page_number")
        or metadata.get("page_no")
        or "N/A"
    )

    chunk = (
        metadata.get("chunk")
        or metadata.get("chunk_id")
        or metadata.get("chunk_index")
        or index_number
    )

    score = float(
        match.get(
            "score",
            0
        )
    )

    return {

        "source":
            str(source),

        "page":
            str(page),

        "chunk":
            str(chunk),

        "score":
            round(
                score,
                4
            ),

        "confidence":
            round(
                max(
                    0,
                    min(
                        score * 100,
                        100
                    )
                ),
                2
            )
    }


# =========================================================
# RETRIEVE DOCUMENTS
# =========================================================

def retrieve_documents(
    query: str
):

    print("\n========================================")
    print("PINECONE SEARCH")
    print("Search query:", query)
    print("========================================")

    embedding = create_embedding(
        query
    )

    result = index.query(
        vector=embedding,
        top_k=TOP_K,
        include_metadata=True
    )

    matches = result.get(
        "matches",
        []
    )

    print(
        "Matches:",
        len(matches)
    )

    valid_matches = []

    for i, match in enumerate(
        matches,
        start=1
    ):

        score = float(
            match.get(
                "score",
                0
            )
        )

        print(
            f"Match {i}: {score:.4f}"
        )

        if score >= SIMILARITY_THRESHOLD:

            valid_matches.append(
                match
            )

    print(
        "Valid matches:",
        len(valid_matches)
    )

    return valid_matches


# =========================================================
# BUILD CONTEXT
# =========================================================

def build_context(
    matches
):

    context_parts = []

    for i, match in enumerate(
        matches,
        start=1
    ):

        metadata = (
            match.get(
                "metadata",
                {}
            ) or {}
        )

        text = (
            metadata.get("text")
            or metadata.get("content")
            or metadata.get("chunk_text")
            or metadata.get("page_content")
            or ""
        )

        if not text:

            print(
                f"WARNING: Match {i} has no text metadata."
            )

            continue

        source = format_source(
            match,
            i
        )

        context_parts.append(
            f"""
SOURCE {i}

Document: {source["source"]}
Page: {source["page"]}
Chunk: {source["chunk"]}
Similarity: {source["score"]}

Content:
{text}
"""
        )

    return "\n".join(
        context_parts
    )


# =========================================================
# CALCULATE CONFIDENCE
# =========================================================

def calculate_confidence(
    matches
):

    if not matches:

        return 0

    scores = [

        float(
            match.get(
                "score",
                0
            )
        )

        for match in matches
    ]

    best_score = max(
        scores
    )

    if len(scores) > 1:

        remaining = scores[1:]

        average_remaining = (
            sum(remaining)
            / len(remaining)
        )

        confidence = (
            best_score * 0.70
            + average_remaining * 0.30
        )

    else:

        confidence = best_score

    return round(
        max(
            0,
            min(
                confidence * 100,
                100
            )
        ),
        2
    )


# =========================================================
# NO MATCH MESSAGE
# =========================================================

def get_no_match_message(
    language: str
):

    messages = {

        "kn":
            "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ "
            "ಸಂಬಂಧಿಸಿದ ಸಾಕಷ್ಟು ಮಾಹಿತಿ "
            "ಕೃಷಿ ಜ್ಞಾನಕೋಶದಲ್ಲಿ "
            "ಸಿಗಲಿಲ್ಲ.",

        "hi":
            "क्षमा करें, आपके प्रश्न "
            "से संबंधित पर्याप्त "
            "जानकारी कृषि ज्ञान आधार "
            "में नहीं मिली।",

        "ta":
            "மன்னிக்கவும், உங்கள் "
            "கேள்விக்கு தேவையான "
            "தகவல் வேளாண்மை "
            "அறிவுத்தளத்தில் இல்லை.",

        "te":
            "క్షమించండి, మీ ప్రశ్నకు "
            "సంబంధించిన తగిన సమాచారం "
            "వ్యవసాయ జ్ఞాన ఆధారంలో "
            "లేదు.",

        "ml":
            "ക്ഷമിക്കണം, നിങ്ങളുടെ "
            "ചോദ്യത്തിന് ആവശ്യമായ "
            "വിവരം കാർഷിക വിജ്ഞാന "
            "ശേഖരത്തിൽ ലഭ്യമല്ല.",

        "bn":
            "দুঃখিত, আপনার প্রশ্নের "
            "সঙ্গে সম্পর্কিত পর্যাপ্ত "
            "তথ্য কৃষি জ্ঞানভাণ্ডারে "
            "পাওয়া যায়নি।",

        "gu":
            "માફ કરશો, તમારા પ્રશ્નને "
            "લગતી પૂરતી માહિતી કૃષિ "
            "જ્ઞાન આધાર માં મળી નથી.",

        "mr":
            "क्षमस्व, तुमच्या प्रश्नाशी "
            "संबंधित पुरेशी माहिती "
            "कृषी ज्ञान आधारामध्ये "
            "मिळाली नाही.",

        "en":
            "Sorry, I could not find "
            "enough relevant information "
            "in the agricultural knowledge "
            "base to answer your question."
    }

    return messages.get(
        language,
        messages["en"]
    )


# =========================================================
# GENERATE ANSWER
# =========================================================

def generate_answer(
    original_query: str,
    context: str,
    history: list,
    detected_language: str
):

    language_name = LANGUAGE_NAMES.get(
        detected_language,
        "English"
    )

    # -----------------------------------------------------
    # Conversation history
    # -----------------------------------------------------

    try:

        history_text = json.dumps(
            history[-10:],
            ensure_ascii=False
        )

    except Exception:

        history_text = str(
            history[-10:]
        )

    # -----------------------------------------------------
    # System prompt
    # -----------------------------------------------------

    system_prompt = f"""
You are Agri AI, an agricultural advisory assistant.

==================================================
USER LANGUAGE
==================================================

The user's language is:

{language_name}

You MUST answer in exactly the same language.

English question:
Answer in English.

Kannada question:
Answer in Kannada.

Hindi question:
Answer in Hindi.

Tamil question:
Answer in Tamil.

Telugu question:
Answer in Telugu.

Malayalam question:
Answer in Malayalam.

Bengali question:
Answer in Bengali.

Gujarati question:
Answer in Gujarati.

Marathi question:
Answer in Marathi.

Do NOT switch languages.

==================================================
RETRIEVED KNOWLEDGE
==================================================

The following documents were retrieved from the
agricultural knowledge base specifically for this
question:

{context}

==================================================
VERY IMPORTANT
==================================================

The retrieved documents may use different wording
from the user's question.

You must understand semantic meaning.

For example:

User:
"What is PMFBY?"

Retrieved document:
PMFBY Operational Guidelines

This is a direct match.

You MUST answer the question.

Do NOT say that information is unavailable simply
because the exact words of the question are not
present in the document.

Likewise:

PMFBY
Pradhan Mantri Fasal Bima Yojana

refer to the same agricultural scheme.

==================================================
ANSWER RULES
==================================================

1. Answer the user's question directly.

2. Use the retrieved documents as the primary
   source of factual information.

3. Do not invent unsupported facts.

4. If the retrieved documents contain enough
   information, answer the question.

5. Do not refuse an answer merely because the
   similarity score is below 100%.

6. Do not mention similarity scores.

7. Do not mention Pinecone.

8. Do not mention embeddings.

9. Do not mention vector databases.

10. Do not mention internal AI systems.

11. Keep the answer clear and practical.

12. Preserve official names of government schemes.

13. Preserve important crop, pest, disease,
    fertilizer and pesticide names.

14. If the question is an agricultural question,
    give a useful agricultural answer when the
    retrieved context supports it.

15. If the documents genuinely do not contain
    enough information, say that clearly.

==================================================
CONVERSATION HISTORY
==================================================

{history_text}

==================================================
END KNOWLEDGE
==================================================
"""

    user_prompt = f"""
User's original question:

{original_query}

Answer this question in {language_name}.

Give a direct, clear answer based on the
retrieved agricultural knowledge.
"""

    # -----------------------------------------------------
    # OpenAI
    # -----------------------------------------------------

    try:

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0.1,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        )

        answer = (
            response
            .choices[0]
            .message
            .content
        )

        if not answer:

            raise RuntimeError(
                "OpenAI returned empty answer."
            )

        return answer.strip()

    except Exception as e:

        print(
            "\n========================================"
        )

        print(
            "ANSWER GENERATION ERROR"
        )

        print(
            str(e)
        )

        print(
            "========================================"
        )

        raise


# =========================================================
# MAIN RAG FUNCTION
# =========================================================

def get_rag_answer(
    query: str,
    history: list = None,
    language: str = "auto"
):

    if history is None:

        history = []

    query = (
        query
        or ""
    ).strip()

    # =====================================================
    # EMPTY QUESTION
    # =====================================================

    if not query:

        return {

            "answer":
                "Please enter your agricultural question.",

            "confidence":
                0,

            "sources":
                [],

            "language":
                "en"
        }

    # =====================================================
    # LANGUAGE DETECTION
    # =====================================================

    detected_language = detect_language(
        query
    )

    # If frontend explicitly sends language,
    # use it only when it is valid.

    if language in LANGUAGE_NAMES:

        # Only override auto detection when
        # explicitly supplied by frontend.
        if language != "auto":

            detected_language = language

    print("\n========================================")
    print("LANGUAGE DETECTION")
    print("Question:", query)
    print("Detected:", detected_language)
    print("========================================")

    # =====================================================
    # PREPROCESS KANNADA ACRONYMS
    # =====================================================

    query_for_search = query

    if detected_language == "kn":

        query_for_search = (
            normalize_kannada_agricultural_terms(
                query
            )
        )

        if query_for_search != query:

            print(
                "Kannada normalized query:"
            )

            print(
                query_for_search
            )

    # =====================================================
    # QUERY NORMALIZATION
    # =====================================================

    retrieval_query = (
        normalize_query_for_search(
            query_for_search,
            detected_language
        )
    )

    print("\n========================================")
    print("QUERY NORMALIZATION")
    print("========================================")

    print(
        "Original:",
        query
    )

    print(
        "Retrieval:",
        retrieval_query
    )

    print(
        "========================================"
    )

    # =====================================================
    # PINECONE RETRIEVAL
    # =====================================================

    matches = retrieve_documents(
        retrieval_query
    )

    # =====================================================
    # NO MATCH
    # =====================================================

    if not matches:

        print(
            "\nNo relevant documents found."
        )

        return {

            "answer":
                get_no_match_message(
                    detected_language
                ),

            "confidence":
                0,

            "sources":
                [],

            "language":
                detected_language
        }

    # =====================================================
    # BUILD CONTEXT
    # =====================================================

    context = build_context(
        matches
    )

    # =====================================================
    # DEBUG: PRINT CONTEXT
    # =====================================================

    print("\n========================================")
    print("RETRIEVED CONTEXT")
    print("========================================")

    if context:

        print(
            context
        )

    else:

        print(
            "WARNING: RETRIEVED DOCUMENTS "
            "CONTAIN NO TEXT CONTENT."
        )

        print(
            "Check Pinecone metadata."
        )

    print(
        "========================================"
    )

    # =====================================================
    # IF CONTEXT IS EMPTY
    # =====================================================

    if not context.strip():

        return {

            "answer":
                get_no_match_message(
                    detected_language
                ),

            "confidence":
                calculate_confidence(
                    matches
                ),

            "sources":
                [
                    format_source(
                        match,
                        i
                    )

                    for i, match in enumerate(
                        matches,
                        start=1
                    )
                ],

            "language":
                detected_language
        }

    # =====================================================
    # SOURCES
    # =====================================================

    sources = []

    for i, match in enumerate(
        matches,
        start=1
    ):

        sources.append(
            format_source(
                match,
                i
            )
        )

    # =====================================================
    # CONFIDENCE
    # =====================================================

    confidence = calculate_confidence(
        matches
    )

    # =====================================================
    # GENERATE ANSWER
    # =====================================================

    answer = generate_answer(
        original_query=query,
        context=context,
        history=history,
        detected_language=detected_language
    )

    # =====================================================
    # FINAL RESULT
    # =====================================================

    return {

        "answer":
            answer,

        "confidence":
            confidence,

        "sources":
            sources,

        "language":
            detected_language
    }
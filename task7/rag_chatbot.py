from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


# ============================================================
# API KEYS
# ============================================================

PINECONE_API_KEY = ""
OPENAI_API_KEY = ""

# ============================================================
# CONFIGURATION
# ============================================================

INDEX_NAME = "agriculture"

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

CHAT_MODEL = "gpt-3.5-turbo"

TOP_K = 5

MIN_SCORE = 0.45


# ============================================================
# FALLBACK
# ============================================================

NO_RECORD = (
    "I don't have verified information on this in my knowledge base."
)


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are an agricultural advisory assistant for Indian farmers.

STRICT RULES:

1. Answer ONLY using the CONTEXT provided.
2. Never use outside knowledge.
3. Never guess.
4. Never invent facts.
5. If the answer is not available in the CONTEXT, reply exactly:

I don't have verified information on this in my knowledge base.

6. Keep answers clear and practical.
7. If the user asks to elaborate, explain the retrieved information
in more detail using ONLY the provided CONTEXT.
"""


# ============================================================
# CONNECT TO PINECONE
# ============================================================

print()
print("=" * 60)
print("CONNECTING TO PINECONE")
print("=" * 60)

pc = Pinecone(
    api_key=PINECONE_API_KEY
)

index = pc.Index(
    INDEX_NAME
)

print("Pinecone connected successfully.")
print("Index:", INDEX_NAME)


# ============================================================
# LOAD EMBEDDING MODEL
# ============================================================

print()
print("=" * 60)
print("LOADING EMBEDDING MODEL")
print("=" * 60)

embedding_model = SentenceTransformer(
    EMBEDDING_MODEL_NAME
)

print("Embedding model loaded.")


# ============================================================
# CONNECT CHATGPT
# ============================================================

print()
print("=" * 60)
print("CONNECTING TO CHATGPT")
print("=" * 60)

llm = ChatOpenAI(
    api_key=OPENAI_API_KEY,
    model=CHAT_MODEL,
    temperature=0
)

print("ChatGPT connected.")


# ============================================================
# GET TEXT FROM PINECONE METADATA
# ============================================================

def get_text(metadata):

    possible_fields = [
        "text",
        "content",
        "page_content",
        "chunk",
        "chunk_text",
        "document"
    ]

    for field in possible_fields:

        value = metadata.get(field)

        if value:

            return str(value)

    return ""


# ============================================================
# REWRITE QUERY USING CHAT HISTORY
# ============================================================

def rewrite_query(history, question):

    # First question
    if not history:

        return question

    recent_history = history[-8:]

    transcript = "\n".join(
        f"{turn['role']}: {turn['content']}"
        for turn in recent_history
    )

    prompt = f"""
You are a query rewriting assistant for an agriculture RAG system.

The user may ask follow-up questions such as:

- elaborate above answer
- explain more
- tell me more
- explain the previous answer
- what about its benefits?
- how can I control it?
- what are the requirements?
- explain the above
- elaborate on previously asked question

Your task is to rewrite the latest question into a
COMPLETE STANDALONE SEARCH QUERY.

IMPORTANT:

1. Use conversation history to understand what words like
   "above", "previous", "it", "this", "that", "its" refer to.

2. Preserve the original agricultural topic.

3. Do not answer the question.

4. Do not invent facts.

5. Return ONLY the standalone search query.

Conversation:

{transcript}

Latest user question:

{question}

Standalone search query:
"""

    response = llm.invoke(
        [
            HumanMessage(
                content=prompt
            )
        ]
    )

    rewritten = response.content.strip()

    if rewritten:

        return rewritten

    return question


# ============================================================
# RETRIEVE FROM PINECONE
# ============================================================

def retrieve(query):

    query_vector = embedding_model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    results = index.query(
        vector=query_vector,
        top_k=TOP_K,
        include_metadata=True
    )

    matches = []

    for match in results.matches:

        if match.score >= MIN_SCORE:

            matches.append(match)

    return matches


# ============================================================
# GENERATE GROUNDED ANSWER
# ============================================================

def generate_answer(question, matches):

    if not matches:

        return NO_RECORD

    context_parts = []

    for match in matches:

        metadata = match.metadata

        text = get_text(
            metadata
        )

        if text:

            context_parts.append(
                text
            )

    # If Pinecone returned vectors but no text
    if not context_parts:

        return NO_RECORD

    context = "\n\n--------------------\n\n".join(
        context_parts
    )

    prompt = f"""
You are an agricultural advisory assistant.

Use ONLY the CONTEXT below to answer the QUESTION.

CONTEXT:

{context}

QUESTION:

{question}

RULES:

1. Answer only using the context.
2. Never use outside knowledge.
3. Never guess.
4. Never invent facts.
5. If the answer is not available in the context, reply exactly:

I don't have verified information on this in my knowledge base.

6. If the user asks to elaborate, provide a more detailed
explanation using ONLY information found in the context.
7. If the context contains steps, explain them clearly.
8. If the context contains quantities, rates, doses, timings,
or other numerical information, include them accurately.
9. Do not mention "the context" in your answer.
10. Do not repeat the question.
11. Keep the answer practical and easy to understand.

Answer:
"""

    response = llm.invoke(
        [
            SystemMessage(
                content=SYSTEM_PROMPT
            ),
            HumanMessage(
                content=prompt
            )
        ]
    )

    return response.content.strip()


# ============================================================
# COMPLETE RAG CHAIN
# ============================================================

def answer_question(history, question):

    # --------------------------------------------------------
    # STEP 1
    # Convert follow-up question into standalone query
    # --------------------------------------------------------

    standalone_query = rewrite_query(
        history,
        question
    )

    # --------------------------------------------------------
    # STEP 2
    # Search Pinecone
    # --------------------------------------------------------

    matches = retrieve(
        standalone_query
    )

    # --------------------------------------------------------
    # STEP 3
    # Generate answer
    # --------------------------------------------------------

    answer = generate_answer(
        standalone_query,
        matches
    )

    # --------------------------------------------------------
    # STEP 4
    # Confidence
    # --------------------------------------------------------

    if matches:

        confidence = max(
            match.score
            for match in matches
        )

    else:

        confidence = 0.0

    return {
        "answer": answer,
        "confidence": confidence
    }


# ============================================================
# MAIN CHATBOT
# ============================================================

def main():

    history = []

    print()
    print("=" * 60)
    print("             AGRICULTURE RAG CHATBOT")
    print("=" * 60)
    print("             ChatGPT + Pinecone")
    print("             Chat History Enabled")
    print("=" * 60)

    print()
    print(
        f"Similarity Threshold: "
        f"{MIN_SCORE * 100:.0f}%"
    )

    print(
        f"Top K: {TOP_K}"
    )

    print()
    print("Type 'exit' to stop.")

    print("=" * 60)

    while True:

        print()

        question = input(
            "Query: "
        ).strip()

        # ----------------------------------------------------
        # EXIT
        # ----------------------------------------------------

        if question.lower() == "exit":

            print()
            print("Chatbot stopped.")

            break

        # ----------------------------------------------------
        # EMPTY QUESTION
        # ----------------------------------------------------

        if not question:

            print(
                "Please enter a question."
            )

            continue

        try:

            # ------------------------------------------------
            # RUN RAG
            # ------------------------------------------------

            result = answer_question(
                history,
                question
            )

            # ------------------------------------------------
            # ANSWER
            # ------------------------------------------------

            print()
            print("Answer:")

            print(
                result["answer"]
            )

            # ------------------------------------------------
            # CONFIDENCE
            # ------------------------------------------------

            print()

            print(
                f"Confidence Level: "
                f"{result['confidence'] * 100:.2f}%"
            )

            # ------------------------------------------------
            # SAVE USER MESSAGE
            # ------------------------------------------------

            history.append(
                {
                    "role": "user",
                    "content": question
                }
            )

            # ------------------------------------------------
            # SAVE ASSISTANT MESSAGE
            # ------------------------------------------------

            history.append(
                {
                    "role": "assistant",
                    "content": result["answer"]
                }
            )

        except Exception as e:

            print()
            print(
                "Error:",
                e
            )


# ============================================================
# START PROGRAM
# ============================================================

if __name__ == "__main__":

    main()
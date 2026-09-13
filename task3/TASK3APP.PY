import os
import json
import pandas as pd
from docx import Document
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

# ===========================
# Load Hugging Face Model
# ===========================
print("Loading Hugging Face model...")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("Model loaded successfully!")

# ===========================
# Folder containing files
# ===========================
DATA_FOLDER = "document"

if not os.path.exists(DATA_FOLDER):
    print(f"Error: Folder '{DATA_FOLDER}' not found.")
    print("Current directory:", os.getcwd())
    exit()

# ===========================
# Chunking Function
# ===========================
def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])

        if end == len(text):
            break

        start = end - overlap

    return chunks

# ===========================
# Read TXT
# ===========================
def read_txt(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

# ===========================
# Read PDF
# ===========================
def read_pdf(path):
    reader = PdfReader(path)
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text

# ===========================
# Read DOCX
# ===========================
def read_docx(path):
    doc = Document(path)

    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"

    return text

# ===========================
# Read CSV
# ===========================
def read_csv(path):
    df = pd.read_csv(path)

    text = ""
    for _, row in df.iterrows():
        text += " ".join(map(str, row.values)) + "\n"

    return text

# ===========================
# Read File
# ===========================
def read_file(path):
    ext = os.path.splitext(path)[1].lower()

    if ext == ".txt":
        return read_txt(path)

    elif ext == ".pdf":
        return read_pdf(path)

    elif ext == ".docx":
        return read_docx(path)

    elif ext == ".csv":
        return read_csv(path)

    else:
        return None

# ===========================
# Get all supported files
# ===========================
files = []

for file in os.listdir(DATA_FOLDER):
    if file.lower().endswith((".txt", ".pdf", ".docx", ".csv")):
        files.append(os.path.join(DATA_FOLDER, file))

print(f"\nFound {len(files)} supported files.")

if len(files) == 0:
    print("No supported files found.")
    exit()

# ===========================
# Create Vector Store
# ===========================
vector_store = []
idx = 1

for file in files:

    print(f"\nProcessing: {file}")

    text = read_file(file)

    if not text:
        continue

    chunks = chunk_text(text, chunk_size=500, overlap=100)

    embeddings = model.encode(
        chunks,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    for chunk, embedding in zip(chunks, embeddings):

        vector_store.append(
            {
                "id": idx,
                "text": chunk,
                "embedding": embedding.tolist()
            }
        )

        idx += 1

# ===========================
# Save JSON
# ===========================
output_file = "vector_store.json"

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(vector_store, f, indent=4, ensure_ascii=False)

print("\n===================================")
print("Vector store created successfully!")
print("Output File :", output_file)
print("Total Chunks:", len(vector_store))
print("===================================")
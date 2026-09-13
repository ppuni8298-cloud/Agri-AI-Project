import os

from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredHTMLLoader,
)

# Folder paths
INPUT_FOLDER = "documents"
OUTPUT_FOLDER = "output"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)


def save_text(filename, text):
    output_file = os.path.join(
        OUTPUT_FOLDER,
        filename + ".txt"
    )

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Saved: {output_file}")


# Read every file
for file in os.listdir(INPUT_FOLDER):

    path = os.path.join(INPUT_FOLDER, file)

    if file.endswith(".pdf"):

        print("Reading PDF:", file)

        loader = PyPDFLoader(path)
        docs = loader.load()

    elif file.endswith(".docx"):

        print("Reading DOCX:", file)

        loader = UnstructuredWordDocumentLoader(path)
        docs = loader.load()

    elif file.endswith(".html"):

        print("Reading HTML:", file)

        loader = UnstructuredHTMLLoader(path)
        docs = loader.load()

    else:
        continue

    # Merge pages
    text = "\n".join(doc.page_content for doc in docs)

    # Save as txt
    save_text(os.path.splitext(file)[0], text)

print("\nFinished.")
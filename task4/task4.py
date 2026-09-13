from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

# ----------------------------
# Pinecone API Key
# ----------------------------
API_KEY = ""

# Connect to Pinecone
pc = Pinecone(api_key=API_KEY)
index = pc.Index("myproject")

# Load free embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

print("\n===== PINECONE CRUD MENU =====")
print("1. Create")
print("2. Read")
print("3. Update")
print("4. Delete")

choice = input("Enter your choice (1-4): ")

# ---------------- CREATE ----------------

if choice == "1":

    vector_id = input("Enter ID: ")
    text = input("Enter Text: ")

    embedding = model.encode(text).tolist()

    index.upsert(
        vectors=[
            {
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "text": text
                }
            }
        ]
    )

    print("\nRecord Created Successfully!")

# ---------------- READ ----------------

elif choice == "2":

    vector_id = input("Enter ID: ")

    result = index.fetch(ids=[vector_id])

    print("\nRecord Found:")
    print(result)

# ---------------- UPDATE ----------------

elif choice == "3":

    vector_id = input("Enter ID: ")
    new_text = input("Enter New Text: ")

    embedding = model.encode(new_text).tolist()

    index.upsert(
        vectors=[
            {
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "text": new_text
                }
            }
        ]
    )

    print("\nRecord Updated Successfully!")

# ---------------- DELETE ----------------

elif choice == "4":

    vector_id = input("Enter ID: ")

    index.delete(ids=[vector_id])

    print("\nRecord Deleted Successfully!")

# ---------------- INVALID ----------------

else:
    print("Invalid Choice")
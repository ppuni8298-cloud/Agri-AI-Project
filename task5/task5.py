from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# Enter your OpenAI API Key
API_KEY = ""
client = OpenAI(api_key=API_KEY)

while True:

    print("\n========== OPENAI MENU ==========")
    print("1. List Available Models")
    print("2. Chat with ChatGPT (LangChain)")
    print("3. Exit")

    choice = input("Enter your choice: ")

    if choice == "1":

        print("\nAvailable Models:\n")

        models = client.models.list()

        for model in sorted(models.data, key=lambda x: x.id):
            print(model.id)

    elif choice == "2":

        llm = ChatOpenAI(
            api_key=API_KEY,
            model="gpt-3.5-turbo",
            temperature=0.7
        )

        print("\nType 'exit' to return to menu.\n")

        while True:

            question = input("You: ")

            if question.lower() == "exit":
                break

            response = llm.invoke(
                [HumanMessage(content=question)]
            )

            print("\nChatGPT:", response.content)

    elif choice == "3":
        print("Thank You!")
        break

    else:
        print("Invalid Choice!")
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

SYSTEM_PROMPT = (
    "You are CalmAI, an anxiety support assistant for English-speaking users in India. "
    "Be calm, supportive, and structured. "
    "Do not diagnose. Offer breathing/grounding steps when helpful. "
    "If the user mentions self-harm or suicide, encourage immediate real-world help."
)

def generate_ai_response(user_message: str) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": str(user_message)},
    ]

    # ✅ hard validation before API call (prevents that exact error)
    for i, m in enumerate(messages):
        if not isinstance(m, dict) or "role" not in m or "content" not in m:
            raise ValueError(f"Bad message at index {i}: {m}")

    # Optional: print once to verify (you can remove later)
    print("SENDING TO GROQ:", messages)

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
    )
    return resp.choices[0].message.content

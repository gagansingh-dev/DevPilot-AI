import time

from google import genai
from google.genai import errors

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


PRIMARY_MODEL = "gemini-3.6-flash"
FALLBACK_MODEL = "gemini-3.5-flash"


def generate_response(prompt: str) -> str:
    models = [
        PRIMARY_MODEL,
        FALLBACK_MODEL,
    ]

    last_error = None

    for model in models:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )

                if response.text:
                    return response.text

                raise RuntimeError("Gemini returned an empty response.")

            except errors.ServerError as error:
                last_error = error

                if attempt == 0:
                    time.sleep(2)

    raise RuntimeError(
        f"Gemini AI service is temporarily unavailable: {last_error}"
    )
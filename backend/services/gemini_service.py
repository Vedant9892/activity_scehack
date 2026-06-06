import asyncio

from core.config import settings


async def summarize_notifications(notifications: list[dict]) -> str:
    if not notifications:
        return "No notifications to summarize right now."

    if not settings.gemini_api_key:
        return _fallback_summary(notifications)

    try:
        import google.generativeai as genai

        def _call_model() -> str:
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel(settings.gemini_model)
            prompt = (
                "Summarize and rank these notifications for a user in 2-4 lines. "
                "Return plain text with most important items first.\n\n"
                f"Notifications: {notifications}"
            )
            result = model.generate_content(prompt)
            return (result.text or "").strip()

        summary = await asyncio.to_thread(_call_model)
        return summary or _fallback_summary(notifications)
    except Exception:
        return _fallback_summary(notifications)


def _fallback_summary(notifications: list[dict]) -> str:
    high = [n for n in notifications if str(n.get("importance", "")).lower() == "high"]
    return (
        f"You have {len(notifications)} recent notifications. "
        f"High-priority items: {len(high)}. "
        "Prioritize delivered items first, then review delayed ones."
    )

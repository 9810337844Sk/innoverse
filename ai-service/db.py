import os
from motor.motor_asyncio import AsyncIOMotorClient

_client = None
_db = None

async def get_db():
    global _client, _db
    if _db is None:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/photofly")
        _client = AsyncIOMotorClient(mongo_uri)
        _db = _client["photofly"]
    return _db

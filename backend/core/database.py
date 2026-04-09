from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_db():
    """Dependency to get the database instance."""
    if db.client is None:
        print("✗ [CRITICAL] db.client is None in get_db! Lifespan failed?")
    return db.client[settings.database_name]

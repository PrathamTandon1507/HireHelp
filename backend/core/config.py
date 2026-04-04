from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "HireHelp Backend"
    debug: bool = True
    api_v1_str: str = "/api/v1"
    
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "hirehelp"
    
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"
    
    chroma_persist_dir: str = "./chroma_data"
    
    upload_dir: str = "./uploads"
    max_file_size: int = 5 * 1024 * 1024  # 5MB
    
    blockchain_network: str = "local"  # local, sepolia, mainnet
    smart_contract_address: str = ""
    
    enable_z3_validation: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
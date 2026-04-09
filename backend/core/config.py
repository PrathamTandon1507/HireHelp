from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    app_name: str = "HireHelp Backend"
    debug: bool = True
    api_v1_str: str = "/api/v1"
    
    # Database (REQUIRED - must be in .env)
    mongodb_url: str
    database_name: str = "hirehelp"
    
    # JWT & Security (REQUIRED - must be in .env)
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Groq AI/LLM (REQUIRED - must be in .env)
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"
    
    # Vector DB
    chroma_persist_dir: str = "./chroma_data"
    
    # File Storage
    upload_dir: str = "./uploads"
    max_file_size: int = 5 * 1024 * 1024
    
    # Blockchain
    blockchain_network: str = "local"
    smart_contract_address: str = "0x0000000000000000000000000000000000000000"
    blockchain_rpc_url: str = ""
    blockchain_wallet_address: str = ""
    blockchain_private_key: str = ""
    
    # Z3 Verification
    enable_z3_validation: bool = True
    
    class Config:
        import os
        # Search for .env in current dir, then parent, then project root
        env_file = ".env" if os.path.exists(".env") else "../.env"
        case_sensitive = False

settings = Settings()
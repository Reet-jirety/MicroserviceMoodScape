class Config:
    """Base configuration."""
    HOST = '0.0.0.0'
    PORT = 8000
    CORS_ORIGINS = "*"
    DEBUG = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    pass

# Set active configuration
config = DevelopmentConfig 
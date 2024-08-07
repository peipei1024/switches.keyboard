from pydantic import BaseSettings


class Config(BaseSettings):
    temp_dir: str=f"data/temp/"
    db_dir: str=f'sqlite:///data/db/switches.db'
    file_dir: str=f'data/images/'


    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


app_config = Config()

import os
os.makedirs(app_config.temp_dir, exist_ok=True)
os.makedirs(app_config.file_dir, exist_ok=True)
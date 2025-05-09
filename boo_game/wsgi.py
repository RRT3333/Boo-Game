"""
WSGI config for boo_game project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
from pathlib import Path
import dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
dotenv.load_dotenv(BASE_DIR / '.env')

from django.core.wsgi import get_wsgi_application

# 환경변수에 따라 다른 설정 모듈 사용
django_env = os.getenv('DJANGO_ENV', 'local')
if django_env == 'production':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boo_game.production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boo_game.settings')

application = get_wsgi_application()

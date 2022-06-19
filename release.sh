ls
cd backend/mysite
python manage.py migrate --no-input
python manage.py loaddata ../default-data.json

#!/bin/bash

cd mysite/AppWeb

./manage.py collectstatic --no-input
./manage.py migrate --no-input
#./manage.py loaddata ../demo/demo.json

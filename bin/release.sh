#!/bin/bash

cd backend/AppWeb
python manage.py migrate --no-input

if [[ $ENVIRONMENT == "prod" ]]
then
  aws configure set preview.cloudfront true
  aws cloudfront create-invalidation --distribution-id ${AWS_CLOUDFRONT_STATIC_DISTRIBUTION_ID} --paths "/*"
fi

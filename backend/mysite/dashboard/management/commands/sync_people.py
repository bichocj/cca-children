import requests
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from dashboard import models

class Command(BaseCommand):
    help = 'sync local person_app with person at people project'

    def add_arguments(self, parser):
        parser.add_argument('only_empty_lacomu_id', type=int, default=1, help="1 for True, 0 for False")

    def handle(self, *args, **options):
        only_empty_lacomu_id = options['only_empty_lacomu_id']
        if only_empty_lacomu_id:
            people_app = models.PersonApp.objects.filter(lacomu_id=0)
        else:
            people_app = models.PersonApp.objects.all()
        counting_update = 0
        counting_updated = 0
        counting_create = 0
        counting_created = 0
        counting = 0
        print('Total to process: ', len(people_app))
        for person_app in people_app:
            counting += 1
            print("processing " + str(counting) + " { dni: " + str(person_app.dni) + ", lacomu_id: " + str(person_app.lacomu_id) + " }")
            dni = person_app.dni
            url = 'https://lacomu-people.herokuapp.com/api/people/?dni={}'.format(dni)
            response = requests.get(url, headers={"Content-Type": "application/json", "Authorization": settings.LA_COMU_API_KEY})
            result = response.json()
            
            count = result.get('count', 0)
            date_birth = None            
            if person_app.date_of_birth:
                date_birth = person_app.date_of_birth.strftime("%Y-%m-%d")

            if count > 0:
                people_tmp = result.get('results', [])
                person_foreign = people_tmp[0]

                # update lacomu_id in PersonApp model
                person_app.lacomu_id = person_foreign.get('id')
                person_app.save()

                # update foreign person in People project
                is_different = False
                payload = {}

                if person_foreign.get('email') != person_app.email:
                    is_different = True
                    payload['email'] = person_app.email or person_foreign.get('email')

                if person_foreign.get('cellphone') != person_app.cellphone:
                    is_different = True
                    payload['cellphone'] = person_app.cellphone or person_foreign.get('cellphone')
                
                if person_foreign.get('date_of_birth') != date_birth:
                    is_different = True
                    payload['date_of_birth'] = date_birth or person_foreign.get('date_of_birth')

                if is_different:
                    counting_update += 1
                    url = 'https://lacomu-people.herokuapp.com/api/people/{}/'.format(person_foreign.get('id'))
                    requests.patch(url, data=payload, headers={"Authorization": settings.LA_COMU_API_KEY})
                    counting_updated += 1
            else:
                counting_create += 1
                url = 'https://lacomu-people.herokuapp.com/api/people/'
                payload = {
                    "dni": person_app.dni,
                    "name": person_app.name,
                    "lastname": person_app.name,
                    "date_of_birth": date_birth,
                    "cellphone": person_app.cellphone,
                    "email": person_app.email
                }
                response = requests.post(url, data=payload, headers={"Authorization": settings.LA_COMU_API_KEY})
                # update lacomu_id in PersonApp model
                result = response.json()
                person_app.lacomu_id = result.get('id')
                person_app.save()
                counting_created += 1
        self.stdout.write(self.style.SUCCESS('updates %s, updated %s' % (counting_update, counting_updated)))
        self.stdout.write(self.style.SUCCESS('creates %s, creating %s' % (counting_create, counting_created)))
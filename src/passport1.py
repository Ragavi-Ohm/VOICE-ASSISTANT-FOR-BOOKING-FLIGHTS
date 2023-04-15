import requests
import json
from datetime import datetime, date
    
url = "https://api.mindee.net/v1/products/mindee/indian_passport/v1/predict"
with open("/Users/shreyaa/Desktop/passport.png", "rb") as file_handle:
    files = {"document": file_handle}
    headers = {"Authorization": "Token 2dac8d2caff3d4e5342c29a795f84c53"}
    response = requests.post(url, files=files, headers=headers)
    passport_data = json.loads(response.text)
    values = passport_data['document']['inference']['pages'][0]['prediction']
    passenger_data = {}
    passenger_data['FirstName'] = values['given_names'][0]['value']
    passenger_data['SurName'] = values['surname']['value']
    passenger_data['Gender'] = values['gender']['value']
    passenger_data['Nationality'] = values['country']['value']
    passenger_data['DOB'] = values['birth_date']['value']
    born = datetime.strptime(passenger_data['DOB'], '%Y-%m-%d').date()
    today = date.today()
    try:
        birthday = born.replace(year = today.year)
    except ValueError:
        birthday = born.replace(year = today.year,
                  month = born.month + 1, day = 1)
    if birthday > today:   
        passenger_data['Age'] = today.year - born.year - 1
    else:
        passenger_data['Age'] = today.year - born.year
    
    print(passenger_data)
    json_string = json.dumps(passenger_data)
    with open('passenger_data.json', 'w') as outfile:
        outfile.write(json_string)


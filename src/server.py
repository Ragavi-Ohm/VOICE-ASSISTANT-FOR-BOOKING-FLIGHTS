from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
import shutil
import time
import sys
import json
import requests
from datetime import datetime, date
from PIL import Image
import base64

app = Flask(__name__)
CORS(app)


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route('/searchflight', methods=['POST', 'GET'])
def searchflight():
    headers = {
        'X-RapidAPI-Key': 'cdfb2a4a07msh1414ea084c3dc7cp10b219jsn4a6ec036b48e',
        'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
    }
    if request.method == 'POST':
        data = json.loads(request.get_data(as_text=True))
        Source = data['Source'].strip()
        Destination = data['Destination']
        StartDate = data['StartDate']
        Class = data['Class']
        AdultCount = data['AdultCount']
        ChildrenCount = data['ChildrenCount']
        url = "https://skyscanner44.p.rapidapi.com/autocomplete"
        querystring = {"query": Source}
        response = requests.request(
            "GET", url, headers=headers, params=querystring)
        sorted_response = json.loads(response.text)
        Source = sorted_response[0]['iata_code']
        querystring = {"query": Destination}
        response = requests.request(
            "GET", url, headers=headers, params=querystring)
        sorted_response = json.loads(response.text)
        Destination = sorted_response[0]['iata_code']
        str = {"adults": AdultCount, "children": ChildrenCount, "origin": Source,
               "destination": Destination, "departureDate": StartDate, "cabinClass": Class, "currency": "INR"}
        url = "https://skyscanner44.p.rapidapi.com/search"
        response = requests.request("GET", url, headers=headers, params=str)
        sorted_response = json.loads(response.text)
        new_flights_data = []
        for id in sorted_response['itineraries']['buckets']:
            for items in id:
                if isinstance(id[items], list):
                    for flight in (id[items]):
                        new_flight = {}
                        new_flight["tag"] = tag
                        new_flight["source"] = flight["legs"][0]["origin"]
                        new_flight["destination"] = flight["legs"][0]["destination"]
                        new_flight["departure_time"] = flight["legs"][0]["departure"]
                        new_flight["travel_time"] = flight["legs"][0]["durationInMinutes"]
                        new_flight["arrival_time"] = flight["legs"][0]["arrival"]
                        new_flight["num_stops"] = flight["legs"][0]["stopCount"]
                        new_flight["fare"] = flight["price"]["formatted"]
                        new_flight["carrier_name"] = flight["legs"][0]["carriers"]["marketing"][0]["name"]
                        new_flight["carrier_id"] = flight["legs"][0]["carriers"]["marketing"][0]["id"]
                        new_flight["booking_url"] = flight["deeplink"]
                        new_flights_data.append(new_flight)
                else:
                    tag = id[items]
        json_string = json.dumps(new_flights_data)
        with open('json_data.json', 'w') as outfile:
            outfile.write(json_string)
        return json_string

@app.route('/readpassport', methods=['POST', 'GET'])
def readpassportp():
    print("in")
    data = request.get_json()
    with open("imageToSave.png", "wb") as fh:
        fh.write(base64.decodebytes(data['image']))
    resp = 'image saved'
    if data:
        result = data['image']
        b = bytes(result, 'utf-8')
        image = b[b.find(b'/9'):]
        im = Image.open(io.BytesIO(base64.b64decode(image)))
        im.save('./passport.png')
        im.close()

    url = "https://api.mindee.net/v1/products/mindee/indian_passport/v1/predict"
    with open("./passport.png", "rb") as file_handle:
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
        return resp

if __name__ == "__main__":
    app.run(debug=True)

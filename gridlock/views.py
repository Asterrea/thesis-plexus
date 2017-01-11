from django.shortcuts import render
from django.http import HttpResponse
from .storage import getGeoJson

from models import Route
import json, ast
from bson.objectid import ObjectId
from bson.json_util import dumps


import plexus.settings as settings
import jsonpickle


#Return requested Json file
def getSingleJsonFile(request):
    filename = request.get_full_path()
    jsonFile = getGeoJson(request,filename)
    return HttpResponse(jsonFile, content_type="application/json")

#DisplayMap : Load all layers,
#stops, routes
def index(request):
    features = [r._data for r in Route.objects.all()]
    geojson = {'type': 'FeatureCollection', 'features': features}


    return render(request, settings.TEMPLATES[0]['DIRS'][0] + '/load-map.html',
                  {
                        #'layers' : layers,
                        #'stops'  : stops,
                        'routes' : jsonpickle.encode(geojson)
                  })

def new(request):
    line = json.loads(request.body)

    if line['geometry'].get('type') == "LineString":
        try:
            route = Route.objects.create(
                    type = line['type'],
                    route_id = line['route_id'],
                    geometry = line['geometry'],
                    properties = line['properties']
            )
            route.save()

            print("Created!")
            return HttpResponse("Success!")

        except:
            print("Create unsuccessful.")
            return HttpResponse("Error!")

def update(request):

    if request.method == "POST":
        line = json.loads(request.body)

        _id = line['_id']
        print(_id)

        route_id = line['route_id']
        geometry = line['geometry']
        properties = line['properties']

        try:
            Route.objects(id=ObjectId(_id.get('$oid'))).update(set__geometry=geometry, set__properties=properties)
            return HttpResponse("Success!")

        except:
            return HttpResponse("Error!")

    elif request.method == "GET":
        _id = request.GET.get('id','')
        print(_id)
        route = Route.objects.get(id=ObjectId(_id))
        route = route.to_json()
        return HttpResponse(dumps(route))


def delete(request):
    line = json.loads(request.body)

    _id = line['_id']

    try:
        Route.objects(id=ObjectId(_id.get('$oid'))).delete()
        return HttpResponse("Success!")

    except:
        return HttpResponse("Error!")

def export(request):
    #determine what file needs to be exported
    #if geojson
        #construct Geojson file
    #else if {...}
    #create download

    return HttpResponse("Success!")


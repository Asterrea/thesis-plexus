from django.shortcuts import render
from django.http import HttpResponse
from .storage import getGeoJson
from models import Route
from bson.objectid import ObjectId
from bson.json_util import dumps
import plexus.settings as settings
import jsonpickle
import json

#Return requested Json file
def getSingleJsonFile(request):
    filename = request.get_full_path()
    jsonFile = getGeoJson(request,filename)
    return HttpResponse(jsonFile, content_type="application/json")

#DisplayMap : stops, routes
def index(request):
    features = [r._data for r in Route.objects.all()]
    geojson = {'type': 'FeatureCollection', 'features': features}

    return render(request, settings.TEMPLATES[0]['DIRS'][0] + '/load-map.html',
                  {
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

        _id = request.POST.get('_id',ObjectId())
        print(_id)
        route_id = request.POST.get('route_id','')
        geometry = request.POST.get('geometry', '')
        properties = request.POST.get('properties','')
        print (properties)
        print (str(properties))

        #r = Route.objects.get(route_id='LTFRB_PUJ2616')
        #print (r["id"],r["properties"])

        test = Route.objects.get(id = ObjectId('587c4c3b203ada19e8e0ecf6'))
        print (test["id"], test["properties"])

        try:
            route_test = Route.objects.get(id=_id)
            print(route_test)
            Route.objects.get(id=_id).update(set__geometry=geometry, set__properties=properties)
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


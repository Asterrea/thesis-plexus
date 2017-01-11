import os, plexus.settings as settings

"""
Used for retrieving GeoJSON files upon request.
"""

def getAllGeojson():
    path_to_json = settings.MEDIA_ROOT + "geojson/"


    json_files = [pos_json for pos_json in os.listdir(path_to_json)
              if pos_json.endswith('.json')]

    return json_files

def getGeoJson(request, fileName):
    #Fix : Get only the name and add the media_root path
    if fileName.startswith("/plexus/data"):
        fileName = fileName[12:]

    geoJsonPath = settings.MEDIA_ROOT[:-1] + fileName
    jsonFile = open(geoJsonPath).read()
    return jsonFile
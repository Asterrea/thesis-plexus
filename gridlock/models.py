from __future__ import unicode_literals

from mongoengine import *

class Route(Document):
    type = StringField(required=True)
    route_id = StringField(required=True)
    geometry = LineStringField()
    properties = DictField()

    meta = {'collection':'routes'}


class Stop(Document):
    id = StringField(required=True)
    rPoint = PointField()
    name = StringField(required=True)
from . import views
from django.conf.urls import url

app_name = 'gridlock'
urlpatterns = [

    url(r'^load-map/$', views.index),
    url(r'^load-map/new/route/', views.new),
    url(r'^load-map/update', views.update),
    url(r'^load-map/update/', views.update),
    url(r'^load-map/delete/', views.delete),
    url(r'^data/geojson/', views.getSingleJsonFile, name='getSingleJsonFile'),
   # url(r'^upload-data/load', views.loadFileToMap, name='load-data'),

]
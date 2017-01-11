/**
 * Created by gridlockdev on 10/21/16.
 */
    function leafletInit(map, routeList) {

            //basemaps
            var grayscale = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png');
            var colored = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

            var markerCluster = L.markerClusterGroup({
                maxClusterRadius: 50,
                disableClusteringAtZoom: 18
            });

            var stops = L.layerGroup();
            var routes = L.layerGroup();

            //Initialize Feature Group of Editable Layer : Routes
            var editableRoutes = new L.FeatureGroup();
            editableRoutes.addLayer(routes);
            map.addLayer(editableRoutes);

            //stops
            /*$.getJSON("/plexus/data/geojson/stops.json",function(data){
                var stopLayer  = L.geoJson(data,{
                    style: function(feature){
                        return {color: "#0000A0"};
                    },
                    pointToLayer:function(feature,latlng){
                        return new L.CircleMarker(latlng, {radius: 2, fillOpacity: 0.85});
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(feature.properties.name);
                    }
                });

                markerCluster.addLayer(stopLayer);
                stops.addLayer(stopLayer);
            });*/

            //routes
            var selectedFeature = null;
            var highlight = {
                //randomColor = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
                'color': '#149c14',
                'weight': 4,
                'opacity': 1
            };


            console.log(routeList[0]);
            displayRoutes(routeList, routes);


            var animatedToggle = L.easyButton({
              id: 'animated-marker-toggle',
              type: 'animate',
              states: [{
                stateName: 'default-map',
                title: 'Default map',
                icon: 'fa fa-map-o',
                onClick: function(control) {
                  //remove side-by-side
                  control.state('trigger-side-by-side');
                }
              },{
                stateName: 'trigger-side-by-side',
                icon: 'fa fa-clone',
                title: 'Network map',
                onClick: function(control) {
                  //add side-by-side control
                  control.state('default-map');
                }
              }]
            });
            animatedToggle.addTo(map);

            //Create Feature
            map.on('draw:created',function(e){
                var type = e.layerType,
                    layer = e.layer,
                    feature = layer.feature = layer.feature || {},
                    props = feature.properties = feature.properties || {};

                if (type == 'polyline') {
                   openCreateModal();
                   $("#modal-create").on('click', function(){

                       feature.type = "Feature";
                       feature.route_id = document.getElementById("route_id").value;
                       props.route_name = document.getElementById("route_name").value;
                       props.route_color = document.getElementById("route_color").value;
                       var toGeojson = layer.toGeoJSON();
                       $.ajax({
                          url: "/plexus/load-map/new/route/",
                          data: JSON.stringify(toGeojson),
                          dataType: 'json',
                          type: 'POST',
                          contentType: "application/json;charset=utf-8"
                        });
                    });
                }
                editableRoutes.addLayer(layer);
            });


            //====CONTROLS=====
            var basemaps = {
                "Grayscale": grayscale,
                "Colored" : colored
            };

            var overlays = {
                //"Clustered Stops": markerCluster,
                //"Stops" : stops
                "Routes" : editableRoutes
            };

            //Filter controls
            L.control.layers(basemaps,overlays).addTo(map);

            //Draw controls
            var drawControl = new L.Control.Draw({
                draw:{
                  polygon:false,
                  rectangle:false,
                  circle:false
                },
                edit:{
                    edit:false,
                    remove:false,
                    featureGroup : editableRoutes
                }
            });

            $("#plexus-mode").on("click", function(){
                //add Draw Control
                map.addControl(drawControl);
            });

            //Search Controls
            var searchControl = new L.Control.Search({
                layer: routes,
                position : 'topleft',
                propertyName: 'route_name',
                marker:false,
                moveToLocation: function(latlng, title, map) {
                var zoom = map.getBoundsZoom(latlng.layer.getBounds());
                map.setView(latlng, zoom);
                }
            });

            searchControl.on('search:locationfound', function(e) {

            e.layer.setStyle({color: 'red'});
                if(e.layer._popup)
                    e.layer.openPopup();
            }).on('search:collapsed', function(e) {
                featuresLayer.eachLayer(function(layer) {
                    featuresLayer.resetStyle(layer);
                });
            });

            map.addControl(searchControl);
}

    function displayRoutes(data, routes){
                var btnCount= 0;
                var routeLayer = L.geoJson(data,{
                    onEachFeature: function(feature,layer){
                        if(feature.properties.route_color)
                            layer.setStyle({color: feature.properties.route_color });
                        else
                            layer.setStyle({color:'#0000FF'});

                        layer.on('click',function(e){
                            if(selectedFeature){
                                selectedFeature.editing.disable();
                                //alert("SELECTED");
                            }
                            if(document.getElementById('plexus-mode').checked){
                                selectedFeature = e.target;
                                selectedFeature.editing.enable();
                                var default_color = layer.options.color;
                                layer.setStyle(highlight);

                                if(btnCount == 0){
                                    btnCount+= 1;

                                    var editBtn = L.easyButton({
                                        id:'edit',
                                        states:[{
                                            icon: "fa fa-pencil-square-o",
                                            onClick: function(btn){
                                                var editedFeature = selectedFeature.toGeoJSON();
                                                var id = editedFeature._id['$oid'];

                                                $.ajax({
                                                    url: "/plexus/load-map/update/",
                                                    type: 'GET',
                                                    data:{
                                                        id:id
                                                    },
                                                    success: function(data){
                                                        openCreateModal();
                                                        props = feature.properties = feature.properties || {};

                                                        var jsonobj = jQuery.parseJSON(data);
                                                        obj = jQuery.parseJSON(jsonobj);

                                                        document.getElementById("route_id").value = obj.route_id;
                                                        document.getElementById("route_name").value = obj.properties.route_name;
                                                        if(typeof obj.properties.route_color !== "undefined")
                                                            document.getElementById("route_color").value = obj.properties.route_color;
                                                        else{
                                                            document.getElementById("route_color").value = default_color;
                                                        }
                                                        $("#modal-create").on('click', function(){
                                                            feature.type = "Feature";
                                                            feature.route_id = document.getElementById("route_id").value;
                                                            props.route_name = document.getElementById("route_name").value;
                                                            props.route_color = document.getElementById("route_color").value;
                                                            var toGeojson = layer.toGeoJSON();
                                                           $.ajax({
                                                              url: "/plexus/load-map/update",
                                                              data: JSON.stringify(toGeojson),
                                                              dataType: 'json',
                                                              type: 'POST',
                                                              contentType: "application/json;charset=utf-8"
                                                            });
                                                        });
                                                    }
                                                });
                                            }
                                        }]
                                    });
                                    editBtn.addTo(map);

                                    var finishBtn = L.easyButton({
                                        id:'finish',
                                        states: [{
                                            icon:"fa fa-check",
                                            onClick: function(btn){
                                                selectedFeature.editing.disable();
                                                layer.closePopup();
                                                var editedFeature = selectedFeature.toGeoJSON();
                                                alert("Updating:" + editedFeature.route_id);
                                                $.ajax({
                                                    url: "/plexus/load-map/update/",
                                                    data: JSON.stringify(editedFeature),
                                                    dataType: 'json',
                                                    type: 'POST',
                                                    contentType: "application/json;charset=utf-8"
                                                });
                                                btnCount-=1;
                                                this.removeFrom(map);
                                                removeBtn.removeFrom(map);
                                                editBtn.removeFrom(map);
                                            }
                                        }]
                                    });
                                    finishBtn.addTo(map);

                                    var removeBtn = L.easyButton({
                                        id:'remove',
                                        states:[{
                                            icon: "fa fa-trash-o",
                                            onClick: function(btn){
                                                selectedFeature.editing.disable();
                                                layer.closePopup();
                                                var editedFeature = selectedFeature.toGeoJSON();
                                                alert("Deleting...");

                                                $.ajax({
                                                    url: "/plexus/load-map/delete/",
                                                    data: JSON.stringify(editedFeature),
                                                    dataType: 'json',
                                                    type: 'POST',
                                                    contentType: "application/json;charset=utf-8"
                                                });

                                                btnCount-=1;
                                                this.removeFrom(map);
                                                finishBtn.removeFrom(map);
                                                editBtn.removeFrom(map);

                                                routeLayer.removeLayer(selectedFeature);
                                            }
                                        }]
                                    });
                                    removeBtn.addTo(map);

                                }else{
                                    selectedFeature.editing.disable();
                                    alert("Select action edit save / delete from the left.")
                                }
                            }
                        });
                        layer.bindPopup(feature.properties.route_name);
                    }
                });
                routes.addLayer(routeLayer);
            }
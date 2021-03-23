//query URL for past 7 days of earthquakes
var queryURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

function createMap(earthquakes, magnitude) {
    //create tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    //create a basemaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap,
        "Street Map": streetmap
    };

    //create an overlaymaps object to hold the earthquake layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Magnitude": magnitude
    };

    //create the map object with options
    var map = L.map("map-id", {
        center: [36.85, -75.9779],
        zoom: 3,
        layers: [lightmap, magnitude]
    });

    //create a layer control, pass in basemaps and overlaymaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}

d3.json(queryURL, function(data) {
    function mapStyle(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: mapColor(feature.properties.mag),
          color: "#000000",
          radius: mapRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    function mapColor(mag) {
        switch (true) {
            case mag > 5:
                return "#ea2c2c";
            case mag > 4:
                return "#eaa92c";
            case mag > 3:
                return "#d5ea2c";
            case mag > 2:
                return "#92ea2c";
            case mag > 1:
                return "#2ceabf";
            default:
                return "#2c99ea";
        }
    }
    
    function mapRadius(mag) {
        if (mag === 0) {
            return 1;
        }

        return mag * 4;
    }

    L.geoJson(data, {

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: mapStyle,

        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(map);

    //Create legend variable
    var legend = L.control({
            position: "bottomright"
        });

    // //details for the legend
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "legend");
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c","#eaa92c", "#ea2c2c"];

        div.innerHTML = '<div><b>Earthquake Depth</b></div';

        //Loop
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +='<i style="background:'+chooseColor(grades[i])+ '">&nbsp;</i>&nbsp;&nbsp;'+labels[i]+'<br/>';
            }
        return div;
    }; legend.addTo(map);

    //Create a layer group made from the array, pass it into the createmap function
    createMap(L.layerGroup(earthquakeMarkers), L.layerGroup(magnitude));
});
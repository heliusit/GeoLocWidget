/*
 * Geolocation Widget (GeoLocWidget) - jQuery plugin
 * Geolocation Widget uses autocomplete, reverse geocoding, and Google Maps.
 * GeoLocWidget was developed to resolve licensing issues with Google Maps 
 * (like show map when use it), and it helps to resolve request limit issues 
 * through the use of several geo providers like MapQuest, OpenStreetMap, and
 * Google Maps.
 * It was written by Mauro Stepanoski with help from Helius IT Team.
 *
 * Copyright (c) 2011 Mauro Stepanoski, Mariano Pino, Sebastian Sanchez, German Unzue.
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Built for jQuery library
 * http://jquery.com
 *
 */
(function($) {
      	$.fn.uneedGeoLocalize = function(options) {
                var self;
                /**
                 * Stores current geoposition.
                 */
                var currentCoords = {lat:0, lon:0};
                /**
                 * This flag registers if widget was or not loaded.
                 */
                var altWidgetNotLoad = true;


                /**
                 * default settings.
                 */ 
		        var defaults = {
                              geoaddressinput: '.geo-address',
                              geolatinput: '.geo-latitude',
                              geolonginput: '.geo-longitude',
                              geoaltselection: '.select-in-map-widget',
                              geoaltpage: '.selection-map-page'
		        };

		        var options = $.extend(defaults, options);

                /**
                 * registerGeoLocation function
                 *
                 * It completes widget's inputs with geolocation info.
                 *
                 * @param place
                 */
                var registerGeoLocation = function(place) {
                      currentCoords.lat = place.point.lat;
                      currentCoords.lon = place.point.lon;
                      $('input' + defaults.geolatinput, self).each(function() {
                            $(this).val(place.point.lat);
                      });
                      $('input' + defaults.geolonginput, self).each(function() {
                            $(this).val(place.point.lon);
                      });
                      $('input' + defaults.geoaddressinput, self).each(function() {
                            $(this).val(place.address);
                      });
                      $(defaults.geoaltselection+' input.address-selected').each(function() {
                            $(this).val(place.address);
                      });
                }

                /**
                 * obtainAddress function
                 *
                 * This function reverses geoposition. It takes coordinates and returns
                 * the address asociated to it. This function uses MapQuest API.
                 * 
                 * @param position
                 */
                var obtainAddress = function(position) {
                    $.getJSON('http://open.mapquestapi.com/nominatim/v1/reverse?format=json&lat=' +
                              position.coords.latitude + '&lon=' + position.coords.longitude +
                              '&json_callback=?',
                          function(response) {
                                var place = null;
                                try{
                                    place = {
                                      address: response.display_name,
                                      point: {
                                        lat:  response.lat,
                                        lon: response.lon
                                      }
                                    };
                                    registerGeoLocation(place);
                                    if (altWidgetNotLoad) {
                                        loadAltWidget();
                                        altWidgetNotLoad = false;
                                    }
                                } catch(error) {
                                    handleError(error);
                                }
                          }
                    );
                }

                /**
                 * handleError function
                 *
                 * It shows error message on console, and it executes ipdetection.
                 * 
                 * @param error message
                 */
                var handleError = function(error) {
                      if (console) {
                          console.log('Error detecting geoposition. Trying IP detection '+error);
                      }
                      ipDetection();
                }


                /**
                 * ipDetection function
                 *
                 * It detects geoposition through MaxMind services.
                 */
                var ipDetection = function() {
                      $.getScript('http://j.maxmind.com/app/geoip.js', function() {
                          var place = {
                                point: {
                                  lat:  geoip_latitude(),
                                  lon: geoip_longitude()
                                },
                                address: geoip_city()+', '+geoip_region_name()+', '+geoip_country_name()
                          };
                          registerGeoLocation(place);
                          if (altWidgetNotLoad) {
                                loadAltWidget();
                                altWidgetNotLoad = false;
                          }
                      });
                }

                /**
                 * detection function
                 *
                 * It detects geoposition through browser geolocation functions, if
                 * it fails then it will use ipDetection.
                 */
                var detection = function() {
                      if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(obtainAddress, handleError);
                      } else {
                          ipDetection();
                      }
                }

                /**
                 * makeSuggests functions
                 *
                 * It suggests an address throught autocomplete.
                 * It uses Nominatim API.
                 */
                var makeSuggests = function(elem) {
                      $(elem).autocomplete({
                          source: function(request, response) {
                                var url = 'http://nominatim.openstreetmap.org/search/';
                                url += request.term;
                                url += '?format=json&limit=5&addressdetails=1&json_callback=?';
                                $.ajax({
                                  url: url,
                                  dataType: "json",
                                  success: function(data) {
                                                response($.map(data, function(loc) {
                                                    return {
                                                        value: {
                                                          address: loc.display_name,
                                                          point: {
                                                              lat: loc.lat,
                                                              lon: loc.lon,
                                                          }
                                                        },
                                                        label: loc.display_name
                                                    }
                                                })
                                        );
                                  }
                                });
                           },
                           select:function(event, ui) {
                                event.preventDefault();
                                registerGeoLocation(ui.item.value);
                           }
                      });
                }

                /**
                 * loadAltWidget function
                 *
                 * It redirects to alternate view for selecting you
                 * geoposition in Google Maps.
                 */
                var loadAltWidget = function() {
                      $(defaults.geoaltselection).each(function() {
                              var myLatlng = new google.maps.LatLng(
                                                    currentCoords.lat,
                                                    currentCoords.lon
                              );

                              var options = {
                                      zoom: 16,
                                      center: myLatlng,
                                      mapTypeId: google.maps.MapTypeId.ROADMAP
                              };

                              var map = new google.maps.Map($('.map_canvas', this).get(0), options);

                              var marker = new google.maps.Marker({
                                      position: myLatlng,
                                      map: map,
                                      draggable:false
                              });

                              google.maps.event.addListener(map, 'click', function(event) {
                                      var position = {
                                              coords: {
                                                  latitude: event.latLng.lat(),
                                                  longitude: event.latLng.lng()
                                              }
                                      };
                                      obtainAddress(position);
                                      marker.setMap(null);
                                      marker = new google.maps.Marker({
                                            position: event.latLng,
                                            map: map,
                                            draggable:false
                                      });
                                      map.setCenter(event.latLng);
                                      // Use it for jquery.mobile.
                                      google.maps.event.trigger(map,'resize');
                              });
                              $(defaults.geoaltpage).bind('pageshow', function() {
                                    google.maps.event.trigger(map,'resize');
                              });
                      });
                }

                /**
                 * Initialization.
                 */
                this.each(function() {
                      self = this;
                      detection();
                      $('input' + defaults.geoaddressinput, self).each(function() {
                            makeSuggests(this);
                      });
                });
        }
})(jQuery);

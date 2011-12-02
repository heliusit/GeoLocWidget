/*
 * Geolocation Widget (GeoLocWidget) - Script Loader
 * It was written by Mauro Stepanoski with help from Helius IT Team.
 *
 * Copyright (c) 2011 Mauro Stepanoski, Mariano Pino, Sebastian Sanchez, German Unzue.
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 */
GeoLocWidget = function() {
    this.startup = function() {
        jQuery.noConflict();
        jQuery.getScript('js/widget.js', function() {
             jQuery(document).ready(function() {
                 jQuery('#in-map-selector').click(function(evt) {
                          evt.preventDefault();
                          evt.stopPropagation();

                          jQuery('#content').hide();
                          jQuery('#select-in-map').show();
                          jQuery('.selection-map-page').trigger('pageshow');

                          return false;
                 });
                 jQuery('#back-act').click(function(evt) {
                          evt.preventDefault();
                          evt.stopPropagation();

                          jQuery('#select-in-map').hide();
                          jQuery('#content').show();

                          return false;
                 });
                 jQuery('#main-container').uneedGeoLocalize();
            });
        });
    }

    return this;
}();

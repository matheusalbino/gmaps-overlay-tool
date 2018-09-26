"use strict";

/**
 * Element - Attributes
 */
let elements = [];

let selectedElement = {};

let highlightedElement = {};

let elemProperties = [
    'maptype',
    'floor',
    'zoomMin',
    'zoomMax',
    'title',
    'image',
    'content',
];

let elmStyles = [
    'textWidth',
    'textSize',
    'textColor',
    'textOffsetX',
    'textOffsetY',
    'strokeColor',
    'strokeWeight',
    'strokeOpacity',
    'fillColor',
    'fillOpacity'
];

let googleElmStyles = [
    'icon',
    'strokeColor',
    'strokeWeight',
    'strokeOpacity',
    'fillColor',
    'fillOpacity'
];

const featureTemplate = {
    type: 'Feature',
    properties: {},
    styles: {},
    geometry: {
        type: '',
        coordinates: []
    }
};

/**
 * Overlay - Image
 */
let overlayImage = '';
let overlayOpacity = 0.5; // 0 to 1 opacity

/**
 * Overlay - Bounding Box
 */
let overlayBounds = new google.maps.LatLngBounds({ "lat": 0, "lng": 0 }, { "lat": 0, "lng": 0 });

/**
 * Overlay - Rotation
 */
let overlayRotation = 0.0;

/**
 * Exports
 */
const saveJSON = json => {
    saveAs(new Blob([JSON.stringify(json, false, 4)], { type: "application/json" }), 'gmaps-overlay-tool.json');
};

const getProperties = elm => {
    return elm.get('properties');
};

const getStyles = elm => {
    return elm.get('styles');
};

const ExportGeoJSON = () => {
    let features = _.map(elements, elm => {
        let type;
        let coordinates;

        if (elm.type == 'marker') {
            type = 'Point';
            const { lat, lng } = elm.overlay.getPosition().toJSON();
            coordinates = [lng, lat];
        } else if (elm.type == 'polygon') {
            type = 'Polygon';
            let path = elm.overlay.getPath().getArray();
            coordinates = _.map(path, pos => {
                const { lat, lng } = pos.toJSON();
                return [lng, lat];
            });
            coordinates.push(coordinates[0]);
            coordinates = [coordinates];
        } else if (elm.type == 'polyline') {
            type = 'LineString';
            let path = elm.overlay.getPath().getArray();
            coordinates = _.map(path, pos => {
                const { lat, lng } = pos.toJSON();
                return [lng, lat];
            });
        }

        if (type)
            return {
                ...featureTemplate,
                properties: getProperties(elm.overlay),
                geometry: {
                    ...featureTemplate.geometry,
                    type,
                    coordinates
                }
            };
    });

    let data = { type: 'FeatureCollection', features };
    saveJSON(data);
};

const ExportCustom = () => {
    let features = _.map(elements, elm => {
        let type;
        let coordinates;

        if (elm.type == 'marker') {
            type = 'Point';
            coordinates = elm.overlay.getPosition().toJSON();
        } else if (elm.type == 'polygon') {
            type = 'Polygon';
            let path = elm.overlay.getPath().getArray();
            coordinates = _.map(path, pos => pos.toJSON());
            coordinates.push(coordinates[0]);
        } else if (elm.type == 'polyline') {
            type = 'LineString';
            let path = elm.overlay.getPath().getArray();
            coordinates = _.map(path, pos => pos.toJSON());
        }

        if (type)
            return {
                ...featureTemplate,
                properties: getProperties(elm.overlay),
                styles: getStyles(elm.overlay),
                geometry: {
                    ...featureTemplate.geometry,
                    type,
                    coordinates
                }
            };
    });

    features.push({
        ...featureTemplate,
        properties: {
            image: overlayImage,
            angle: overlayRotation
        },
        styles: {},
        geometry: {
            ...featureTemplate.geometry,
            type: 'Overlay',
            coordinates: JSON.parse(document.getElementById('bbox').value)
        }
    });


    let data = { type: 'FeatureCollection', features };
    saveJSON(data);
};

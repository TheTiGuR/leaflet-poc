import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import {
  Map,
  icon,
  Marker,
  FeatureGroup,
  map,
  tileLayer,
  control,
} from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

import { MarkerService } from '../marker.service';
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
Marker.prototype.options.icon = iconDefault;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  map!: Map;
  rangeValues: number[] = [];
  min: number = 0;
  max: number = 0;
  featureGroup: FeatureGroup = new FeatureGroup();
  rangesStream$ = this.markerService.rangesStream$;

  private initMap(): void {
    this.map = map('map', {
      center: [39.8282, -98.5795],
      zoom: 3,
    });

    const tiles = tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
    control.scale().addTo(this.map);
    this.featureGroup.addTo(this.map);
    function logEvent(e: any) {
      console.log(e);
    }
    this.map.pm.addControls({
      position: 'topright',
      drawPolyline: false,
      drawCircleMarker: false,
      drawText: false,
      rotateMode: false,
      removalMode: false,
      cutPolygon: false,
      dragMode: false,
      oneBlock: true,
    });
    this.map.on('pm:drawstart', function (e) {
      logEvent(e);
      var layer = e.workingLayer;

      layer.on('pm:vertexadded', logEvent);
      layer.on('pm:snapdrag', logEvent);
      layer.on('pm:snap', logEvent);
      layer.on('pm:unsnap', logEvent);
      layer.on('pm:centerplaced', logEvent);
    });
    this.map.on('pm:drawend', logEvent);
    this.map.on('pm:create', (e) => {
      logEvent(e);
      var layer = e.layer;

      this.map.pm.disableDraw();

      // layer.pm.enable({
      //   allowSelfIntersection: false,
      // });

      //Edit Event
      layer.on('pm:edit', logEvent);
      layer.on('pm:update', logEvent);
      layer.on('pm:enable', logEvent);
      layer.on('pm:disable', logEvent);
      layer.on('pm:vertexadded', logEvent);
      layer.on('pm:vertexremoved', logEvent);
      layer.on('pm:markerdragstart', logEvent);
      layer.on('pm:markerdrag', logEvent);
      layer.on('pm:markerdragend', logEvent);
      layer.on('pm:snap', logEvent);
      layer.on('pm:snapdrag', logEvent);
      layer.on('pm:unsnap', logEvent);
      layer.on('pm:intersect', logEvent);
      layer.on('pm:centerplaced', logEvent);

      //Drag event
      layer.on('pm:dragstart', logEvent);
      layer.on('pm:drag', logEvent);
      layer.on('pm:dragend', logEvent);

      //Cut event
      layer.on('pm:cut', logEvent);

      //Remove event
      layer.on('pm:remove', logEvent);
    });

    //Toggle mode events
    this.map.on('pm:globaleditmodetoggled', logEvent);
    this.map.on('pm:globaldragmodetoggled', logEvent);
    this.map.on('pm:globalremovalmodetoggled', logEvent);
    this.map.on('pm:globaldrawmodetoggled', logEvent);
    this.map.on('pm:globalcutmodetoggled', logEvent);

    //Remove event
    this.map.on('pm:remove', logEvent);
    this.map.on('layerremove', logEvent);

    //Cut event
    this.map.on('pm:cut', logEvent);

    //Language changed
    this.map.on('pm:langchange', logEvent);

    //this.map.pm.setLang('en');
  }

  constructor(private markerService: MarkerService) {}

  ngAfterViewInit(): void {
    this.initMap();
    // this.markerService.makeCapitalCircleMarkers(this.map);
    // this.markerService.makeCapitalMarkers(this.map);
    // this.markerService.makeCapitalClusterMarkers(this.map);
    // this.markerService.mapPolygons(this.map);
  }

  ngOnDestroy(): void {}

  setRangeValues(ranges: any): void {
    this.max = ranges.length - 1;
    if (this.rangeValues.length < 1) {
      this.rangeValues = [0];
      this.rangeValues.push(ranges.length - 1);
      // ranges.forEach((val: any) => {
      //   this.rangeValues.push(val.order);
      // });
      // this.max = ranges.length - 1;
    }
  }

  sliderChange(event: any): void {
    // this.map.off();
    // this.map.remove();
    // this.initMap();
    this.map.removeLayer(this.featureGroup);
    this.featureGroup = this.markerService
      .mapPolygons(this.rangeValues[0], this.rangeValues[1])
      .addTo(this.map);
    this.map.fitBounds(this.featureGroup.getBounds());
  }
}

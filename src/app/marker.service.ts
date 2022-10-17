import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

import { Feature } from '@turf/helpers';
import { BehaviorSubject, map, Observable, of, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  capitals: string = '/assets/data/usa-capitals.geojson';
  countries: string = '/assets/data/worldCountries-hires-10m.geojson';
  products: string = '/assets/data/search-results.json';
  // featureGroup: L.FeatureGroup = new L.FeatureGroup();

  private rangesBS = new BehaviorSubject<any>(null);
  ranges$: Observable<any> = this.rangesBS.asObservable();
  orderedIds: { order: number; id: string; collectionTime: Date }[] = [];
  rangesStream$ = this.ranges$.pipe(
    switchMap((ranges) => {
      if (ranges) {
        this.orderedIds = [];
        let prodArray: { id: string; collectionTime: Date }[] = [];
        ranges.products.forEach((p: any) => {
          prodArray.push({ id: p.id, collectionTime: p.collectionTime });
        });
        let sorted: { id: string; collectionTime: Date }[] = prodArray.sort(
          (a, b) => 0 - (a.collectionTime < b.collectionTime ? 1 : -1)
        );
        for (let i = 0; i < sorted.length; i++) {
          const element = sorted[i];
          this.orderedIds.push({
            order: i,
            id: element.id,
            collectionTime: element.collectionTime,
          });
        }
        return of(this.orderedIds);
      } else {
        return of(null);
      }
    })
  );

  constructor(private http: HttpClient) {
    this.http.get(this.products).subscribe((res: any) => {
      this.rangesBS.next(res);
    });
  }

  mapPolygons(min: number = -1, max: number = -1): L.FeatureGroup {
    let products = this.rangesBS.getValue()?.products;
    if (min !== -1 && max !== -1) {
      let filtered = this.orderedIds.filter(({ order }) => {
        return order >= min && order <= max;
      });
      let ids = filtered.map((f) => f.id);
      // console.log(ids);
      products = products.filter((p: any) => ids.includes(p.id));
      // console.log(products.length);
    }
    let featureGroup: L.FeatureGroup = new L.FeatureGroup();
    if (products) {
      // Create a group of features to add to the map
      // this.featureGroup.addTo(map);
      // let featureGroup: L.FeatureGroup = new L.FeatureGroup().addTo(map);
      console.log(products.length);
      products.forEach((p: any) => {
        // Create a new feature as geoJson (This will read in geojson correctly (long/lat))
        const layer = L.geoJSON();
        const feature: Feature = p.location;
        if (feature !== undefined) {
          // Sets option as appropriate
          const options: L.GeoJSONOptions = {
            style: { color: '#ff0000' },
          };
          // Add options to the layer
          layer.options = options;
          // Adds the new feature to the layer
          layer.addData(feature);
        }
        // Adds the completed layer to the group
        featureGroup.addLayer(layer);
      });
      // Uses built in tooling to get the max bounds for the feature group
      // map.fitBounds(this.featureGroup.getBounds());
    }
    return featureGroup;
  }

  makeCapitalMarkers(map: L.Map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      for (const c of res.features) {
        const lon = c.geometry.coordinates[0];
        const lat = c.geometry.coordinates[1];
        const marker = L.marker([lat, lon]);

        marker.addTo(map);
      }
    });
  }

  // makeCapitalClusterMarkers(map: L.Map): void {
  //   this.http.get(this.countries).subscribe((res: any) => {
  //     var markers = L.markerClusterGroup({});
  //     markers.on('click', function (a) {
  //       console.log('marker ', a);
  //     });
  //     for (const c of res.features) {
  //       const center = polylabel(c.geometry.coordinates, 1.0);
  //       // console.log(center);
  //       if (center[0]) {
  //         //const marker = L.marker([center[0], center[1]], {});
  //         let marker: L.Marker = new L.Marker([center[0], center[1]]);
  //         marker.feature = c;
  //         markers.addLayer(marker);
  //       }
  //     }
  //     console.log(markers);
  //     map.addLayer(markers);
  //   });
  // }

  makeCapitalCircleMarkers(map: L.Map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      const maxPop = Math.max(
        ...res.features.map(
          (x: { properties: { population: any } }) => x.properties.population
        ),
        0
      );
      for (const c of res.features) {
        const lon = c.geometry.coordinates[0];
        const lat = c.geometry.coordinates[1];
        const circle = L.circleMarker([lat, lon], {
          radius: MarkerService.scaledRadius(c.properties.population, maxPop),
        });

        circle.addTo(map);
      }
    });
  }

  getProductCollectionTimes(): Observable<
    {
      order: number;
      id: string;
      collectionTime: Date;
    }[]
  > {
    return this.http.get(this.products).pipe(
      map((res: any) => {
        let prodArray: { id: string; collectionTime: Date }[] = [];
        res.products.forEach((p: any) => {
          prodArray.push({ id: p.id, collectionTime: p.collectionTime });
        });
        let sorted: { id: string; collectionTime: Date }[] = prodArray.sort(
          (a, b) => 0 - (a.collectionTime < b.collectionTime ? 1 : -1)
        );
        let sortedId: { order: number; id: string; collectionTime: Date }[] =
          [];
        for (let i = 0; i < sorted.length; i++) {
          const element = sorted[i];
          sortedId.push({
            order: i,
            id: element.id,
            collectionTime: element.collectionTime,
          });
        }
        return sortedId;
      })
    );
  }

  static scaledRadius(val: number, maxVal: number): number {
    return 20 * (val / maxVal);
  }
}

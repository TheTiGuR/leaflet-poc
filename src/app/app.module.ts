import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { SliderModule } from 'primeng/slider';

import { MarkerService } from './marker.service';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [AppComponent, MapComponent],
  imports: [BrowserModule, HttpClientModule, SliderModule, FormsModule],
  providers: [MarkerService],
  bootstrap: [AppComponent],
})
export class AppModule {}

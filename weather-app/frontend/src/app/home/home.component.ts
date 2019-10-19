import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';
import {switchMap, debounceTime, tap, finalize} from 'rxjs/operators';
import {Observable} from 'rxjs'
import { MapsAPILoader } from '@agm/core';

import { User, ForecaseWeather, Country, City, Coordinate, CurrentWeather } from '../_models';
import { WeatherService, LocationService } from '../_services';
import { environment } from '../../environments/environment'

@Component({ 
    templateUrl: 'home.component.html'    
})
export class HomeComponent implements OnInit {
    currentUser: User;    
    currentWeather: CurrentWeather;
    forecastWeathers: ForecaseWeather[]; 
    lastSeenTime: string;

    filteredCountries: Country[] = [];
    filteredCities: City[] = [];
    locationForm: FormGroup;
    isLoading = false;   
    selectedCountry: string = ''; 
    selectedCity: string = ''; 
    selectedOption: string;

    lat: number;
    lng: number;
    zoom: number;    

    constructor(
        private weatherService: WeatherService, 
        private locationService: LocationService,
        private mapLoader: MapsAPILoader, 
        private fb: FormBuilder) {
    }

    ngOnInit() {
        this.locationForm = this.fb.group({
            countryInput: null,
            cityInput: null
        })
        this.setCurrentLocation();

        this.locationForm
            .get('countryInput')
            .valueChanges
            .pipe(
                debounceTime(300), 
                tap(() => {
                    this.isLoading = true;
                    this.filteredCountries = [];
                }),
                switchMap(value => this.locationService.searchCountries(value)
                    .pipe(
                        finalize(() => this.isLoading = false),
                    )
                )
            )
            .subscribe(countries => this.filteredCountries = countries);
        
        this.locationForm
            .get('cityInput')
            .valueChanges
            .pipe(
                debounceTime(300), 
                tap(() => {
                    this.isLoading = true;
                    this.filteredCities = [];
                }),
                switchMap(value => this.locationService.searchCities(this.selectedCountry, value)
                    .pipe(
                        finalize(() => this.isLoading = false),
                    )
                )
            )
            .subscribe(cities => this.filteredCities = cities);
    }

    displayFnCountry(country: Country) {
        if (country) { return country.name; }
    }

    displayFnCity(city: City) {
        if (city) { return city.name; }
    }

    private loadCurrentWeather(city: string) {
        this.weatherService.getCurrent(this.selectedCountry, city)
            .pipe(first())
            .subscribe(currentWeather => {
                this.currentWeather = new CurrentWeather();
                this.currentWeather.description = currentWeather.weather[0].description;
                this.currentWeather.currentTemprature = currentWeather.main.temp;
                this.currentWeather.windSpeed = currentWeather.wind.speed;
                this.currentWeather.imageUrl = `${environment.imageUrl + currentWeather.weather[0].icon}.png`;
            });
    }  
    
    private loadForecaseWeather(city: string) {
        this.forecastWeathers = new Array<ForecaseWeather>();
        this.weatherService.getForecast(this.selectedCountry, city)
        .pipe(first())
        .subscribe(results => {
            for (var i = 0; i < results.list.length; i++) {
                var remainder = i % 8;
                if (remainder > 0) continue;
                var forecastWeather = new ForecaseWeather();
                forecastWeather.dateMonth = results.list[i].dt_txt.substring(5,11);
                forecastWeather.imageUrl = `${environment.imageUrl + results.list[i].weather[0].icon}.png`;
                forecastWeather.minTemprature = results.list[i].main.temp_min;
                forecastWeather.maxTemprature = results.list[i].main.temp_max;
                this.forecastWeathers.push(forecastWeather);
            }
        });
    }  

    getCurrentTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();        
        this.lastSeenTime = h + ":" + m + ":" + s;
    }

    getCities(country){
        this.selectedCountry = country.code;
        this.filteredCountries = [];
        this.selectedOption = '';
    }

    populate(city){     
        this.selectedCity = city.name;
        this.lat = Number(city.coord.lat);
        this.lng = Number(city.coord.lon);
        this.zoom = 15;
        this.mapLoader.load();
        this.loadCurrentWeather(city.name);
        this.loadForecaseWeather(city.name);
        this.getCurrentTime();
    }

    private setCurrentLocation() {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            this.lat = Number(position.coords.latitude);
            this.lng = Number(position.coords.longitude);
            this.zoom = 15;
          });
        }
    }    
}
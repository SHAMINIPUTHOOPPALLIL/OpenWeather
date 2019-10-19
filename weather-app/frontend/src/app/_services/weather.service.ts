import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpParams   } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })
export class WeatherService {
    private http: HttpClient;

    constructor(private handler: HttpBackend) { 
        this.http = new HttpClient(handler);
    }

    getCurrent(country: string, city: string) {
        console.log( `${city},${country}`);
        let params = new HttpParams();
        params = params.append('q', `${city},${country}`);
        params = params.append('units', 'metric');
        params = params.append('appid', '[Opean Weather App Id]');

        return this.http.get<any>(`${environment.currentWeatherApiUrl}`, { params: params });
    } 
    
    getForecast(country: string, city: string) {
        let params = new HttpParams();
        params = params.append('q', `${city},${country}`);
        params = params.append('units', 'metric');
        params = params.append('appid', '[Opean Weather App Id]');

        return this.http.get<any>(`${environment.forcastWeatherApiUrl}`, { params: params });
    } 
}
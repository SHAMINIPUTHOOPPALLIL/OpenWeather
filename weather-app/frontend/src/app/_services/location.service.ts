import { Injectable } from '@angular/core';
import { HttpClient, HttpParams   } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { Country, City } from '../_models';

@Injectable({ providedIn: 'root' })
export class LocationService {    

    constructor(private http: HttpClient) { 
    }

    searchCountries(name: string) {
        let params = new HttpParams();
        params = params.append('search', name);
        return this.http.get<Country[]>(`${environment.apiUrl}/countries`, { params: params });
    }  
    
    searchCities(country: string, name: string) {
        let params = new HttpParams();
        params = params.append('country', country);
        params = params.append('search', name);
        return this.http.get<City[]>(`${environment.apiUrl}/cities`, { params: params });
    }  
}
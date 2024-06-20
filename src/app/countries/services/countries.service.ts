import { Injectable } from '@angular/core';

import { Country, CountryModel, Region } from '../interfaces/country.interface';
import { Observable, of, map, tap, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions : Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];

  constructor(
    private http: HttpClient,
  ) { }

  getRegions() {
    return [ ...this._regions ];
  }


  getCountriesByRegion( region: Region ) : Observable<CountryModel[]> {
    if (!region) return of([]);

    const url = `${this.baseUrl}/region/${region}?fields=name,cca3,borders`;
    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.map(country => <CountryModel>({
            name: country.name.common,
            cca3: country.cca3,
            borders: country.borders ?? [],
          }))
        )
      );
  }

  getCountryByCode( code: string ) : Observable<CountryModel> {
    if (!code) return of({} as CountryModel);

    const url = `${this.baseUrl}/alpha/${code}?fields=name,cca3,borders`;
    return this.http.get<Country>(url)
      .pipe(
        map((country) => <CountryModel>({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      );
  }

  getCountryByCodes( codes: string[] ) : Observable<CountryModel[]> {
    if (!codes || codes.length === 0) return of([]);

    const countriesRequests : Observable<CountryModel>[] = [];

    codes.forEach(country => {
      countriesRequests.push(this.getCountryByCode(country));
    });

    return combineLatest(countriesRequests);
  }
}

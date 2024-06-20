import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, map, switchMap, tap } from 'rxjs';

import { CountryModel, Region } from '../../interfaces/country.interface';
import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public myForm : FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required]
  });

  public countriesByRegion : CountryModel[] = [];

  public borderCountries : CountryModel[] = [];

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) { }

  ngOnInit(): void {
    this.onRegionChanged();
  }

  get regions() : Region[] {
    return this.countriesService.getRegions();
  }

  private onRegionChanged() : void {
    this.myForm.get('region')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('country')?.setValue('') ),
      tap( () => this.countriesByRegion = [] ),
      tap( () => this.borderCountries = [] ),
      switchMap( (region) => this.countriesService.getCountriesByRegion( region ) )
    )
    .subscribe( (countries) => {
      this.countriesByRegion = countries;
    });

    this.myForm.get('country')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')?.setValue('') ),
      tap( () => this.borderCountries = [] ),
      filter( (code) => code.length > 0 ),
      switchMap( (code) => this.countriesService.getCountryByCode( code ) ),
      switchMap( (country) => this.countriesService.getCountryByCodes( country.borders ?? [] ) ),
    )
    .subscribe( (countries) => {
      this.borderCountries = countries;
    });
  }

}

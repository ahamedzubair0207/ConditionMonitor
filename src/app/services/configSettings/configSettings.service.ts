import { Injectable } from '@angular/core';
import { CustomHttp } from '../custom_http/custom_http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppConstants } from '../../helpers/app.constants';
import { Responsive } from '@amcharts/amcharts4/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigSettingsService {

  constructor(private http: CustomHttp) { }

  getApplicationInfo(): Observable<any> {
    return this.http.get(AppConstants.APP_INFO)
      .pipe(
        map(response => response)
      );
  }

  // Need to interpolate strings for IDs once DB is in good shape
  // getCreateOrgScreenLabels(): Observable<any> {
  //   return this.http.get(AppConstants.ORG_LBL)
  //     .pipe(
  //       map(response => response)
  //     );
  // }

  // getTrendChartConfigScreenLabels(): Observable<any>{
  //   return this.http.get(AppConstants.TRENDCHART_LBL)
  //   .pipe(
  //     map(response => response)
  //   );
  // }

  // getDataTableConfigScreenLabels(): Observable<any>{
  //   return this.http.get(AppConstants.DATA_TABLE_LBL)
  //   .pipe(
  //     map(response => response)
  //   );
  // }

  // getImageOverLayConfigScreenLabels(): Observable<any>{
  //   return this.http.get(AppConstants.IMAGE_OVERLAY_LBL)
  //   .pipe(
  //     map(response => response)
  //   );
  // }

  // // Need to interpolate strings for IDs once DB is in good shape
  // getCreateLocScreenLabels(): Observable<any> {
  //   return this.http.get(AppConstants.LOC_LBL)
  //   .pipe(
  //     map(response => response)
  //   );
  // }
}

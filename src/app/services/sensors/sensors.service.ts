import { Injectable } from '@angular/core';
import { CustomHttp } from '../custom_http/custom_http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppConstants } from '../../helpers/app.constants';
import { HttpParams, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  apiURL: string = '';

  constructor(private http: CustomHttp, private httpClient: HttpClient) { }

  getSensorTree() {
    return this.http.get(AppConstants.GET_SENSOR_TREE)
      .pipe(
        map(response => response)
      );
  }

  getSensorList() {
    return this.http.get(AppConstants.GET_SENSOR_LIST)
      .pipe(
        map(response => response)
      );
  }

  getSensorDetailsById(sensorId) {
    return this.http.get(AppConstants.GET_SENSOR_DETAIL_BY_ID + '/' + sensorId)
      .pipe(
        map(response => response)
      );
  }

  getSensorDetailsByTypeAndId(type, typeId) {
    //type = organization, sensor && Id= Organization Id, sensor ID
    return this.http.get(AppConstants.GET_SENSOR_DETAIL_BY_TYPE_AND_ID + '/' + type + '/Id/' + typeId)
      .pipe(
        map(response => response)
      );
  }

  updateSensorDetail(sensorId, sensorObj) {
    return this.http.patch(AppConstants.UPDATE_SENSOR_BY_ID + '/' + sensorId, sensorObj);
  }

  updateSensorLinkStatus(sensorId, sensorObj) {
    return this.http.patch(AppConstants.UPDATE_SENSOR_LINK_STATUS + '/' + sensorId, sensorObj);
  }


}

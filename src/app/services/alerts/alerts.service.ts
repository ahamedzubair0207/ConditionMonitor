import { Injectable, EventEmitter } from '@angular/core';
import { CustomHttp } from '../custom_http/custom_http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Alert } from '../../models/alert.model';
import { AppConstants } from '../../helpers/app.constants';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  createAlertRuleEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: CustomHttp) { }


  getAllAlerts(): Observable<any> {
    return this.http.get(AppConstants.GET_ALERT)
      .pipe(
        map(response => response)
      );
  }

  getAlertByAlertId(alertId: string) {
    return this.http.get(`${AppConstants.GET_ALERT_BYALERTID}/${alertId}`)
      .pipe(
        map(response => response)
      );
  }

  getAllMetricTypes(): Observable<any> {
    return this.http.get(AppConstants.GET_ALERT_METRICS)
      .pipe(
        map(response => response)
      );
  }

  getAllSignalTypes(): Observable<any> {
    return this.http.get(AppConstants.GET_SIGNAL_TYPE);
  }

  getUomForSelectedSignalType(signalId: string, userId: string): Observable<any> {
    return this.http.get(AppConstants.GET_USER_UOM_BY_SIGNAL_TYPE + '?signalId=' + signalId + '&userId=' + userId);
  }

  getUserGroupRoles(): Observable<any> {
    return this.http.get(AppConstants.GET_ALERT_USERGROUPROLE)
      .pipe(
        map(response => response)
      );
  }

  // getAccessScopeByOrgId(orgId: string): Observable<any> {
  //   return this.http.get(`${AppConstants.GET_ALERT_ACCESSSCOPE}/${orgId}`)
  //     .pipe(
  //       map(response => response)
  //     );
  // }

  getAllAlertsByOrgId(orgId: string): Observable<any> {
    return this.http.get(`${AppConstants.GET_ALERT_BYORGID}/${orgId}`)
      .pipe(
        map(response => response)
      );
  }

  getAllAlertsByUserId(userId: string): Observable<any> {
    return this.http.get(`${AppConstants.GET_ALERT_BYUSERID}/${userId}`)
      .pipe(
        map(response => response)
      );
  }

  getAlertRuleSignalAssociatedAssetByOrgId(orgId: string, alertId: string, uomId: string): Observable<any> {
    return this.http.get(`${AppConstants.GET_ALERT_RULESIGNALS_ASSOCIATION_ASSETS}/${orgId}/${alertId}/${uomId}`)
      .pipe(
        map(response => response)
      );
  }

  createAlertRule(alertRule: Alert) {
    return this.http.post(AppConstants.CREATE_ALERT, alertRule)
      .pipe(
        map(response => response)
      );
  }

  updateAlertRule(alertRule: Alert) {
    return this.http.patch(`${AppConstants.UPDATE_ALERT}/${alertRule.alertRuleId}`, alertRule)
      .pipe(
        map(response => response)
      );
  }


  ALertRuleUserGroupSubscriber(alertRuleId) {
    return this.http.get(`${AppConstants.GET_ALERTRULE_USERGROUP_SUBSCRIBER}/${alertRuleId}`)
      .pipe(
        map(response => response)
      );
  }

  updateAlert(body: Alert) {

    return this.http.patch(AppConstants.EDIT_ALERT + '/' + body.alertRuleId, body)
      .pipe(
        map(response => response)
      );
  }

  deleteAlert(alertRuleId: string) {
    return this.http.delete(AppConstants.DEL_ALERT + '/' + alertRuleId, alertRuleId)
      .pipe(
        map(response => response)
      );
  }

  // getAllHierarchy(id, type) {
  //   return (this.http.get(AppConstants.NAVIGATION_URL + '?Id=' + id + '&type=' + type));
  // }



}

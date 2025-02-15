import { SharedService } from 'src/app/services/shared.service';
import { Alert } from './../../../models/alert.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ViewEncapsulation, ElementRef, Input } from '@angular/core';
import { Location as RouterLocation } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { LocationService } from 'src/app/services/locations/location.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LocationSignalService } from '../../../services/locationSignal/location-signal.service';
import { ToastrService } from 'ngx-toastr';
import { Toaster } from '../../shared/votm-cloud-toaster/votm-cloud-toaster';
import { Location } from 'src/app/models/location.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
@Component({
  selector: 'app-votm-cloud-locations-signal',
  templateUrl: './votm-cloud-locations-signal.component.html',
  styleUrls: ['./votm-cloud-locations-signal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VotmCloudLocationsSignalComponent implements OnInit {

  locationId: string; // to store selected location's id.
  organizationId: string; // to store selected organization's id
  organizationName: string; // to store selected organization's name
  associatedSignals: any[] = [];
  selectedSignal; // selected signal to display overlay panel.
  toaster: Toaster = new Toaster(this.toastr);
  isGetAvailableSignalsAPILoading = false; // flag for loader for get available signals api
  isGetAssociatedSignalsAPILoading = false; // flag for loader for get associated signals api
  isCreateSignalAssociationAPILoading = false; // flag for loader for create signals association api
  imgURL: any; // to store the base64 of location image.
  curOrganizationId: string;
  curOrganizationName: string;
  sensors = [];
  derivedSignals: any = [];
  alertRules: any[] = [];
  location: Location;
  @Input() disable = true;
  showUnassoc = false;
  showAssoc = true;
  model = 'signal';
  pageType: string;
  // alert modal vaiables

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private locationSignalService: LocationSignalService,
    private sharedService: SharedService,
    private locationService: LocationService,
    private alertsService: AlertsService,
    private domSanitizer: DomSanitizer,
    private toastr: ToastrService,
    private ngbModal: NgbModal
  ) { }

  ngOnInit() {
    this.pageType = this.activatedRoute.snapshot.data['type'];
    if (this.pageType.toLowerCase() === 'edit') {
      this.toggleDisable();
    }
    this.activatedRoute.paramMap.subscribe(params => {
      this.curOrganizationId = params.get('curOrgId');
      this.curOrganizationName = params.get('curOrgName');
      this.locationId = params.get('locId');
      // console.log(this.curOrganizationId, '====', this.curOrganizationName, '====', this.organizationId);

      this.getLocationSignalAssociation();

    });
  }

  /**
   * To get the location details by location id
   * Location id will fetch from current route.
   */
  getLocationById() {
    this.locationService.getLocationById(this.locationId)
      .subscribe(response => {
        this.location = response;
        if (this.location.logo && this.location.logo.imageName) {
          let fileExtension = this.location.logo.imageName.slice(
            (Math.max(0, this.location.logo.imageName.lastIndexOf('.')) || Infinity) + 1);
          // For svg type files use svg+xml as extention
          if (fileExtension === 'svg') {
            fileExtension = 'svg+xml';
          }
          this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(`data:image/${fileExtension};base64,${this.location.logo.image}`);
        } else {
          this.imgURL = '../../../../assets/images/default-image-svg.svg';
        }
      });
  }

  getAlertRulesList() {
    this.alertsService.getAllAlertsByOrgId(this.curOrganizationId)
      .subscribe(response => {
        this.alertRules = response;
      });
  }

  /**
   * To get all available signals for that location and organization.
   * Location id and Organization Id will fetch from current route.
   * This function sets the sensor disable which are already associated.
   */
  getAllAvailableSignals() {
    this.isGetAvailableSignalsAPILoading = true;
    this.locationSignalService.getSignalsByLocation('location', this.locationId)
      .subscribe(async response => {
        // console.log(response);
        this.sensors = response;
        for (const sensor of this.sensors) {
          sensor.node = await this.sharedService.toSortListAlphabetically(sensor.node, 'signalName');
          for (const signal of sensor.node) {
            signal.sensorId = sensor.sensorId;
            signal.sensorName = sensor.sensorName;
            signal.signalId = signal.signalId;
            signal.signalName = signal.signalName;
            signal.associationName = signal.signalName;
            signal.associated = false;
            signal.imageCordinates = {
              x: 0,
              y: 0
            };
            signal.icon = signal.iconFile;
            for (const associateSignal of this.associatedSignals) {
              if (associateSignal.signalId === signal.signalId &&
                associateSignal.sensorId === signal.sensorId && sensor.isLink) {
                signal.associated = true;
                signal.associationName = associateSignal.associationName;

              }
            }
          }
        }

        this.isGetAvailableSignalsAPILoading = false;
      },
        error => {
          this.isGetAvailableSignalsAPILoading = false;
        });
  }

  getLocationSignalAssociation() {
    this.isGetAssociatedSignalsAPILoading = true;
    this.locationSignalService.getSignalAssociation(this.locationId)
      .subscribe(
        response => {
          this.getAllAvailableSignals();
          this.getLocationById();
          this.getAlertRulesList();
          this.isGetAssociatedSignalsAPILoading = false;
          for (let i = 0; i < response.length; i++) {
            const signal = response[i];
            signal.imageCordinates = signal.imageCordinates[signal.associationName];
            signal.pctPos = {};
            signal.pctPos['left'] = signal.imageCordinates.x;
            signal.pctPos['top'] = signal.imageCordinates.y;
            signal.isClicked = false;
            signal.icon = signal.iconFile;
            signal.associated = true;
            signal.did = i;
            signal.bound = signal.sensorLinkStatus;
          }
          this.associatedSignals = [...response];
        },
        error => {
          this.isGetAssociatedSignalsAPILoading = false;
        }
      );
  }

  toggleDisable() {
    this.disable = !this.disable;
    this.showUnassoc = !this.disable;
    this.showAssoc = true;
  }

  onDetachSignalFromAsset(signalMappingId) {
    this.locationSignalService.detachSignalAssociation(signalMappingId).subscribe(
      response => {
        this.toaster.onSuccess('Signal detached successfully', 'Detached');
        this.getLocationSignalAssociation();
        this.toggleDisable();
      }
    );
  }

  onClickOfAlarmRuleAssociation(alertObj) {
    this.locationSignalService.updateAlertSignalMapping(alertObj.alerts, alertObj.signalMappingId ).subscribe(
      response => {
        this.toaster.onSuccess('Alarm Rule associated successfully.', 'Association Saved!');
        this.toggleDisable();
        this.getLocationSignalAssociation();
      }, error => {
        this.toaster.onFailure('Error while associating Alarm Rule.', 'Association Error!');
      }
    );
  }



  onSaveSignalAssociation(droppedList) {
    const signals = [];
    for (let i = 0; i < droppedList.length; i++) {
      if (droppedList[i].derived) {
      } else {
        signals.push(droppedList[i]);
      }
    }
    const data = signals.map(signal => {
      const obj = {
        locationId: this.locationId,
        signalId: signal.signalId,
        sensorId: signal.sensorId,
        imageCordinates: {},
        name: signal.signalName,
        associationName: signal.associationName,
        signalMappingId: signal.signalMappingId ? signal.signalMappingId : null
      };
      obj.imageCordinates[signal.associationName] = {
        x: signal.pctPos['left'],
        y: signal.pctPos['top']
      };
      return obj;
    });
    this.locationSignalService.createSignalAssociation(data)
      .subscribe(
        response => {
          // console.log(response);
          this.toaster.onSuccess('Signal associated successfully', 'Saved');
          this.getLocationSignalAssociation();
          this.toggleDisable();
        }, error => {
          this.toaster.onFailure('Error while saving signal assocition', 'Error');
        }
      );
  }

  onCreateAssociateRule(signal) {
    // this.route.navigate(['org', 'view', this.curOrganizationId, this.curOrganizationName,
    // this.organizationId ? this.organizationId : this.curOrganizationId, 'alertRule', 'create']);

  }

  onReturnToList() {
    this.route.navigate(['loc', 'home', this.curOrganizationId, this.curOrganizationName]);
  }

  onReset() {
    this.getLocationSignalAssociation();
    this.toggleDisable();
  }



}

import { VotmcloudDashboardCreateComponent } from './../../shared/votmcloud-dashboard-create/votmcloud-dashboard-create.component';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
// import { OrganizationService } from 'src/app/services/organizations/organization.service';
import { Organization } from 'src/app/models/organization.model';
// import { ConfigSettingsService } from 'src/app/services/configSettings/configSettings.service';
import { ApplicationConfiguration } from 'src/app/models/applicationconfig.model';
import { Address } from 'src/app/models/address.model';
import { UnitOfMeassurement } from 'src/app/models/unitOfMeassurement.model';
import { Logo } from 'src/app/models/logo.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Route, Routes, Router, NavigationEnd } from '@angular/router';
import { DatePipe, Location as RouterLocation } from '@angular/common';
import { NgForm, FormGroup } from '@angular/forms';
import { VotmCloudConfimDialogComponent } from '../../shared/votm-cloud-confim-dialog/votm-cloud-confim-dialog.component';
import { Toaster } from '../../shared/votm-cloud-toaster/votm-cloud-toaster';
import { ToastrService } from 'ngx-toastr';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { countyList } from 'src/app/services/countryList/countryStateList';
import { AssetsService } from '../../../services/assets/assets.service';
import { SortArrays } from '../../shared/votm-sort';
import { setDashboardConfiguration } from 'src/assets/js/data';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { VotmCommon } from '../../shared/votm-common';
import { NgbDateMomentParserFormatter } from '../../shared/votm-ngbdatepickerformatter/votm-ngbdatepickerformatter';
// Dashboard-david start
import { DashboardService } from '../../../services/dasboards/dashboard.service';
import { DbTplItem } from 'src/app/models/db-tpl-item';
import { DbItem } from 'src/app/models/db-item';
import { DashBoard } from 'src/app/models/dashboard.model';
import { object } from '@amcharts/amcharts4/core';
// Dashboard-david end
declare var jQuery: any;

@Component({
  selector: 'app-votm-cloud-organizations-create',
  templateUrl: './votm-cloud-organizations-create.component.html',
  styleUrls: ['./votm-cloud-organizations-create.component.scss'],
  providers: [DatePipe]
})
export class VotmCloudOrganizationsCreateComponent implements OnInit, AfterViewInit {
  public imagePath;
  imgURL: any = '../../../../assets/images/orgLogoPlaceholder.svg';
  public message: string;
  closeResult: string;
  modal: any;
  UOM: any;
  pageLabels: any;
  organizationTypes: Array<any>;
  states: Array<any> = [];
  countries: Array<any> = [];
  tempUoM: UnitOfMeassurement;
  orgMeasurementType: string;
  parentOrganizationInfo: any;
  templateList: any[] = [];
  placeholder: string;

  //Time Concise
  timeFormat: any;

  pageTitle: string;
  pageType: string;

  uomModels: {};
  uomArray: any[];

  alertRuleList: any[] = [];

  orgId: string;
  previousURLToNavigate: string;
  subscription: any;
  organization: Organization = new Organization();
  applicationConfiguration: ApplicationConfiguration = new ApplicationConfiguration();
  curOrgId: any;
  curOrgName: any;
  previousUrl: any;
  tempContractStartDate: NgbDateStruct;
  tempContractEndDate: NgbDateStruct;

  @ViewChild('startDate', null) startDate: NgForm;
  @ViewChild('organizationForm', null) organizationForm: NgForm;
  @ViewChild('confirmBox', null) confirmBox: VotmCloudConfimDialogComponent;
  @ViewChild('confirmBoxDash', null) confirmBoxDash: VotmCloudConfimDialogComponent;
  @ViewChild('addDashboardModal', null) addDashboardModal: VotmcloudDashboardCreateComponent;
  @ViewChild('file', null) logoImage: any;
  fileName: any;
  fileExtension: string;
  previousUOM: any;
  toaster: Toaster = new Toaster(this.toastr);
  svcLevels: any[] = [];
  sensorBlocks: any[] = [];
  cellularBlocks: any[] = [];
  organizationList: any[] = [];
  countryObject: any[] = [];

  // Dashboard Item
  dashboardData: any;
  dashboardTemplates: {};
  delDashboardId: any;
  // @ViewChild('op', null) panel: OverlayPanel;
  userdashboardData: { id: string; templateName: string; dashboardName: string; dashboardHTML: any; }[];
  dashboardDataById: { act: string; title: string; dashboardName: string; dashboardHTML: any; };
  addDashboardArray: any;
  isAddOrganizationAPILoading = false;
  modifiedDate: string;

  // Dashboard-david start
  dbTemplates: DbTplItem[];
  dbItems: DbItem[] = [];
  selTemplate: string;
  dbLongName: string = '';
  dbShortName: string = '';
  dbLastIdNum: number = 0;
  newTabId: string = '';
  activeTab: string;
  // Dashboard-david end
  locked: boolean = true; // For Dashboard

  // Flag to pass originList to sensor list common selector - app-votm-cloud-admin-sensor-home
  originListView: string = 'organizationView';
  actionType: string;

  dashboardTabs: Array<DashBoard> = [];
  dashboardTab: DashBoard = new DashBoard();
  deleteDashboardId: any;
  loader: boolean;
  loaderForOptions: boolean;
  prntOrgLoader: boolean;
  loaderAppInfo: boolean;
  detailsMainTabList: string[];
  deletedDashboardName: any;
  selectedTab = 'org-details';

  constructor(
    private assetService: AssetsService,
    private ngbModal: NgbModal,
    private alertRuleservice: AlertsService,
    // private organizationService: OrganizationService,
    // private configSettingsService: ConfigSettingsService,
    private domSanitizer: DomSanitizer,
    private activeroute: ActivatedRoute,
    private route: Router,
    private datePipe: DatePipe,
    private routerLocation: RouterLocation,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,

    private dbService: DashboardService, // Dashboard-david
  ) {
    this.UOM = 'Imperial';
    this.subscription = route.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.previousUrl) {
          this.previousURLToNavigate = JSON.parse(JSON.stringify(this.previousUrl));
        }
        this.previousUrl = event.url;
      }
    });
    // this.route.routeReuseStrategy.shouldReuseRoute = () => false;

    // Dashboard-david start
    // this.dbService.hello();
    this.dbTemplates = this.dbService.getDashboardTemplates();
    this.selTemplate = this.dbTemplates[0].name;

    // this.newTab.subscribe(() => {
    //   this.dbLastIdNum++;
    //   this.newTabId = "dbtab-" + this.dbLastIdNum;
    //   this.dbItems.push(new DbItem(this.newTabId, this.dbLongName, this.dbShortName, this.selTemplate,
    //     this.dbTemplates.find(({ name }) => name === this.selTemplate).component, ''));
    //   this.dbLongName = '';
    //   this.dbShortName = '';
    //   this.selTemplate = this.dbTemplates[0].name;
    //   setTimeout(() => {
    //     // this.tabSet.select(this.newTabId);
    //   }, 1);
    // });
    // Dashboard-david end

  }

  ngOnInit() {
    this.organization.svclevels = null;
    this.organization.localeId = null;
    this.organization.timeZoneId = null;
    this.organization.cellularBlocks = null;
    this.organization.sensorBlocks = null;
    // this.organization.timeZone = null;



    this.organization.modifiedOn = null; //TimeConcise
    // this.organization.locale = null;
    // this.activeroute.paramMap.subscribe(params => {
    //   this.curOrgId = params.get('curOrgId');
    //   this.curOrgName = params.get('curOrgName');
    //   this.orgId = params.get('orgId');
      this.activeTab = 'org-details';
      this.detailsMainTabList = ['org-details', 'org-alert', 'asset-template', 'org-sensors', 'org-gateways'];
      this.activeroute.fragment.subscribe(
        (fragment) => {
          this.activeTab = fragment;
          if (!this.activeTab) {
            this.activeTab = 'org-details';
          }
          let tabList = ['org-details', 'org-alert', 'asset-template', 'org-sensors', 'org-gateways', 'event-details'];
          if (fragment && tabList.indexOf(fragment) < 0) {
            this.activeTab = 'org-details';
            this.goToTab('org-details');
          } else {
            // console.log('Entererd in else ', fragment);
            if (fragment) {
              this.activeTab = fragment;
            }
          }
          if (fragment === 'org-alert') {
            // this.fetchAlertRuleList();
          } else if (fragment === 'asset-template') {
            this.onTemplateTabClick();
          }
        }
      );
      this.countries = countyList;

    //   this.getOptionsListData('Sensor Blocks');
    //   this.getOptionsListData('Cellular Blocks');
    //   this.getOptionsListData('Service Levels');
    //   this.getAllOrganizations();

    //   if (this.orgId) {

    //     this.getAllDashboards(false);
    //   } else {
    //     this.placeholder = VotmCommon.dateFormat;
    //     this.parentOrganizationInfo = {
    //       // parentOrganizationId: this.curOrgId, // '7A59BDD8-6E1D-48F9-A961-AA60B2918DDE',
    //       // parentOrganizationName: this.curOrgName // 'Parker1'
    //       parentOrganizationId: this.activeroute.snapshot.paramMap.get('curOrgId'), // '7A59BDD8-6E1D-48F9-A961-AA60B2918DDE',
    //       parentOrganizationName: this.activeroute.snapshot.paramMap.get('curOrgName') // 'Parker1'
    //     };
    //     this.organization.parentOrganizationId = this.parentOrganizationInfo.parentOrganizationId;

    //     this.setDefaultParentOrganizationOptions();
    //     this.organization.active = true;

    //     this.UOM = 'Imperial';
    //     this.organization.address = [new Address()];
    //     this.organization.address[0].addressType = 'Billing';
    //     this.organization.address[0].country = null;
    //     this.organization.address[0].state = null;
    //     this.organization.modifiedOn = null; //TimeConcise
    //   }
    //   this.getAllAppInfo();
    //   this.getScreenLabels();
    //   this.dashboardData = this.getDashboards();
    // this.getDashboardsTemplates();
    // });

    // this.pageType = this.activeroute.snapshot.data['type'];
    // this.actionType = this.activeroute.snapshot.data['action'];
    // this.pageTitle = `${this.pageType} Organization`;
    // this.orgMeasurementType = 'Imperial';



    this.organizationTypes = [
      { value: 'organizationType1', text: 'organizationType1' },
      { value: 'organizationType2', text: 'organizationType2' }
    ];

    //   this.dashboardData = {
    //   act: 'add',
    //   title: 'Dashboard',
    //   id: '1',
    //   templateName: 'Standard Organization Dashboard'
    // };

    this.dashboardTemplates = [
      {
        id: '1',
        templateName: 'Standard Organization Dashboard'
      },
      {
        id: '2',
        templateName: 'Standard Location Dashboard'
      },
      {
        id: '3',
        templateName: 'Standard Asset Dashboard'
      }
    ];

    jQuery('.nav-item').tooltip();
  }
  private getAllDashboards(flag) {
    this.dbService.getAllDashboards(this.orgId, 'organization')
      .subscribe(response => {
        // console.log('get All Dashboard ', response);
        this.dashboardTabs = response;
        if (flag) {
          this.activeTab = this.dashboardTabs[this.dashboardTabs.length - 1].dashboardId;
          console.log(this.activeTab);
          this.goToTab(this.activeTab);
        }
      });
  }

  ngAfterViewInit(): void {
    //  jQuery('.selectpicker').selectpicker();
    this.showImageLogo();
  }

  getDBDashboards() {
    // service to get all dashboards by userid
    return [
      {
        id: '1',
        lName: '',
        sName: '',
        tplName: '',
        component: '',
        widgetConf: ''
      }
    ];

  }

  onCountryChange(event) {
    if (this.organization.address && this.organization.address.length > 0) {
      this.organization.address[0].state = null;
    } else {
      this.organization.address = [new Address()];
      this.organization.address[0].state = null;
    }
    this.countries.forEach(country => {
      if (country.countryName === this.organization.address[0].country) {
        this.states = [];
        country.states.forEach((state: any) => {
          this.states.push({ value: state, text: state });
        });
      }
    });
  }



  showImageLogo() {
    if (this.logoImage) {
    } else {
      setTimeout(() => {
        this.showImageLogo();
      }, 10);
    }
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onStartDateChange() {
    this.organizationForm.form.controls['startDate'].markAsDirty();
    this.compareDate();
  }


  compareDate() {
    if (this.tempContractStartDate && this.tempContractEndDate) {
      let startDate = new Date(this.tempContractStartDate.year, this.tempContractStartDate.month, this.tempContractStartDate.day);
      let endDate = new Date(this.tempContractEndDate.year, this.tempContractEndDate.month, this.tempContractEndDate.day);
      if (startDate >= endDate) {
        this.organizationForm.form.controls['startDate'].setErrors({ 'invalidDate': true });
      } else {
        this.organizationForm.form.controls['startDate'].setErrors(null);
      }
    }
  }

  onEndDateChange() {
    this.organizationForm.form.controls['endDate'].markAsDirty();
    this.compareDate();
  }

  onDescriptionChange() {
    if (this.organization.description && this.organization.description.length > 4000) {
      this.organizationForm.form.controls['orgDescription'].setErrors({ 'invalidDescription': true });
    }
  }


  // getOrganizationInfo() {
  //   this.loader = true;
  //   this.organizationService.getOrganizationById(this.orgId)
  //     .subscribe(response => {
  //       this.organization = response;

  //       if (this.organization.modifiedOn) {
  //         this.modifiedDate = moment(this.organization.modifiedOn).format(VotmCommon.dateFormat) + ' ' + moment(this.organization.modifiedOn).format(VotmCommon.timeFormat);
  //       }

  //       //  this.fillUoM();
  //       // this.organization.timeZoneId = this.organization.timeZone;
  //       // this.organization.localeId = this.organization.locale;
  //       // this.organization.uoMId = this.organization.uoM;
  //       const uom = this.applicationConfiguration.unitOfMeassurement;
  //       if (!this.organization.measurementType) {
  //         this.orgMeasurementType = 'Imperial';
  //         this.fillUoM(uom, 'imperialDefault');
  //       } else {
  //         this.uomModels = {};
  //         this.orgMeasurementType = this.organization.measurementType;
  //         if (this.organization.uoMId) {
  //           for (let i = 0; i < uom.length; i++) {
  //             this.uomModels[uom[i].uomTypeId] = {};
  //             for (const uomOption of uom[i].uoMView) {
  //               for (const orgUOMId of this.organization.uoMId) {
  //                 if (uomOption.uoMId === orgUOMId) {
  //                   this.uomModels[uom[i].uomTypeId] = uomOption;
  //                 }
  //               }
  //             }
  //           }
  //           const keys = Object.keys(this.uomModels);
  //           keys.forEach(key => {
  //             if (Object.keys(this.uomModels[key]).length === 0) {
  //               delete this.uomModels[key];
  //             }
  //           });
  //         }
  //       }
  //       if (this.organization.contractStartDate) {
  //         let startDate = new Date(this.organization.contractStartDate);
  //         this.tempContractStartDate = { year: startDate.getFullYear(), month: startDate.getMonth(), day: startDate.getDate() };
  //       }
  //       if (this.organization.contractEndDate) {
  //         let endDate = new Date(this.organization.contractEndDate);
  //         this.tempContractEndDate = { year: endDate.getFullYear(), month: endDate.getMonth(), day: endDate.getDate() };
  //       }
  //       this.onLocaleChange();
  //       if (this.organization.logo && this.organization.logo.imageName) {
  //         this.fileExtension = this.organization.logo.imageName.slice((Math.max(0, this.organization.logo.imageName.lastIndexOf(".")) || Infinity) + 1);
  //         // For svg type files use svg+xml as extention
  //         if (this.fileExtension === 'svg') {
  //           this.fileExtension = 'svg+xml';
  //         }
  //         this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(`data:image/${this.fileExtension};base64,${this.organization.logo.image}`);
  //         this.organization.logo.imageType = this.fileExtension;
  //       }

  //       this.countries.forEach(country => {
  //         if (country.countryName === this.organization.address[0].country) {
  //           this.states = [];
  //           country.states.forEach((state: any) => {
  //             this.states.push({ value: state, text: state });
  //           });
  //         }
  //       });
  //       this.setDefaultParentOrganizationOptions();
  //       this.loader = false;
  //     });
  // }

  // setDefaultParentOrganizationOptions() {
  //   if (!this.organizationList || this.organizationList.length === 0) {
  //     this.organizationList = [];
  //     this.organizationList.push({ organizationId: this.curOrgId, name: this.curOrgName });
  //   }
  // }

  // getScreenLabels() {
  //   this.configSettingsService.getCreateOrgScreenLabels()
  //     .subscribe(response => {
  //       this.pageLabels = response;
  //     });
  // }

  // getOptionsListData(listData: string) {
  //   this.loaderForOptions = true;
  //   this.organizationService.getOptionsListData(listData)
  //     .subscribe(response => {
  //       if (listData === 'Service Levels') {
  //         this.svcLevels = [];
  //         this.svcLevels = response;
  //       }
  //       if (listData === 'Sensor Blocks') {
  //         this.sensorBlocks = [];
  //         this.sensorBlocks = response;
  //       }
  //       if (listData === 'Cellular Blocks') {
  //         this.cellularBlocks = [];
  //         this.cellularBlocks = response;
  //       }

  //       this.loaderForOptions = false;
  //     }, error => {
  //       this.loaderForOptions = false;
  //     });
  // }

  // deleteOrganizationById(event) {
  //   if (event) {
  //     this.organizationService.deleteOrganization(this.organization.organizationId)
  //       .subscribe(response => {
  //         this.toaster.onSuccess(`You have deleted ${this.organization.name} successfully`, 'Delete Success!');
  //         this.route.navigate([`org/home/${this.curOrgId}/${this.curOrgName}`]);
  //       }, error => {
  //         this.toaster.onFailure('Something went wrong on server. Please try after sometiime.', 'Delete Fail!');
  //       });
  //   }
  // }

  // createNestedOrganization(event) {
  //   this.route.navigate([`org/create-suborg/${this.organization.organizationId}/${this.organization.name}`]);
  // }

  // createNestedLocation(event) {
  //   // let parentLocId = '19d7e5e5-fda7-4778-b943-62e36078087a';
  //   // let parentLocName = 'Mineapolis';
  //   this.route.navigate([`loc/create/${this.organization.organizationId}/${this.organization.name}`], { fragment: 'sublocation' });
  // }

  openConfirmDialog() {

    this.confirmBox.open();

  }

  // getAllAppInfo() {
  //   this.loaderAppInfo = true;
  //   this.configSettingsService.getApplicationInfo()
  //     .subscribe((response: any) => {
  //       this.applicationConfiguration = response;
  //       this.applicationConfiguration.unitOfMeassurement = this.applicationConfiguration.unitOfMeassurement.filter(
  //         uomObj => uomObj.isDisplay
  //       );
  //       if (this.orgId) {
  //         // this.getOrganizationInfo();
  //       } else {
  //         this.orgMeasurementType = 'Imperial';
  //         const uom = this.applicationConfiguration.unitOfMeassurement;
  //         this.fillUoM(uom, 'imperialDefault');
  //       }
  //       this.onLocaleChange();

  //       this.loaderAppInfo = false;
  //       // this.uomArray = new Array[this.applicationConfiguration.unitOfMeassurement.length];
  //     });
  // }

  // onUnitChange(value) {
  //   // // // // console.log(value);
  //   const uom = this.applicationConfiguration.unitOfMeassurement;
  //   this.orgMeasurementType = value.target.value;
  //   if (this.orgMeasurementType === 'Imperial') {
  //     this.fillUoM(uom, 'imperialDefault');
  //   } else if (this.orgMeasurementType === 'Metric') {
  //     this.fillUoM(uom, 'metricDefault');
  //   }
  // }

  // fillUoM(uom, type) {
  //   // console.log(uom);
  //   this.uomModels = {};
  //   for (let i = 0; i < uom.length; i++) {
  //     this.uomModels[uom[i].uomTypeId] = {};
  //     for (const uomOption of uom[i].uoMView) {
  //       if (uomOption[type]) {
  //         this.uomModels[uom[i].uomTypeId] = uomOption;
  //       }
  //     }
  //   }
  //   const keys = Object.keys(this.uomModels);
  //   keys.forEach(key => {
  //     if (Object.keys(this.uomModels[key]).length === 0) {
  //       delete this.uomModels[key];
  //     }
  //   });
  //   // this.setUOMMeasurement();
  // }

  // onUoMDropdownChange(uomTypeId, uom) {
  //   this.uomModels[uomTypeId] = uom;
  //   this.setUOMMeasurement();
  // }

  // setUOMMeasurement() {
  //   let imperialCount = 0;
  //   let metricCount = 0;
  //   let customCount = 0;
  //   const keys = Object.keys(this.uomModels);
  //   keys.forEach(key => {
  //     let flag = true;
  //     if (this.uomModels[key].imperialDefault) {
  //       flag = false;
  //       imperialCount += 1;
  //     }
  //     if (this.uomModels[key].metricDefault) {
  //       flag = false;
  //       metricCount += 1;
  //     }
  //     if (flag) {
  //       customCount += 1;
  //     }
  //   });
  //   // console.log(imperialCount, '====', metricCount, '=======', customCount, '===', keys.length);
  //   if (imperialCount === keys.length) {
  //     this.orgMeasurementType = 'Imperial';
  //   } else if (metricCount === keys.length) {
  //     this.orgMeasurementType = 'Metric';
  //   } else {
  //     this.orgMeasurementType = 'Custom';
  //   }
  // }

  // saveOrgUOM() {
  //   this.organization.measurementType = this.orgMeasurementType;
  //   const keys = Object.keys(this.uomModels);
  //   this.organization.uoMId = [];
  //   keys.forEach(key => {
  //     this.organization.uoMId.push(this.uomModels[key].uoMId);
  //   });
  //   this.closemodal('save');
  // }

  preview(files) {
    this.message = '';
    if (files.length === 0) {
      return;
    }

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.';
      return;
    }
    this.handleFileSelect(files);
    var readerToPreview = new FileReader();
    this.imagePath = files;
    readerToPreview.readAsDataURL(files[0]);
    readerToPreview.onload = (_event) => {
      this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(readerToPreview.result.toString());; //readerToPreview.result;
    };
    // readerToPreview.onloadend = (e) => {
    //   let base64Image = this.domSanitizer.bypassSecurityTrustUrl(readerToPreview.result.toString());
    // }
  }

  handleFileSelect(files) {
    var file = files[0];
    if (files && file) {
      var reader: any = new FileReader();

      reader.onload = (e) => {
        // ADDED CODE
        let data;
        if (!e) {
          data = reader.content;
        } else {
          data = e.target.result;
        }
        let base64textString = btoa(data);
        this.organization.logo.image = base64textString;

        // business code
      };
      // reader.onload = this._handleReaderLoaded.bind(this);

      // //extend FileReader
      // if (!FileReader.prototype.readAsBinaryString) {
      //   FileReader.prototype.readAsBinaryString = function (fileData) {
      //     var binary = "";
      //     var pt = this;
      //     var reader = new FileReader();
      //     reader.onload = function (e) {
      //       var bytes = new Uint8Array(<ArrayBuffer>reader.result);
      //       var length = bytes.byteLength;
      //       for (var i = 0; i < length; i++) {
      //         binary += String.fromCharCode(bytes[i]);
      //       }
      //       //pt.result  - readonly so assign binary
      //       pt.content = binary;
      //       $(pt).trigger('onload');
      //     }
      //     reader.readAsArrayBuffer(fileData);
      //   }
      // }

      this.organization.logo = new Logo();
      this.organization.logo.imageName = file.name;
      this.organization.logo.imageType = file.type;
      reader.readAsBinaryString(file);


    }
  }

  _handleReaderLoaded(readerEvt) {
    let base64textString;
    var binaryString = readerEvt.target.result;


    // SVG Code
    // let parser = new DOMParser();
    // let xmlDoc: XMLDocument = parser.parseFromString(binaryString.toString(), 'image/svg+xml');
    // // // // console.log('XMLDocument ', xmlDoc, xmlDoc.getElementsByTagName('svg'))
    // const xml = (new XMLSerializer()).serializeToString(xmlDoc);
    // const svg64 = btoa(xml);
    // const b64Start = 'data:image/svg+xml;base64,';
    // const image64 = b64Start + svg64;
    // this.organization.logo.image = image64;
    // // // // console.log('this.organization.logo.image ', this.organization.logo.image)

    // Other Images
    base64textString = btoa(binaryString);
    this.organization.logo.image = base64textString;
    // // // console.log('organization ', base64textString);
  }

  open(content) {
    this.ngbModal.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  openmodal() {
    if (!this.organization.uoMId) {
      this.organization.uoMId = [];
    }
    this.previousUOM = JSON.parse(JSON.stringify(this.organization.uoMId));
    // Get the modal
    var modal = document.getElementById('myModal');
    modal.style.display = 'block';
    this.modal = document.getElementById('myModal');
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('close')[0];

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };

  }
  closemodal(event: string) {
    this.modal.style.display = 'none';
  }


  validateName(event, prop: string) {
    let abc = new RegExp(/^([A-Za-z])+$/);
    if (!abc.test(this.organization[prop])) {
      this.organization[prop] = this.organization[prop] ? this.organization[prop].slice(0, this.organization[prop].length - 1) : null;
    }
  }



  onUoMValueSelect(uomType, uomMeasureId) {
    // // // console.log('UOM  ID ', uomType, uomMeasureId)
  }

  // onOrganizationSubmit() {
  //   // let startDate: any = this.organization.contractStartDate;
  //   // let endDate: any = this.organization.contractEndDate;
  //   this.isAddOrganizationAPILoading = true;
  //   if (this.tempContractStartDate) {
  //     this.organization.contractStartDate = new Date(this.tempContractStartDate.year, this.tempContractStartDate.month, this.tempContractStartDate.day).toDateString();
  //   }
  //   if (this.tempContractEndDate) {
  //     this.organization.contractEndDate = new Date(this.tempContractEndDate.year, this.tempContractEndDate.month, this.tempContractEndDate.day).toDateString();
  //   }
  //   if (this.organizationForm && this.organizationForm.invalid) {
  //     // // // console.log('Invalid Form');
  //     this.toaster.onFailure('Please fill the form correctly.', 'Form is invalid!');
  //     Object.keys(this.organizationForm.form.controls).forEach(element => {
  //       this.organizationForm.form.controls[element].markAsDirty();
  //     });
  //     this.isAddOrganizationAPILoading = false;
  //   } else {
  //     // // // console.log('Valid Form');
  //     if (this.orgId) {
  //       this.organizationService.updateOrganization(this.organization)
  //         .subscribe(response => {
  //           this.toaster.onSuccess('Successfully updated', 'Updated');
  //           this.routerLocation.back();
  //           this.isAddOrganizationAPILoading = false;
  //         }, error => {
  //           this.toaster.onFailure('Something went wrong. Please fill the form correctly', 'Fail');
  //           this.isAddOrganizationAPILoading = false;
  //         });
  //     } else {
  //       this.organizationService.createOrganization(this.organization)
  //         .subscribe(response => {
  //           this.toaster.onSuccess('Successfully created', 'Created');
  //           this.route.navigate([`org/home/${this.parentOrganizationInfo.parentOrganizationId}/${this.parentOrganizationInfo.parentOrganizationName}`]);
  //           this.isAddOrganizationAPILoading = false;
  //         }, error => {
  //           this.toaster.onFailure('Something went wrong. Please fill the form correctly', 'Fail');
  //           this.isAddOrganizationAPILoading = false;
  //         });
  //     }
  //   }
  // }

  onCancelClick(event) {
    this.routerLocation.back();
  }

  // getAllOrganizations() {
  //   this.prntOrgLoader = true;
  //   this.organizationService.getAllOrganizationsList()
  //     .subscribe(response => {

  //       this.organizationList = response;
  //       let orgFound = false;
  //       this.organizationList.forEach(org => {
  //         if (org.organizationId === this.curOrgId) {
  //           orgFound = true;
  //         }
  //       });
  //       if (!orgFound) {
  //         this.organizationList.push({ organizationId: this.curOrgId, name: this.curOrgName });
  //       }
  //       this.organizationList.sort(SortArrays.compareValues('name'));
  //       VotmCommon.getUniqueValues(this.organizationList);
  //       // this.organization.parentOrganizationId = JSON.parse(JSON.stringify(this.organization.parentOrganizationId));

  //       this.prntOrgLoader = false;
  //     });
  // }


  goToTab(location: string): void {
    // window.location.hash = '';
    this.activeTab = location;
    window.location.hash = location;
  }


  // onAlertRuleTabClick() {
  //   this.goToTab('org-alert');
  //   // this.fetchAlertRuleList();
  //   // // // console.log('onAlertRuleTabClick');

  // }

  // fetchAlertRuleList() {
  //   if (!this.alertRuleList || this.alertRuleList.length === 0) {
  //     this.alertRuleservice.getAllAlertsByOrgId(this.orgId)
  //       .subscribe(response => {
  //         // // // console.log('response ', response);
  //         this.alertRuleList = response;
  //       });
  //   }
  // }

  onLockClick() {
    if (this.pageType.toLowerCase() === 'view') {
      this.route.navigate([`org/edit`]);
    } else {
      this.route.navigate([`org/view`]);
    }
  }

  onTemplateTabClick() {
    this.goToTab('asset-template');
    if (!this.templateList || this.templateList.length === 0) {
      this.assetService.getAllTemplates()
        .subscribe(response => {
          // // // console.log('response of templates ', response);
          this.templateList = response;
        });
    }
  }

  getDashboardsTemplates() {
    this.dashboardTemplates = [
      {
        id: '1',
        templateName: 'Standard Organization Dashboard'
      },
      {
        id: '2',
        templateName: 'Standard Location Dashboard'
      },
      {
        id: '3',
        templateName: 'Standard Asset Dashboard'
      }
    ];
  }

  getDashboards() {
    // service to get all dashboards by userid
    this.userdashboardData = [
      {
        id: '1',
        templateName: 'Standard Organization Dashboard',
        dashboardName: 'Organization Dashboard',
        dashboardHTML: ''
      },
      {
        id: '2',
        templateName: 'Standard Location Dashboard',
        dashboardName: 'Location Dashboard',
        dashboardHTML: ''
      },
      {
        id: '3',
        templateName: 'Standard Asset Dashboard',
        dashboardName: 'Asset Dashboard',
        dashboardHTML: ''
      }
    ];
    return this.userdashboardData;
  }

  async getDashboardHTML(formName: string, index) {
    // // // console.log(formName, '--getDashboardHTML functiona called');

    // await this.organizationService.getDashboardHTML(formName)
    //   .subscribe(response => {
    //     // // // console.log('return response---', response);
    //     this.userdashboardData[index].dashboardHTML = this.sanitizer.bypassSecurityTrustHtml(response);
    //     setTimeout(() => {
    //       // setData('Hello');
    //       let configData = $("#dashboard_config_btncreate").click(setDashboardConfiguration);
    //       this.afterLoaded();
    //     }, 300);
    //   });
  }

  setExternalScript(src) {
    return new Promise((resolve, reject) => {
      const scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.src = src;
      scriptTag.onload = () => resolve();
      document.getElementById('config_dashboard').appendChild(scriptTag); // document.body
    });
  }

  async afterLoaded() {
    const scripts = ['assets/dashboards/lineChartLive.js'];
    for (let i = 0; i < scripts.length; i++) {
      await this.setExternalScript(scripts[i]);
    }
  }

  openAddDashboardModal(dashboardAct: string, dashboardItem: DashBoard) {
    // this.dashBoardDataByID = getDashboardById(dashboardId)
    // // console.log(dashboardLongName);
    if (dashboardAct === 'editDashboard') {
      this.dashboardDataById = {
        act: 'edit',
        title: 'Edit Dashboard',
        dashboardName: '',
        dashboardHTML: ''
      };
      this.dashboardTab = dashboardItem;
      // this.dbLongName = dashboardLongName;
      // this.dbShortName = dashboardSortName;
      // this.selTemplate = this.dbTemplates[0].name;
    } else if (dashboardAct === 'addDashboard') {
      this.dashboardDataById = {
        act: 'create',
        title: 'Create Dashboard',
        dashboardName: '',
        dashboardHTML: ''
      };
      this.dbLongName = '';
      this.dbShortName = '';
    }
    // // console.log('dashboardDataById---', this.dashboardDataById);
    // Get the modal
    this.addDashboardModal.open();
  }

  onDashboardFormSubmit(event) {
    console.log(event);
    const dashboardObj = event;
    if (!this.dashboardTabs) {
      this.dashboardTabs = [];
    }

    dashboardObj.organizationId = this.orgId;
    dashboardObj.published = true;
    dashboardObj.active = true;

    this.dbLastIdNum++;
    this.newTabId = "dbtab-" + this.dbLastIdNum;

    if (this.dashboardTab.dashboardId) {
      this.dbService.editDashboard(dashboardObj)
        .subscribe(response => {
          this.getAllDashboards(true);
          // this.activeTab = this.dashboardTab.dashboardId;
          // this.goToTab(this.activeTab);
          // let index = this.dashboardTabs.findIndex(x => x.dashboardId === this.dashboardTab.dashboardId);
          // this.dashboardTabs[index] = this.dashboardTab;
          this.dashboardTab = new DashBoard();
          this.toaster.onSuccess('Successfully Updated Dashboard', 'Updated');
        });
    } else {
      this.dbService.saveDashboard(dashboardObj)
        .subscribe(response => {
          // this.dashboardTabs.push(this.dashboardTab);
          this.getAllDashboards(true);
          this.dashboardTab = new DashBoard();
          this.toaster.onSuccess('Successfully Created Dashboard', 'Created');
        });
    }
    this.closeAddDashboardModal(true);
  }

  closeAddDashboardModal(event: any) {
    // // console.log('==', event);
    this.ngbModal.dismissAll();
    this.dashboardTab = new DashBoard();
    // if (event === 'save') {
    //
    // } else if (event === 'create') {
    //
    // }
  }

  openDashboardConfirmDialog(dashboardId, dashboardName) {
    this.deleteDashboardId = dashboardId;
    this.deletedDashboardName = dashboardName;
    // this.dashboardData = this.dashboardTab.dashboardId;
    this.message = `Do you want to delete the "${dashboardName}" Dashboard?`;
    this.confirmBoxDash.open();
  }

  deleteOrganizationDashboardById(event) {
    // // console.log('deleteOrganizationDashboardById===', event);
    if (event) {
      //   // delete dashboard service goes here
      this.dbService.deleteDashboard(this.deleteDashboardId)
        .subscribe(response => {
          this.toaster.onSuccess(`You have deleted ${this.deletedDashboardName} successfully`, 'Delete Success!');
          this.getAllDashboards(true);
        }, error => {
          this.toaster.onFailure('Something went wrong on server. Please try after sometiime.', 'Delete Fail!');
        });
    }
  }

  getDashboardById(dashboardId: any) {
    this.dashboardData = this.getDashboards();
  }

  onLocaleChange() {
    let localeName;
    if (this.applicationConfiguration && this.applicationConfiguration.locale && this.applicationConfiguration.locale.length > 0) {
      this.applicationConfiguration.locale.forEach(locale => {
        if (locale.localeId === this.organization.localeId) {
          localeName = locale.localeName;
        }
      });
      if (localeName) {
        this.placeholder = VotmCommon.dateFormat = moment.localeData(localeName).longDateFormat('L');
        VotmCommon.timeFormat = moment.localeData(localeName).longDateFormat('LTS');
        // // console.log('VotmCommon.timeFormat ', VotmCommon.timeFormat);

        let obj1: NgbDateMomentParserFormatter = new NgbDateMomentParserFormatter();
        let updatedStartDate = obj1.format(this.tempContractStartDate);
        let updatedEndDate = obj1.format(this.tempContractEndDate);
        this.tempContractStartDate = null;
        this.tempContractEndDate = null;
        this.tempContractStartDate = obj1.parse(updatedStartDate);
        this.tempContractEndDate = obj1.parse(updatedEndDate);
        if (this.organization.modifiedOn) {
          this.modifiedDate = moment(this.organization.modifiedOn).format(VotmCommon.dateFormat) + ' ' + moment(this.organization.modifiedOn).format(VotmCommon.timeFormat);
          // // console.log('temp time ', moment(this.organization.modifiedOn).format(VotmCommon.timeFormat));
        }
      }
    }
  }
}

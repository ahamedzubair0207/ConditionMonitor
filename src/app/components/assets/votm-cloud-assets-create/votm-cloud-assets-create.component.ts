import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AssetsService } from 'src/app/services/assets/assets.service';
import { Asset } from 'src/app/models/asset.model';
import { ConfigSettingsService } from 'src/app/services/configSettings/configSettings.service';
import { ApplicationConfiguration } from 'src/app/models/applicationconfig.model';
import { Logo, VOTMFile } from 'src/app/models/logo.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DatePipe, Location as RouterLocation } from '@angular/common';
import { NgForm, FormGroup } from '@angular/forms';
import { VotmCloudConfimDialogComponent } from '../../shared/votm-cloud-confim-dialog/votm-cloud-confim-dialog.component';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Toaster } from '../../shared/votm-cloud-toaster/votm-cloud-toaster';
import { OrganizationService } from 'src/app/services/organizations/organization.service';
import { SortArrays } from '../../shared/votm-sort';
import { LocationService } from 'src/app/services/locations/location.service';
import { VotmCommon } from '../../shared/votm-common';
// Dashboard-david start
import { DashboardService } from '../../../services/dasboards/dashboard.service';
import { DbTplItem } from 'src/app/models/db-tpl-item';
import { DbItem } from 'src/app/models/db-item';
import { DashBoard } from 'src/app/models/dashboard.model';
import { VotmcloudDashboardCreateComponent } from '../../shared/votmcloud-dashboard-create/votmcloud-dashboard-create.component';
// Dashboard-david end
declare var $: any;
@Component({
  selector: 'app-votm-cloud-assets-create',
  templateUrl: './votm-cloud-assets-create.component.html',
  styleUrls: ['./votm-cloud-assets-create.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None
})
export class VotmCloudAssetsCreateComponent implements OnInit, OnDestroy {
  public imagePath;
  imgURL: any = '../../../../assets/images/assetPlaceholder.svg';
  locationImageURL: any = '../../../../assets/images/default-image-svg.svg';
  parentAssetImageURL: any;
  parentAssetImageSize: { width: number, height: number };
  public message: string;
  closeResult: string;
  modal: any;
  pageLabels: any;
  assetTypes: Array<any>;
  parentOrganizationInfo: any;
  parentLocationInfo: any;
  parentAssetInfo: any;

  pageTitle: string;
  pageType: any;

  deleteDashboardId: any;
  assetId: string;
  parentAssetId: string;
  locId: string;
  parentLocId: string;
  asset: Asset = new Asset();
  applicationConfiguration: ApplicationConfiguration = new ApplicationConfiguration();
  curOrgId: string;
  curOrgName: string;
  previousURLToNavigate: string;
  previousUrl: any;
  subscriptions: any;
  isSaveTemplateDisabled: boolean;
  isSignalAssociationClicked = false;
  @ViewChild('assetForm', null) assetForm: NgForm;
  @ViewChild('confirmBox', null) confirmBox: VotmCloudConfimDialogComponent;
  @ViewChild('confirmBoxDash', null) confirmBoxDash: VotmCloudConfimDialogComponent;
  @ViewChild('templateConfirmBox', null) templateConfirmBox: VotmCloudConfimDialogComponent;
  @ViewChild('imageChangeConfirmBox', null) imageChangeConfirmBox: VotmCloudConfimDialogComponent;
  @ViewChild('documentChangeConfirmBox', null) documentChangeConfirmBox: VotmCloudConfimDialogComponent;
  @ViewChild('file', null) locationImage: ElementRef;
  @ViewChild('addDashboardModal', null) addDashboardModal: VotmcloudDashboardCreateComponent;
  @ViewChild('fileInput', null) docFileInput: ElementRef;
  parentLocName: string;
  parentAssetName: string;
  fileName: any;
  fileExtension: string;
  fileExtensionDoc: string;
  toaster: Toaster = new Toaster(this.toastr);
  resultABCD: Blob;
  templateId: any;
  templates: { value: string; text: string; }[];
  previousAsset: any;
  acceptedTemplateChages: boolean = false;
  previousTemplateName: any;
  isTemplateSelected: boolean;
  assetToDelete: any;
  assetNameToDelete: any;
  templateWarningMessage: string;
  isConfirmToChangeImage: any;
  clickedCheckBox: number = 0;
  count: number = 0;
  abc: any;
  docFile: Blob;
  allTemplates: any[] = [];
  templateNameToSave: string;
  organizationList: any[] = [];
  parentAssetsList: any[] = [];
  locationList: any[] = [];
  locationListForDropDown: any[] = [];
  parentAssetListForDropDown: any[];
  assetImageCoordinates: any = {
    x: 0,
    y: 0
  };
  assetRemoveMessage: string;
  isChildAssetAssociation = false;
  imgSize: { width: number, height: number };
  @ViewChild('assetPosititonImage', { static: false }) elAssetPositionImg: ElementRef;
  imgOffsetLeft = null;
  imgOffsetTop = null;
  imgParentWidth = null;
  imgParentHeight = null;
  imgSourceHeight = null;
  imgSourceWidth = null;
  imgOffsetWidth = null;
  imgOffsetHeight = null;

  // Dashboard-david start
  dbTemplates: DbTplItem[];
  dbItems: DbItem[] = [];
  selTemplate: string;
  dbLongName: string = '';
  dbShortName: string = '';
  dbLastIdNum: number = 0;
  newTabId: string = '';
  activeTab: string;
  dashboardTabs: Array<DashBoard> = [];
  dashboardTab: DashBoard = new DashBoard();
  dashboardData: any;
  dashboardTemplates: {};
  addDashboardArray: any;
  userdashboardData: { id: string; templateName: string; dashboardName: string; dashboardHTML: any; }[];
  dashboardDataById: { act: string; title: string; dashboardName: string; dashboardHTML: string; };
  grabOffset: any = null;
  loader: boolean;
  assetLoader: boolean;
  orgLoader: boolean;
  locationLoader: boolean;
  screenLabelsLoader: boolean;
  appInfoLoader: boolean;
  disableParentOrgaAndLoc: boolean;
  locked: boolean = true;
  // Dashboard-david end
  templateDocuments: any[] = [];
  deletedDashboardName: any;

  constructor(
    private ngbModal: NgbModal,
    private assetService: AssetsService,
    private configSettingsService: ConfigSettingsService,
    private domSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private datePipe: DatePipe,
    private routerLocation: RouterLocation,
    private toastr: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private locService: LocationService,
    private orgService: OrganizationService,
    private dbService: DashboardService, // Dashboard-david
  ) {
    this.subscriptions = route.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.previousUrl) {
          this.previousURLToNavigate = JSON.parse(JSON.stringify(this.previousUrl));
        }
        this.previousUrl = event.url;
      }
    });

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

    // this.activatedRoute.paramMap.subscribe(params => {
    //   this.asset.organizationId = this.curOrgId = params.get("parentOrgId");
    //   this.asset.organizationName = this.curOrgName = params.get("parentOrgName");
    //   this.asset.locationId = this.parentLocId = params.get("parentLocId");
    //   this.asset.locationName = this.parentLocName = params.get("parentLocName");
    //   this.asset.parentAssetId = this.parentAssetId = params.get("parentAssetId");
    //   this.asset.parentAssetName = this.parentAssetName = params.get("parentAssetName");
    //   this.assetId = params.get('assetId');
    //   $('.nav-tabs a[href="#asset-details"]').tab('show');
    //   this.onClickOfNavTab('asset-details');
    //   if (this.assetId) {
    //     this.getAssetById();
    //   }
    // });
    this.pageType = this.activatedRoute.snapshot.data['type'];
    this.pageTitle = `${this.pageType} Asset`;
    this.activatedRoute.fragment.subscribe(
      (fragment) => {
        if (fragment && fragment === 'subasset' && this.activatedRoute.snapshot.data['type'] === 'Create') {
          this.disableParentOrgaAndLoc = true;
        } else {
          this.disableParentOrgaAndLoc = false;
        }

      }
    );
    this.templateWarningMessage = 'This is message';
    // this.getAllAssets();
    // this.getAllOrganization();
    // this.getAllLocations();
    // this.getScreenLabels();
    // this.getAllAppInfo();
    // this.getAllDashboards();
    // dashboard data
    this.dashboardData = this.getDashboards();
    this.getDashboardsTemplates();
    // this.asset.active = true;
    this.assetTypes = [{ value: 'assetType1', text: 'assetType1' }, { value: 'assetType2', text: 'assetType2' }]
  }
  selAssetIcon = "robot";

  getDashboards() {
    // service to get all dashboards by userid
    this.userdashboardData = [
      // {
      //   id: '1',
      //   templateName: 'Standard Organization Dashboard',
      //   dashboardName: 'Organization Dashboard',
      //   dashboardHTML: ''
      // },
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
  getDashboardsTemplates() {
    this.dashboardTemplates = [
      // {
      //   id: '1',
      //   templateName: 'Standard Organization Dashboard'
      // },
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
  async getDashboardHTML(formName: string, index) {
    // console.log(formName, '--getDashboardHTML functiona called');

    // await this.organizationService.getDashboardHTML(formName)
    //   .subscribe(response => {
    //     // console.log('return response---', response);
    //     this.userdashboardData[index].dashboardHTML = this.sanitizer.bypassSecurityTrustHtml(response);
    //     setTimeout(() => {
    //       // setData('Hello');
    //     }, 300);
    //   });
  }

  getAssetById() {
    this.loader = true;
    this.assetService.getAssetById(this.assetId)
      .subscribe(response => {
        this.asset = response;
        if (this.asset) {
          this.asset.organizationName = this.curOrgName;
          this.asset.locationName = this.parentLocName;
          // console.log(this.asset);
          if (this.asset.parentAssetId) {
            this.getParentAssetById(this.asset.parentAssetId);
            this.parentAssetImageURL = '../../../../assets/images/assetPlaceholder.svg';
          } else {
            this.getLocationById(this.asset.locationId);
            this.parentAssetImageURL = '../../../../assets/images/default-image-svg.svg';
          }
          this.asset.parentAssetName = this.parentAssetName;
          if (this.asset.logo && this.asset.logo.imageName) {
            this.fileExtension = this.asset.logo.imageName.slice((Math.max(0, this.asset.logo.imageName.lastIndexOf('.')) || Infinity) + 1);
            // For svg type files use svg+xml as extention
            if (this.fileExtension === 'svg') {
              this.fileExtension = 'svg+xml';
            }
            const base64Img = `data:image/${this.fileExtension};base64,${this.asset.logo.image}`;
            this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(base64Img);
            const img = new Image();
            img.src = base64Img;
            img.onload = () => {
              this.imgSize = {
                width: img.width,
                height: img.height
              };
            };
            this.asset.logo.imageType = this.fileExtension;
          }

          this.templateDocuments = this.asset.fileStore;

        }

        this.loader = false;
      });
  }

  getParentAssetById(parentAssetId) {
    this.assetService.getAssetById(parentAssetId)
      .subscribe(response => {
        if (response.logo && response.logo.imageName) {
          let fileExtension = response.logo.imageName.slice((Math.max(0, response.logo.imageName.lastIndexOf('.')) || Infinity) + 1);
          // For svg type files use svg+xml as extention
          if (fileExtension === 'svg') {
            fileExtension = 'svg+xml';
          }
          const base64Img = `data:image/${fileExtension};base64,${response.logo.image}`;
          this.parentAssetImageURL = this.domSanitizer.bypassSecurityTrustUrl(base64Img);
        }
      }
      );
  }

  getLocationById(locationId) {
    this.locService.getLocationById(locationId)
      .subscribe(response => {
        if (response && response.logo && response.logo.imageName) {
          let fileExtension = response.logo.imageName.slice((Math.max(0, response.logo.imageName.lastIndexOf(".")) || Infinity) + 1);
          // For svg type files use svg+xml as extention
          if (fileExtension === 'svg') {
            fileExtension = 'svg+xml';
          }
          const base64Img = `data:image/${fileExtension};base64,${response.logo.image}`;
          this.parentAssetImageURL = this.domSanitizer.bypassSecurityTrustUrl(base64Img);
        }
      }
      );
  }

  onStart(event: any) {
    // console.log('on start');
    this.grabOffset = { x: event.offsetX, y: event.offsetY };
  }

  onDrop(event: any) {
    const pos = {
      left: event.event.offsetX - this.grabOffset.x + 16,
      top: event.event.offsetY - this.grabOffset.y + 16
    };
    this.asset.imageCoordinates = {};
    this.asset.imageCoordinates[this.asset.assetId] = {
      x: (pos.left / event.event.srcElement.offsetWidth).toFixed(5),
      y: (pos.top / event.event.srcElement.offsetHeight).toFixed(5)
    };
    // console.log(this.asset.imageCoordinates);
  }

  createNestedAsset(event) {
    this.route.navigate([`asset/create/${this.asset.organizationId}/${this.asset.organizationName}/${this.asset.locationId}/${this.asset.locationName}/${this.asset.assetId}/${this.asset.assetName}`])

  }

  assetObject() {

  }

  // getScreenLabels() {
  //   this.screenLabelsLoader = true;
  //   this.configSettingsService.getCreateLocScreenLabels()
  //     .subscribe(response => {
  //       this.pageLabels = response;
  //       this.screenLabelsLoader = false;
  //     });
  // }

  getAllAppInfo() {
    this.appInfoLoader = true;
    this.configSettingsService.getApplicationInfo()
      .subscribe((response: any) => {
        this.applicationConfiguration = response;
        this.appInfoLoader = false;
      });
  }

  onFileChange(file) {
    if (file) {
      var binaryData = [];
      binaryData.push(file);

      this.docFile = new Blob(binaryData, { type: file.type });

      this.handleDocSelect(file);
      // let readerToPreview = new FileReader();
      // // this.imagePath = file;
      // readerToPreview.readAsDataURL(file);
      // // readerToPreview.onload = (_event) => {
      // //   this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(readerToPreview.result.toString()); //readerToPreview.result;
      // // }
    }
  }

  onFileOpen() {
    const fileURL = URL.createObjectURL(this.docFile);
    window.open(fileURL, '_blank');
  }

  onImageChangeClick() {
    if (this.acceptedTemplateChages) {
      this.templateWarningMessage = 'Image is inherited from the asset template, changing the value for this field breaks the binding to the asset template.  Do you want to continue?'
      this.imageChangeConfirmBox.open();
    } else {
      this.preview(this.locationImage.nativeElement.files[0]);
    }
  }

  onDocChangeClick() {
    if (this.acceptedTemplateChages) {
      this.templateWarningMessage = 'Documentation is inherited from the asset template, changing the value for this field breaks the binding to the asset template.  Do you want to continue?'
      this.documentChangeConfirmBox.open();
    } else {
      this.onFileChange(this.docFileInput.nativeElement.files[0]);
    }
  }

  changeImage(event) {
    if (event) {
      this.preview(this.locationImage.nativeElement.files[0]);
    }
    this.removeTemplate(event);
  }

  changeDocumentation(event) {
    if (event) {
      this.onFileChange(this.docFileInput.nativeElement.files[0]);
    }
    this.removeTemplate(event);
  }

  shouldLoadImage(files) {
    if (this.isConfirmToChangeImage) {

      if (this.isConfirmToChangeImage === 'change') {
        this.preview(files);
      }
      this.isConfirmToChangeImage = null;
    } else {
      setTimeout(() => {
        this.shouldLoadImage(files);
      });
    }
  }

  shouldLoadDocument(event) {
    // // console.log('shouldLoadDocument', this.isConfirmToChangeImage);
    // if (this.asset.templateId) {
    //   if (this.isConfirmToChangeImage) {
    //     // console.log('shouldLoadDocument AHAmed', this.isConfirmToChangeImage);
    //     if (this.isConfirmToChangeImage === 'change') {
    //       // console.log('Should Load ', this.isConfirmToChangeImage)
    //       this.onFileChange(event);
    //     }
    //     this.isConfirmToChangeImage = null;
    //   } else {
    //     setTimeout(() => {
    //       this.shouldLoadDocument(event);
    //     });
    //   }
    // }
  }

  preview(file) {
    this.message = '';
    if (!file) {
      return;
    }

    var mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.';
      return;
    }
    this.handleFileSelect(file);
    var readerToPreview = new FileReader();
    this.imagePath = file;
    readerToPreview.readAsDataURL(file);
    readerToPreview.onload = (_event) => {
      this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(readerToPreview.result.toString()); //readerToPreview.result;
      const img = new Image();
      img.src = readerToPreview.result.toString();
      img.onload = () => {
        // console.log(img.width, '=====', img.height);
        this.imgSize = {
          width: img.width,
          height: img.height
        };
      };
    };
  }

  handleFileSelect(file) {
    if (file) {
      var reader: any = new FileReader();
      // reader.onload = this._handleReaderLoaded.bind(this);
      reader.onload = (e) => {
        // ADDED CODE
        let data;
        if (!e) {
          data = reader.content;
        } else {
          data = e.target.result;
        }
        const base64textString = btoa(data);
        // // console.log('this.organization ', this.location, data)
        this.asset.logo.image = base64textString;
      };

      this.asset.logo = new Logo();
      this.asset.logo.imageName = file.name;
      this.asset.logo.imageType = file.type;
      reader.readAsBinaryString(file);
    }
  }

  handleDocSelect(file) {
    if (file) {
      var reader: any = new FileReader();
      // reader.onload = this._handleReaderLoaded.bind(this);
      // this.asset.fileStore = new VOTMFile();
      // this.asset.fileStore = [];
      const temp: any = {};
      reader.onload = (e) => {
        // ADDED CODE
        let data;
        if (!e) {
          data = reader.content;
        }
        else {
          data = e.target.result;
        }
        const base64textString = btoa(data);
        // // console.log('this.organization ', this.location, data)
        // this.asset.fileStore.file = base64textString;
        // this.asset.fileStore.fileName = file.name;
        // this.asset.fileStore.fileType = file.type;
        const tempFileStoreId = this.templateDocuments.length + 1;
        temp.fileStoreId = ''; // for patch api
        temp.file = base64textString;
        temp.fileName = file.name;
        temp.fileType = file.type;
        temp.tempFileStoreId = tempFileStoreId;
        // hack to load datatable if it is empty
        // As Initial it takes blank memory reference
        const templateDocumentsList = [...this.templateDocuments];
        templateDocumentsList.push(temp);
        this.templateDocuments = [...templateDocumentsList];
        // console.log('this.templateDocuments==', this.templateDocuments);

      };
      // debugger;
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    let base64textString;
    var binaryString = readerEvt.target.result;


    // SVG Code
    // let parser = new DOMParser();
    // let xmlDoc: XMLDocument = parser.parseFromString(binaryString.toString(), 'image/svg+xml');
    // // // console.log('XMLDocument ', xmlDoc, xmlDoc.getElementsByTagName('svg'))
    // const xml = (new XMLSerializer()).serializeToString(xmlDoc);
    // const svg64 = btoa(xml);
    // const b64Start = 'data:image/svg+xml;base64,';
    // const image64 = b64Start + svg64;
    // this.location.logo.image = image64;
    // // // console.log('this.location.logo.image ', this.location.logo.image)

    // Other Images
    base64textString = btoa(binaryString);
    this.asset.logo.image = base64textString;

  }
  //Delete Modal
  open(content) {

    this.ngbModal.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {

      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    // debugger;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  openmodal() {
    this.getAllTemplates();
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
    }

  }

  getAllTemplates() {
    if (!this.templates || this.templates.length === 0) {
      this.templates = [];
      this.assetService.getAllTemplatesIdAndName()
        .subscribe(response => {
          this.allTemplates = response;
          if (response && response.length > 0) {
            response.forEach(template => {
              this.templates.push({ text: template.templateName, value: template.templateId });
            });
          }
        })
    }
  }


  openTemplateModal() {
    if (!this.templateNameToSave) {
      this.templateNameToSave = this.asset.assetType;
    }
    if (!this.organizationList || this.organizationList.length === 0) {
      this.orgService.getOrganizations()
        .subscribe(response => {
          this.organizationList = response;
        });
    }
    // Get the modal
    var modal = document.getElementById('templateSave');
    modal.style.display = 'block';
    this.modal = document.getElementById('templateSave');
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('close')[0];

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';

      }
    }

  }

  closemodal(event: string) {
    this.modal.style.display = 'none';
    if (event === 'save') {
      this.fillDataFromTemplate(event);
    }
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
  }

  onTemplateChangeAccept(event) {
    if (this.acceptedTemplateChages) {
      if (window.confirm('This will break the binding to the asset template. Do you want to continue?')) {
        this.acceptedTemplateChages = !this.acceptedTemplateChages;
        this.removeTemplate(true);
      } else {
        event.preventDefault();
        this.removeTemplate(false);
      }
    } else {
      this.removeTemplate(false);
    }
    // // console.log(event, this.acceptedTemplateChages)
    // if (!event) {
    //   setTimeout(() => {
    //     this.templateWarningMessage = 'This change will remove the template binding';
    //     this.templateConfirmBox.open();
    //   }, 100);
    //   this.changeDetectorRef.detectChanges();

    // }
  }

  getAllAssets() {
    this.assetLoader = true;
    this.assetService.getAllAssets()
      .subscribe(response => {
        this.parentAssetsList = response;
        this.parentAssetsList.sort(SortArrays.compareValues('assetName'));
        this.filterAssets();
        this.assetLoader = false;
      });
  }

  getAllOrganization() {
    if (!this.organizationList || this.organizationList.length === 0) {
      this.orgLoader = true;
      this.orgService.getAllOrganizationsList()
        .subscribe(orgList => {
          this.organizationList = orgList;
          let orgFound = false;
          this.organizationList.forEach(org => {
            if (org.organizationId === this.curOrgId) {
              orgFound = true;
            }
          });
          if (!orgFound) {
            this.organizationList.push({ organizationId: this.curOrgId, name: this.curOrgName });
          }
          this.organizationList.sort(SortArrays.compareValues('name'));
          this.filterLocations();
          this.filterAssets();
          this.orgLoader = false;
        });
    }
  }

  onParentOrgChange(event) {
    this.asset.locationId = null;
    this.asset.locationName = null;
    this.asset.parentAssetId = null;
    this.asset.parentAssetName = null;
    this.locationImage = null;
    this.filterLocations();
    this.filterAssets();
  }

  filterLocations() {
    if (this.locationList && this.locationList.length > 0) {
      this.locationListForDropDown = [];
      this.locationList.forEach(loc => {
        if (this.asset.organizationId === loc.organizationId) {
          this.locationListForDropDown.push(loc);
          if (this.asset.locationId === loc.locationId) {
            this.getParentImage(loc.logo, 'location')
          }
        }
      });
      if (this.locationListForDropDown && this.locationListForDropDown.length > 0) {
        this.locationListForDropDown.sort(SortArrays.compareValues('locationName'));
      }
    }
  }

  onParentAssetChange(parentassetId) {
    this.parentAssetListForDropDown.forEach(asset => {
      if (parentassetId === asset.assetId) {
        this.getParentImage(asset.logo, 'asset');

      }
    });
  }

  onLocationChange(locationId: string) {
    this.filterAssets();
    this.asset.parentAssetId = null;
    this.locationList.forEach(loc => {
      if (locationId === loc.locationId) {
        this.getParentImage(loc.logo, 'location')
      }
    });
  }

  // getExactImage() {
  //   if (!this.parentAssetImageURL) {
  //     this.parentAssetImageURL = this.locationImageURL;

  //   }

  // }

  getParentImage(logo: any, type) {
    // if (logo && logo.imageName) {
    //   let tempFileExtension = logo.imageName.slice((Math.max(0, logo.imageName.lastIndexOf(".")) || Infinity) + 1);
    // // For svg type files use svg+xml as extention
    // if (tempFileExtension === 'svg') {
    //   tempFileExtension = 'svg+xml';
    // }
    //   const base64Img = `data:image/${tempFileExtension};base64,${logo.image}`;
    //   const img = new Image();
    //   img.src = base64Img;
    //   img.onload = () => {
    //     // console.log(img.width, '=====', img.height);
    //     this.parentAssetImageSize = {
    //       width: img.width,
    //       height: img.height
    //     };
    //   };
    //   type === 'location' ? this.locationImageURL = this.domSanitizer.bypassSecurityTrustUrl(base64Img)
    //     : this.parentAssetImageURL = this.domSanitizer.bypassSecurityTrustUrl(base64Img);
    //   // this.asset.logo.imageType = this.fileExtension;
    // } else {
    //   type === 'location' ? this.locationImageURL = null : this.parentAssetImageURL = null;
    // }

    // this.getExactImage();
  }

  filterAssets() {
    if (this.parentAssetsList && this.parentAssetsList.length > 0) {
      this.parentAssetListForDropDown = [];
      this.parentAssetsList.forEach(asset => {
        if (this.asset.locationId === asset.locationId && this.asset.assetId !== asset.assetId
          && this.asset.assetId !== asset.parentAssetId
          && !this.isChildNode(this.asset, asset)) {
          this.parentAssetListForDropDown.push(asset);
          if (this.asset.parentAssetId === asset.assetId) {
            this.getParentImage(asset.logo, 'asset');
          }
        }
      });
      if (this.parentAssetListForDropDown && this.parentAssetListForDropDown.length > 0) {
        this.parentAssetListForDropDown.sort(SortArrays.compareValues('assetName'));
      }
    }
  }

  isChildNode(tobeCheckedAsset, tempAsset): boolean {
    // // console.log('isChildNode ', tobeCheckedAsset, tempAsset);
    let found: boolean = false;
    let isChild: boolean = false;
    this.parentAssetsList.forEach(asset => {
      if (!found) {
        if (tempAsset.parentAssetId) {
          if (tempAsset.parentAssetId === asset.assetId) {
            if (asset.parentAssetId) {
              if (tobeCheckedAsset.assetId === asset.parentAssetId) {
                isChild = true;
                found = true;
              } else {
                isChild = this.isChildNode(tobeCheckedAsset, asset);
                found = true;
              }
            } else {
              isChild = false;
              found = true;
            }
          }
        } else {
          isChild = false;
          found = true;
        }
      }
    });
    return isChild;
  }

  getAllLocations() {
    this.locationLoader = true;
    this.locService.getAllLocations()
      .subscribe(locList => {
        this.locationList = locList;
        this.filterLocations();
        this.locationLoader = false;
        // this.locationList.push({ organizationId: this.asset.organizationId, name: this.asset.organizationName });
        // this.locationList.sort(SortArrays.compareValues('name'));
      });
  }

  // onParentAssetChange(event) {

  // }

  fillDataFromTemplate(name: string) {
    this.isTemplateSelected = true;
    this.assetForm.resetForm();
    setTimeout(() => {
      this.imgURL = null;
      this.imgSize = undefined;
      this.imagePath = null;
      if (this.locationImage && this.locationImage.nativeElement) {
        this.locationImage.nativeElement.value = '';
      }
      if (this.docFileInput && this.docFileInput.nativeElement) {
        this.docFileInput.nativeElement.value = '';
      }
      this.getAssetFromTemplate();
    });

  }

  getAssetFromTemplate() {
    let selectedTemplate: Asset;


    this.assetService.getTemplateById(this.templateId)
      .subscribe(response => {
        selectedTemplate = response[0];
        this.asset = {
          assetId: null,
          assetName: selectedTemplate.assetName,
          assetNumber: selectedTemplate.assetNumber,
          assetType: selectedTemplate.assetType,
          description: selectedTemplate.description,
          shortName: '',
          // documentationUrl: selectedTemplate.documentationUrl,
          fileStore: selectedTemplate.fileStore,
          locationId: this.parentLocId,
          locationName: this.parentLocName,
          organizationId: this.curOrgId,
          logo: selectedTemplate.logo,
          organizationName: this.curOrgName,
          parentAssetId: this.parentAssetId,
          parentAssetName: this.parentAssetName,
          parentLocationId: this.parentLocId,
          parentLocationName: this.parentLocName,
          templateId: selectedTemplate.templateId,
          templateName: selectedTemplate.templateName
        };
        if (selectedTemplate.logo && selectedTemplate.logo.imageName) {
          this.fileExtension = selectedTemplate.logo.imageName.slice((Math.max(0, selectedTemplate.logo.imageName.lastIndexOf(".")) || Infinity) + 1);
          // For svg type files use svg+xml as extention
          if (this.fileExtension === 'svg') {
            this.fileExtension = 'svg+xml';
          }
          const base64Img = `data:image/${this.fileExtension};base64,${selectedTemplate.logo.image}`;
          this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(base64Img);
          const img = new Image();
          img.src = base64Img;
          img.onload = () => {
            // console.log(img.width, '=====', img.height);
            this.imgSize = {
              width: img.width,
              height: img.height
            };
          };
          selectedTemplate.logo.imageType = this.fileExtension;
        }

        if (selectedTemplate.fileStore && selectedTemplate.fileStore.length > 0) {
          // Get template documents and add temporary index to remove from dom & array (on delete icon)
          selectedTemplate.fileStore.forEach((templateDocument, index) => {
            this.templateDocuments[index] = templateDocument;
            this.templateDocuments[index].tempFileStoreId = index + 1;
          });
          // console.log('this.templateDocuments==', this.templateDocuments);
        }

        // Please Don't Touch the below code

        // if (selectedTemplate.fileStore && selectedTemplate.fileStore.fileName) {
        //   let docExtension = selectedTemplate.fileStore.fileName.slice((Math.max(0, selectedTemplate.fileStore.fileName.lastIndexOf(".")) || Infinity) + 1);
        //   // console.log('docExtension ', docExtension);
        //   selectedTemplate.fileStore.fileName = selectedTemplate.fileStore.fileName + '.xlsx';
        //   this.fileExtensionDoc = selectedTemplate.fileStore.fileName.slice((Math.max(0, selectedTemplate.fileStore.fileName.lastIndexOf(".")) || Infinity) + 1);
        //   // let abcd = this.domSanitizer.bypassSecurityTrustUrl(`data:image/xlsx;base64,${selectedTemplate.fileStore.file}`);


        //   // Temp
        //   const url = `data:image/xlsx;base64,${selectedTemplate.fileStore.file}`;
        //   fetch(url)
        //     .then(res => res.blob())
        //     .then(blob => {
        //       let abcd = new File([blob], "File name");
        //       var binaryData = [];
        //       binaryData.push(abcd);
        //       this.docFile = new Blob(binaryData, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        //       this.asset.fileStore.fileType = this.fileExtensionDoc;
        //     });


        //   // this.docFileInput.nativeElement = abcd;
        // }
        // this.previousAsset = JSON.parse(JSON.stringify(this.asset));
        // this.acceptedTemplateChages = true;

      });


    // this.allTemplates.forEach(template => {
    //   if (template.templateId === this.templateId) {
    //     selectedTemplate = template;
    //   }
    // })

  }

  onDocSelcetion(event) {
    this.asset.fileStore = { fileType: event.files[0].type, file: event.files[0], fileName: event.files[0].name };
  }

  onAssetSubmit() {
    // this.asset.documentationUrl = 'ABDFE';

    if (this.asset) {
      if (!this.asset.logo) {
        this.asset.logo = null;
      }
      if (!this.asset.fileStore) {
        this.asset.fileStore = null;
      }

      // console.log('1000 onAssetSubmit this.templateDocuments=====', this.templateDocuments);
      // Multiple file upport
      if (this.templateDocuments) {
        this.asset.fileStore = this.templateDocuments;

        // console.log('this.asset=====', this.asset);
        // return;
      }

      if (!this.asset.imageCoordinates) {
        this.asset.imageCoordinates = {};
        this.asset.imageCoordinates[this.asset.assetName] = {
          x: 0,
          y: 0
        };
      }
    }

    if (this.assetForm && this.assetForm.invalid) {
      this.toaster.onFailure('Please fill the form correctly.', 'Form is invalid!')
      Object.keys(this.assetForm.form.controls).forEach(element => {
        this.assetForm.form.controls[element].markAsDirty();
      });
    } else {
      if (!this.acceptedTemplateChages) {
        this.asset.templateId = null;
        this.asset.templateName = null;
      }
      if (this.assetId) {
        this.assetService.updateAsset(this.asset)
          .subscribe(response => {
            this.toaster.onSuccess('Successfully updated', 'Updated');
            this.routerLocation.back();
          }, error => {
            let msg = 'Something went wrong. Please fill the form correctly';
            if (error && error.error && error.error.message) {
              msg = error.error.message;
            }
            this.toaster.onFailure(msg, 'Fail');
          });
      } else {
        this.assetService.createAsset(this.asset)
          .subscribe(response => {
            this.toaster.onSuccess('Successfully Created', 'Created');
            this.routerLocation.back();
          }, error => {
            let msg = 'Something went wrong. Please fill the form correctly';
            if (error && error.error && error.error.message) {
              msg = error.error.message;
            }
            this.toaster.onFailure(msg, 'Fail');
          });
      }
    }



    // if (this.assetForm && this.assetForm.invalid) {
    //   this.toaster.onFailure('Please fill the form correctly.', 'Form is invalid!')
    //   Object.keys(this.assetForm.form.controls).forEach(element => {
    //     this.assetForm.form.controls[element].markAsDirty();
    //   });
    // } else {
    //   if (this.assetId) {
    //     this.assetService.updateAsset(this.asset)
    //       .subscribe(response => {
    //         this.toaster.onSuccess('Successfully saved', 'Saved');
    //         // this.onSuccess('Successfully saved', 'Saved');
    //         this.routerLocation.back();
    //       }, error => {
    //         this.toaster.onFailure('Something went wrong. Please fill the form correctly', 'Fail');
    //       });
    //   } else {
    //     this.assetService.createAsset(this.asset)
    //       .subscribe(response => {
    //         this.toaster.onSuccess('Successfully saved', 'Saved');
    //         this.route.navigate([`asset/home/${this.parentAssetId}/${this.parentAssetName}`])
    //       }, error => {
    //         this.toaster.onFailure('Something went wrong. Please fill the form correctly', 'Fail');
    //       });
    //   }
    // }
  }

  onCancelClick(event) {
    this.routerLocation.back();
  }

  openConfirmDialog() {
    this.assetRemoveMessage = `Are you sure you want to delete the "${this.asset.assetName}" Asset?`;
    this.confirmBox.open();
  }

  deleteAssetById(event) {
    if (event) {
      this.assetService.deleteAsset(this.asset.assetId)
        .subscribe(response => {
          this.toaster.onSuccess(`You have deleted ${this.asset.assetName} successfully.`, 'Delete Success!');
          this.route.navigate([`asset/home/${this.parentAssetId}/${this.parentAssetName}`]);
        }, error => {
          let msg = 'Something went wrong on server. Please try after sometiime.';
          if (error && error.error && error.error.message) {
            msg = error.error.message;
          }
          this.toaster.onFailure(msg, 'Delete Fail!');
        });
    }
  }

  onAssetTypeChange() {
    if (this.acceptedTemplateChages && this.asset.assetType !== this.previousAsset.assetType) {
      this.templateWarningMessage = 'Asset Type is inherited from the asset template, changing the value for this field breaks the binding to the asset template.  Are you sure you want to continue?'
      this.templateConfirmBox.open();
    }
  }

  removeTemplate(event) {
    if (!event) {
      // this.assetForm.resetForm();
      this.asset.assetType = this.previousAsset.assetType;
      this.asset.logo = this.previousAsset.logo;
      // this.asset.documentationUrl = this.previousAsset.documentationUrl;
      this.acceptedTemplateChages = true;
      this.imgURL = null;
      this.imgSize = undefined;
      if (this.locationImage && this.locationImage.nativeElement) {
        this.locationImage.nativeElement.value = '';
      }
      if (this.docFileInput && this.docFileInput.nativeElement) {
        this.docFileInput.nativeElement.value = '';
      }
    } else {
      // this.asset.templateId = null;
      // this.asset.templateName = null;
      // this.previousAsset = JSON.parse(JSON.stringify(this.asset));
      this.acceptedTemplateChages = false;
    }
  }

  onSaveAsTemplateClick(event) {
    if (event === 'save') {
      this.asset.templateName = this.templateNameToSave;
      this.assetService.createAssetTemplate(this.asset)
        .subscribe(response => {
          this.templates = [];
          this.modal.style.display = 'none';
        });
      // this.modal.style.display = "none";
    }
  }


  onLockClick1() {
    if (this.pageType.toLowerCase() === 'view') {
      this.route.navigate([`asset/edit/${this.parentLocId}/${this.parentLocName}/${this.parentAssetId}/${this.parentAssetName}/${this.asset.assetId}`])
    } else {
      this.route.navigate([`asset/view/${this.parentLocId}/${this.parentLocName}/${this.parentAssetId}/${this.parentAssetName}/${this.asset.assetId}`])
    }
  }

  onLockClick() {
    let event = 'view';
    if (this.pageType.toLowerCase() === 'view') {
      event = 'edit';
    }

    if (this.asset.parentAssetId) {
      this.route.navigate([`asset/${event}/${this.curOrgId}/${this.curOrgName}/${this.parentLocId}/${this.parentLocName}/${this.parentAssetId}/${this.parentAssetName}/${this.asset.assetId}`])
    } else {
      this.route.navigate([`asset/${event}/${this.curOrgId}/${this.curOrgName}/${this.parentLocId}/${this.parentLocName}/${this.parentAssetId}/${this.parentAssetName}/${this.asset.assetId}`])
    }
  }

  onClickOfNavTab(type) {
    this.isSignalAssociationClicked = false;
    this.isChildAssetAssociation = false;
    if (type === 'asset') {
      $('.nav-tabs a[href="#asset-details"]').tab('show');
      this.onClickOfNavTab('asset-details');
    } else if (type === 'signal_association') {
      this.isSignalAssociationClicked = true;
    } else if (type === 'child_asset') {
      this.isChildAssetAssociation = true;
    }
  }

  ngOnDestroy(): void {
    $('#asset_position_icon').remove();
    this.subscriptions.unsubscribe();
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
    if (!this.dashboardTabs) {
      this.dashboardTabs = []
    }
    const dashboardObj = event;
    dashboardObj.assetId = this.assetId;
    dashboardObj.organizationId = this.curOrgId;
    dashboardObj.locationId = this.parentLocId;
    dashboardObj.published = true;
    dashboardObj.active = true;

    this.dbLastIdNum++;
    this.newTabId = "dbtab-" + this.dbLastIdNum;
    // this.dbItems.push(new DbItem(this.newTabId, this.dbLongName, this.dbShortName, this.selTemplate,
    //   this.dbTemplates.find(({ name }) => name === this.selTemplate).component, ''));
    // // console.log('this.dbItems---added', this.dbItems);

    if (this.dashboardTab.dashboardId) {
      this.dbService.editDashboard(dashboardObj)
        .subscribe(response => {
          this.getAllDashboards();
          // let index = this.dashboardTabs.findIndex(x => x.dashboardId === this.dashboardTab.dashboardId);
          // this.dashboardTabs[index] = this.dashboardTab;
          this.dashboardTab = new DashBoard();
          this.toaster.onSuccess('Successfully Updated Dashboard', 'Updated');
        });
    } else {
      this.dbService.saveDashboard(dashboardObj)
      .subscribe(response => {
        this.getAllDashboards();
        this.dashboardTab = new DashBoard();
        this.toaster.onSuccess('Successfully Created Dashboard', 'Created');

      });
    }
      this.closeAddDashboardModal(true);
  }

  private getAllDashboards() {
    this.dbService.getAllDashboards(this.assetId, 'asset')
      .subscribe(response => {
        // console.log('get All Dashboard ', response);
        this.dashboardTabs = response;
      });
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
    this.message = `Do you want to delete the "${dashboardName}" Dashboard?`;
    this.confirmBoxDash.open();
  }

  deleteAssetDashboardById(event) {
    // // console.log('deleteOrganizationDashboardById===', event);
    if (event) {
      // delete dashboard service goes here
      this.dbService.deleteDashboard(this.deleteDashboardId)
        .subscribe(response => {
          this.toaster.onSuccess(`You have deleted ${this.deletedDashboardName} successfully`, 'Delete Success!');
          // this.route.navigate([`org/home/${this.curOrgId}/${this.curOrgName}`]);
          this.routerLocation.back();
        }, error => {
          this.toaster.onFailure('Something went wrong on server. Please try after sometiime.', 'Delete Fail!');
        });
    }

  }

  onLoadLocImg() {
    const el = this.elAssetPositionImg.nativeElement;
    const imgType = el.currentSrc.split(/\#|\?/)[0].split('.').pop().trim();
    this.imgOffsetLeft = el.offsetLeft;
    this.imgOffsetTop = el.offsetTop;
    this.imgOffsetWidth = el.offsetWidth;
    this.imgOffsetHeight = el.offsetHeight;
    this.imgParentHeight = el.offsetParent.clientHeight;
    this.imgParentWidth = el.offsetParent.clientWidth;

    if (imgType !== 'svg') {
      this.imgSourceHeight = el.naturalHeight;
      this.imgSourceWidth = el.naturalWidth;
    } else {
      this.imgSourceWidth = 5000;
      this.imgSourceHeight = (5000.0 * parseFloat(el.naturalHeight) / parseFloat(el.naturalWidth)).toFixed(0);
    }
  }

  onResize(event) {
    if (this.elAssetPositionImg) {
      this.imgOffsetTop = this.elAssetPositionImg.nativeElement.offsetTop;
      this.imgOffsetLeft = this.elAssetPositionImg.nativeElement.offsetLeft;
      this.imgOffsetWidth = this.elAssetPositionImg.nativeElement.offsetWidth;
      this.imgOffsetHeight = this.elAssetPositionImg.nativeElement.offsetHeight;
    }
  }

  templateDocumentDelete(removedTempFileStoreId) {
    const regenratedTemplatDocuments = [];
    this.templateDocuments.forEach(eachTemplateDocument => {
      // console.log('eachTemplateDocument.tempFileStoreId === removedTempFileStoreId', eachTemplateDocument.tempFileStoreId + '===' + removedTempFileStoreId);
      if (eachTemplateDocument.tempFileStoreId !== removedTempFileStoreId) {
        regenratedTemplatDocuments.push(eachTemplateDocument);
      }
    });

    this.templateDocuments = regenratedTemplatDocuments;
    // console.log('regenratedTemplatDocuments', this.templateDocuments);

  }


}

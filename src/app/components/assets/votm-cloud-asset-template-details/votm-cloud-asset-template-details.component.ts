import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatePipe, Location as RouterLocation } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AssetsService } from 'src/app/services/assets/assets.service';
import { OrganizationService } from 'src/app/services/organizations/organization.service';
import { SortArrays } from '../../shared/votm-sort';
import { NgForm } from '@angular/forms';
import { Toaster } from '../../shared/votm-cloud-toaster/votm-cloud-toaster';
import { ToastrService } from 'ngx-toastr';
import { Logo, VOTMFile } from 'src/app/models/logo.model';
import { DomSanitizer } from '@angular/platform-browser';
import { VotmCloudConfimDialogComponent } from '../../shared/votm-cloud-confim-dialog/votm-cloud-confim-dialog.component';

@Component({
  selector: 'app-votm-cloud-asset-template-details',
  templateUrl: './votm-cloud-asset-template-details.component.html',
  styleUrls: ['./votm-cloud-asset-template-details.component.scss']
})
export class VotmCloudAssetTemplateDetailsComponent implements OnInit {
  templateId: string;
  template: any = {};
  pageType: string;
  organizationList: any[] = [];
  parentAssetsList: any[] = [];
  parentAssetListForDropDown: any[] = [];
  asset: any;
  imgURL: any = '../../../../assets/images/assetPlaceholder.svg';
  toaster: Toaster = new Toaster(this.toastr);
  @ViewChild('confirmBox', null) confirmBox: VotmCloudConfimDialogComponent;
  @ViewChild('templateForm', null) templateForm: NgForm;
  @ViewChild('file', null) locationImage: ElementRef;
  @ViewChild('fileInput', null) docFileInput: ElementRef;
  message: string;
  imagePath: any;
  docFile: Blob;
  templateDeletemessage: string;
  fileExtension: any;
  imgSize: { width: number, height: number };
  templateDocuments: any[] = [];
  orgId: any;
  orgName: any;

  constructor(
    private routerLocation: RouterLocation,
    private router: Router,
    private assetService: AssetsService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private orgService: OrganizationService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.templateId = params.templateId;
        this.orgId = params.orgId;
        this.orgName = params.orgName;
        this.template.organizationId = this.orgId;
        this.template.organizationName = this.orgName;
        if (this.templateId) {
          this.fetchTemplateById();
        }
      });
    this.pageType = this.route.snapshot.data['type'];
    // this.getAllAssets();
    // this.getAllOrganization();
  }

  onCancelClick(event) {
    this.routerLocation.back();
  }

  fetchTemplateById() {
    this.assetService.getTemplateById(this.templateId)
      .subscribe(response => {
        if (response && response.length > 0) {
          this.template = response[0];

          if (this.template.logo && this.template.logo.imageName) {
            this.fileExtension = this.template.logo.imageName.slice((Math.max(0, this.template.logo.imageName.lastIndexOf('.')) || Infinity) + 1);
            // For svg type files use svg+xml as extention
            if (this.fileExtension === 'svg') {
              this.fileExtension = 'svg+xml';
            }
            this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(`data:image/${this.fileExtension};base64,${this.template.logo.image}`);
            this.template.logo.imageType = this.fileExtension;
          }

          // Get template documents and add temporary index to remove from dom & array (on delete icon)
          if (this.template.fileStore && this.template.fileStore.length > 0) {
            this.template.fileStore.forEach((templateDocument, index) => {
              this.templateDocuments[index] = templateDocument;
              this.templateDocuments[index].tempFileStoreId = index + 1;
            });
            // console.log('fetchTemplateById==', this.templateDocuments);
          }
        }
      });
  }

  getAllOrganization() {
    if (!this.organizationList || this.organizationList.length === 0) {
      this.orgService.getAllOrganizationsList()
        .subscribe(orgList => {
          this.organizationList = orgList;

          // this.organizationList.push({ organizationId: this.template.organizationId, name: this.template.organizationName });
          this.organizationList.sort(SortArrays.compareValues('name'));
          // this.filterLocations();
          this.filterAssets();
        });
    }


  }


  onParentOrgChange(event) {
    this.template.parentAssetId = null;
    this.template.parentAssetName = null;
    this.filterAssets();
  }


  getAllAssets() {
    this.assetService.getAllAssets()
      .subscribe(response => {
        this.parentAssetsList = response;
        this.parentAssetsList.sort(SortArrays.compareValues('assetName'));
        this.filterAssets();
      });
  }

  filterAssets() {
    if (this.parentAssetsList && this.parentAssetsList.length > 0) {
      this.parentAssetListForDropDown = [];
      this.parentAssetsList.forEach(asset => {
        if (this.template.organizationId === asset.organizationId) {
          this.parentAssetListForDropDown.push(asset);
        }
      });
      if (this.parentAssetListForDropDown && this.parentAssetListForDropDown.length > 0) {
        this.parentAssetListForDropDown.sort(SortArrays.compareValues('assetName'));
      }
    }
  }

  onTemplateSubmit() {
    // this.asset.documentationUrl = 'ABDFE';

    if (this.template) {
      if (!this.template.logo) {
        this.template.logo = null;
      }
      if (!this.template.fileStore) {
        this.template.fileStore = null;
      }

      // Multiple file upport
      if (this.templateDocuments) {
        this.template.fileStore = this.templateDocuments;
        // console.log('this.template=====', this.template);
        // return;
      }
    }
    // this.template.assetName = null;
    if (this.template && this.template.invalid) {
      this.toaster.onFailure('Please fill the form correctly.', 'Form is invalid!');
      Object.keys(this.templateForm.form.controls).forEach(element => {
        this.templateForm.form.controls[element].markAsDirty();
      });
    } else {
      // if (!this.acceptedTemplateChages) {
      //   this.asset.templateId = null;
      //   this.asset.templateName = null;
      // }
      if (this.templateId) {
        this.assetService.updateTemplate(this.template)
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
        this.assetService.createAssetTemplate(this.template)
          .subscribe(response => {
            this.toaster.onSuccess('Successfully saved', 'Saved');
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
  }



  onImageChangeClick() {
    this.preview(this.locationImage.nativeElement.files[0]);
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
    // readerToPreview.onload = (_event) => {
    //   this.imgURL = this.domSanitizer.bypassSecurityTrustUrl(readerToPreview.result.toString()); //readerToPreview.result;
    // };
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
        let base64textString = btoa(data);
        this.template.logo.image = base64textString;
      };

      this.template.logo = new Logo();
      this.template.logo.imageName = file.name;
      this.template.logo.imageType = file.type;
      reader.readAsBinaryString(file);
    }
  }


  onDocChangeClick() {
    this.onFileChange(this.docFileInput.nativeElement.files[0]);
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

  onLockClick() {
    if (this.pageType.toLowerCase() === 'view') {
      this.router.navigate([`org/template/edit/${this.template.templateId}`]);
    } else {
      this.router.navigate([`org/template/view/${this.template.templateId}`]);
    }
  }

  handleDocSelect(file) {
    if (file) {
      var reader: any = new FileReader();
      // reader.onload = this._handleReaderLoaded.bind(this);
      // this.template.fileStore = new VOTMFile();
      const temp: any = {};
      reader.onload = (e) => {
        // ADDED CODE
        let data;
        if (!e) {
          data = reader.content;
        } else {
          data = e.target.result;
        }
        const base64textString = btoa(data);
        // this.template.fileStore.file = base64textString;
        // this.template.fileStore.fileName = file.name;
        // this.template.fileStore.fileType = file.type;

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

  onFileOpen() {
    const fileURL = URL.createObjectURL(this.docFile);
    window.open(fileURL, '_blank');
  }

  openConfirmDialog() {
    this.templateDeletemessage = `Do you want to delete ${this.template.templateName}?`;
    this.confirmBox.open();

  }

  deleteTemplateById(event) {
    if (event) {
      this.assetService.deleteAsset(this.template.templateId)
        .subscribe(response => {
          this.toaster.onSuccess(`You have deleted ${this.template.templateName} successfully`, 'Delete Success!');
          this.routerLocation.back();
        }, error => {
          this.toaster.onFailure('Something went wrong on server. Please try after sometiime.', 'Delete Fail!');
        });
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

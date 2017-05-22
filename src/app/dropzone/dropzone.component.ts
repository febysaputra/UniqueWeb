import { Component, AfterViewInit, EventEmitter, OnDestroy  } from '@angular/core';
import { Output } from '@angular/core';
import { ToastrService } from 'toastr-ng2';
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

declare let require: any;

let Dropzone = require('../../../node_modules/dropzone/dist/dropzone-amd-module');

@Component({
  selector: 'app-dropzone',
  templateUrl: 'dropzone.component.html',
  styleUrls: ['dropzone.component.css'],
   animations: [

   // Define animations here.

  ]
})
export class DropzoneComponent implements AfterViewInit, OnDestroy {
  @Output() filesUploading: EventEmitter<File[]> = new EventEmitter<File[]>();
  // TODO: acceptedFiles option as input

  public dropzone;

  constructor(public toastr: ToastrService) {
  }

  get fileDropped(): boolean {
    if (this.dropzone) {
      return this.dropzone.files.length > 0;
    }
    return false;
  }

  Allfiles(){
    return this.dropzone.files;
  }

  ngAfterViewInit() {
    this.dropzone = new Dropzone('#upload-widget', {
      url: (files) => {
        this.filesUploading.emit(files);
      },
      paramName: "foto",
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 20,
      maxFilesize: 2, //max ukuran foto 1 MB
      maxThumbnailFilesize: 2,
      hiddenInputContainer: '#dropzone-drop-area',
      dictDefaultMessage: '',
      maxFiles: 5,
      thumbnailWidth: 100,
      thumbnailHeight: 100,
      acceptedFiles: 'image/*',
      clickable: '#dropzone-drop-area',
      previewsContainer: '#dropzone-drop-area',
      previewTemplate: `
<div class="dz-preview dz-file-preview">
  <div class="dz-image">
    <img data-dz-thumbnail />
  </div>
   <div class="dz-progress">
    <span class="dz-upload" data-dz-uploadprogress></span>
  </div>
  <div class="dz-error-message">
    <span data-dz-errormessage></span>
  </div>
</div>
`
    });
    this.dropzone.autoDiscover = false;

    this.dropzone.on('addedfile', (file) => {
    	 if(this.dropzone.files.length > 5){
        this.showNotifikasi();
    	 }
    	 if(file.size > 2097152){
    	 	this.dropzone.removeFile(file);
         this.showError();
    	 }
	   	file.previewElement.addEventListener('click', () => {
        		this.dropzone.removeFile(file);
        }); 
    });

     this.dropzone.on('error', (file) => {
       this.dropzone.removeFile(file); 
    });


    this.dropzone.on('maxfilesreached', (files) => {
      //this.dropzone.removeAllFiles();
    });
    // Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
    // of the sending event because uploadMultiple is set to true.
    this.dropzone.on('sendingmultiple', () => {
      console.log('sending!!!!!!!');
    });
  }

  showNotifikasi(){
    this.toastr.info("Anda hanya bisa memasukkan maksimal 5 gambar", 'Info!');
  }

  showError(){
    this.toastr.error("Maksimum file 2 MB", 'Error!');
  }

  ngOnDestroy() {
    this.dropzone.disable();
  }

  upload() {
    this.dropzone.processQueue();
  }

  deleteAll(){
  	console.log("delete all file");
  	this.dropzone.removeAllFiles();
  }
}
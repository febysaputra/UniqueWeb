import { Component, AfterViewInit, EventEmitter, OnDestroy  } from '@angular/core';
import { Output } from '@angular/core';
import { ToastrService } from 'toastr-ng2';
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

declare let require: any;

let Dropzone = require('../../../node_modules/dropzone/dist/dropzone');

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
      method: "",
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 20,
    });
    this.dropzone.autoDiscover = false;

    this.dropzone.on('addedfile', (file) => {
    	 if(this.dropzone.files.length > 5){
         this.dropzone.removeFile(file);
         this.showNotifikasi();
    	 }
    	 if(file.size > 2097152){
    	 	 this.dropzone.removeFile(file);
         this.showError();
    	 }

       if(!file.type.match(/image*/)){
         this.showErrorImage();
         this.dropzone.removeFile(file); 
       }
       file.previewElement.classList.add("dz-success");
	   	file.previewElement.addEventListener('click', () => {
        		this.dropzone.removeFile(file);
        }); 
    });

    
  }

  showNotifikasi(){
    this.toastr.info("Anda hanya bisa memasukkan maksimal 5 gambar", 'Info!');
  }

  showError(){
    this.toastr.error("Maksimum file 2 MB", 'Error!');
  }

  showErrorImage(){
    this.toastr.error("Anda hanya bisa memasukkan gambar", 'Error!');
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
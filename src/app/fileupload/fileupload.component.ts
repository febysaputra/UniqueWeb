import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { DataService } from '../data/data.service';

@Component({
    selector: 'app-fileupload',
    template: '<input type="file" [multiple]="multiple" #fileInput>',
    providers:[DataService]
})
export class FileuploadComponent implements OnInit {

    ngOnInit() {
    }

    @Input() multiple: boolean = false;
    @ViewChild('fileInput') inputEl: ElementRef;

    constructor(private http: Http, public dataService: DataService) {}

    upload() {
    let inputEl: HTMLInputElement = this.inputEl.nativeElement;
    let fileCount: number = inputEl.files.length;
    let formData = new FormData();
        if (fileCount > 0) { // a file was selected
            for (let i = 0; i < fileCount; i++) {
                formData.append('file[]', inputEl.files.item(i));
            }
            this.http.post(this.dataService.urlVerifikasiUser, formData, {withCredentials: true})
                .subscribe(res =>{
                    console.log(res);
                });
        }
    }

}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditgeneralComponent } from './editgeneral.component';

describe('EditgeneralComponent', () => {
  let component: EditgeneralComponent;
  let fixture: ComponentFixture<EditgeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditgeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditgeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

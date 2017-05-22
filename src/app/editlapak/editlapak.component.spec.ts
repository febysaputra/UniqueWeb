import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditlapakComponent } from './editlapak.component';

describe('EditlapakComponent', () => {
  let component: EditlapakComponent;
  let fixture: ComponentFixture<EditlapakComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditlapakComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditlapakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifikasiuserComponent } from './verifikasiuser.component';

describe('VerifikasiuserComponent', () => {
  let component: VerifikasiuserComponent;
  let fixture: ComponentFixture<VerifikasiuserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifikasiuserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifikasiuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditalamatComponent } from './editalamat.component';

describe('EditalamatComponent', () => {
  let component: EditalamatComponent;
  let fixture: ComponentFixture<EditalamatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditalamatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditalamatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

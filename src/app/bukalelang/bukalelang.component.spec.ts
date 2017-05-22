import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BukalelangComponent } from './bukalelang.component';

describe('BukalelangComponent', () => {
  let component: BukalelangComponent;
  let fixture: ComponentFixture<BukalelangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BukalelangComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BukalelangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

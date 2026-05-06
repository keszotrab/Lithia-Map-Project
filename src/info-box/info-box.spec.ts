import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBox } from './info-box';

describe('InfoBox', () => {
  let component: InfoBox;
  let fixture: ComponentFixture<InfoBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

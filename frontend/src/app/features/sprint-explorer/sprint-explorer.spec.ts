import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintExplorer } from './sprint-explorer';

describe('SprintExplorer', () => {
  let component: SprintExplorer;
  let fixture: ComponentFixture<SprintExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintExplorer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprintExplorer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

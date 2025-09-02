import { TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './layout/main-layout'; 

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
    }).compileComponents();
  });

  it('should create the app', () => { 
    const fixture = TestBed.createComponent(MainLayoutComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar')?.textContent).toContain('Q-LLM');
  });
});

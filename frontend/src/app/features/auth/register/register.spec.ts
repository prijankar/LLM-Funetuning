import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/core/services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, 
        FormsModule,
        RouterTestingModule,
        RegisterComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.f['username'].value).toBe('');
    expect(component.f['email'].value).toBe('');
    expect(component.f['password'].value).toBe('');
    expect(component.f['confirmPassword'].value).toBe('');
  });

  it('should validate form as invalid when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate username required', () => {
    const username = component.f['username'];
    expect(username.valid).toBeFalsy();
    
    username.setValue('test');
    expect(username.valid).toBeTruthy();
    
    username.setValue('');
    expect(username.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    const email = component.f['email'];
    email.setValue('invalid-email');
    expect(email.valid).toBeFalsy();
    expect(email.errors?.['email']).toBeTruthy();
    
    email.setValue('valid@example.com');
    expect(email.valid).toBeTruthy();
  });

  it('should validate password strength', () => {
    const password = component.f['password'];
    password.setValue('weak');
    expect(password.valid).toBeFalsy();
    
    password.setValue('Strong123');
    expect(password.valid).toBeTruthy();
  });

  it('should validate password confirmation', () => {
    const password = component.f['password'];
    const confirmPassword = component.f['confirmPassword'];
    
    password.setValue('Test123!');
    confirmPassword.setValue('Test123!');
    
    expect(component.registerForm.hasError('mustMatch')).toBeFalsy();
    
    confirmPassword.setValue('Different123!');
    expect(component.registerForm.hasError('mustMatch')).toBeTruthy();
  });

  it('should call authService.register on valid form submission', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!'
    };
    
    component.registerForm.setValue({
      ...testUser,
      confirmPassword: testUser.password
    });
    
    authService.register.and.returnValue(of({
      id: 1,
      uid: 'test-uid',
      username: testUser.username,
      email: testUser.email,
      displayName: testUser.username,
      emailVerified: false,
      roles: ['user'],
      isAdmin: false
    }));
    spyOn(router, 'navigate');
    
    component.onSubmit();
    
    expect(authService.register).toHaveBeenCalledWith(testUser);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'], 
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({
          registered: true
        })
      })
    );
  });

  it('should handle registration error', () => {
    const errorResponse = { error: { message: 'Registration failed' } };
    authService.register.and.returnValue(throwError(() => errorResponse));
    
    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!',
      confirmPassword: 'Test123!'
    });
    
    component.onSubmit();
    
    expect(component.error).toBe(errorResponse.error.message);
    expect(component.loading).toBeFalse();
  });
});

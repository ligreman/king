import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { ToastService } from './services/toast.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
    declarations: [
        AppComponent
    ],
    imports: [RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [
        { provide: FormBuilder, useValue: {} },
        { provide: ToastService, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
    });

    /*it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'king'`, () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app.title).toEqual('king');
    });

    it('should render title', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.content span').textContent).toContain('king app is running!');
    });*/
});

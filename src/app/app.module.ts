import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ArchitectComponent } from './routes/architect/architect.component';
import { LandingComponent } from './routes/landing/landing.component';
import { NodeInformationComponent } from './routes/node-information/node-information.component';
import { PageNotFoundComponent } from './routes/page-not-found/page-not-found.component';
import { MatPaginatorIntlSpanish } from './shared/spanish-paginator-intl';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        NodeInformationComponent,
        PageNotFoundComponent,
        LandingComponent,
        ArchitectComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        MatInputModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatRadioModule,
        MatMenuModule,
        MatProgressBarModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatAutocompleteModule,
        MatTooltipModule,
        NgxChartsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            defaultLanguage: 'en'
        }),
        ToastrModule.forRoot({
            'preventDuplicates': true,
            'countDuplicates': true,
            'progressBar': true,
            'positionClass': 'toast-bottom-right'
        })
    ],
    providers: [
        {
            provide: MatPaginatorIntl,
            useClass: MatPaginatorIntlSpanish
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

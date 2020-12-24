import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
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
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { DialogInfoConsumerComponent } from './components/dialog-info-consumer/dialog-info-consumer.component';
import { DialogInfoRouteComponent } from './components/dialog-info-route/dialog-info-route.component';
import { DialogInfoServiceComponent } from './components/dialog-info-service/dialog-info-service.component';
import { DialogInfoUpstreamComponent } from './components/dialog-info-upstream/dialog-info-upstream.component';
import { DialogNewConsumerComponent } from './components/dialog-new-consumer/dialog-new-consumer.component';
import { DialogNewPluginComponent } from './components/dialog-new-plugin/dialog-new-plugin.component';
import { DialogNewRouteComponent } from './components/dialog-new-route/dialog-new-route.component';
import { DialogNewServiceComponent } from './components/dialog-new-service/dialog-new-service.component';
import { DialogNewUpstreamComponent } from './components/dialog-new-upstream/dialog-new-upstream.component';
import { ArchitectComponent } from './routes/architect/architect.component';
import { ElementConsumerComponent } from './routes/elements/element-consumer/element-consumer.component';
import { ElementRouteComponent } from './routes/elements/element-route/element-route.component';
import { ElementServiceComponent } from './routes/elements/element-service/element-service.component';
import { ElementUpstreamComponent } from './routes/elements/element-upstream/element-upstream.component';
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
        ArchitectComponent,
        DialogNewServiceComponent,
        DialogInfoServiceComponent,
        DialogConfirmComponent,
        ElementServiceComponent,
        ElementRouteComponent,
        ElementUpstreamComponent,
        ElementConsumerComponent,
        DialogNewRouteComponent,
        DialogNewConsumerComponent,
        DialogNewUpstreamComponent,
        DialogNewPluginComponent,
        DialogInfoRouteComponent,
        DialogInfoUpstreamComponent,
        DialogInfoConsumerComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        ClipboardModule,
        MatInputModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatDialogModule,
        MatRadioModule,
        MatMenuModule,
        MatProgressBarModule,
        MatTabsModule,
        MatExpansionModule,
        MatChipsModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatAutocompleteModule,
        MatTooltipModule,
        MatSidenavModule,
        MatSortModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatTableModule,
        NgxChartsModule,
        ReactiveFormsModule,
        FormsModule,
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
    constructor() {
    }
}

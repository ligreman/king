import {ClipboardModule} from '@angular/cdk/clipboard';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {ToastrModule} from 'ngx-toastr';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DialogAboutComponent} from './components/dialog-about/dialog-about.component';
import {DialogConfirmComponent} from './components/dialog-confirm/dialog-confirm.component';
import {DialogInfoAclComponent} from './components/dialog-info-acl/dialog-info-acl.component';
import {DialogInfoJwtComponent} from './components/dialog-info-jwt/dialog-info-jwt.component';
import {DialogInfoBasicComponent} from './components/dialog-info-basic/dialog-info-basic.component';
import {DialogInfoKeyComponent} from './components/dialog-info-key/dialog-info-key.component';
import {DialogInfoPluginComponent} from './components/dialog-info-plugin/dialog-info-plugin.component';
import {DialogInfoRouteComponent} from './components/dialog-info-route/dialog-info-route.component';
import {DialogInfoServiceComponent} from './components/dialog-info-service/dialog-info-service.component';
import {DialogInfoTargetComponent} from './components/dialog-info-target/dialog-info-target.component';
import {DialogInfoUpstreamComponent} from './components/dialog-info-upstream/dialog-info-upstream.component';
import {DialogInfoVaultComponent} from './components/dialog-info-vault/dialog-info-vault.component';
import {DialogNewCacertComponent} from './components/dialog-new-cacert/dialog-new-cacert.component';
import {DialogNewCertComponent} from './components/dialog-new-cert/dialog-new-cert.component';
import {DialogNewConsumerComponent} from './components/dialog-new-consumer/dialog-new-consumer.component';
import {DialogNewPluginComponent} from './components/dialog-new-plugin/dialog-new-plugin.component';
import {
    PluginFormFieldsComponent
} from './components/dialog-new-plugin/plugin-form-fields/plugin-form-fields.component';
import {DialogNewRouteComponent} from './components/dialog-new-route/dialog-new-route.component';
import {DialogNewRsuComponent} from './components/dialog-new-rsu/dialog-new-rsu.component';
import {DialogNewServiceComponent} from './components/dialog-new-service/dialog-new-service.component';
import {DialogNewSniComponent} from './components/dialog-new-sni/dialog-new-sni.component';
import {DialogNewTargetComponent} from './components/dialog-new-target/dialog-new-target.component';
import {DialogNewUpstreamComponent} from './components/dialog-new-upstream/dialog-new-upstream.component';
import {DialogNewVaultComponent} from './components/dialog-new-vault/dialog-new-vault.component';
import {ManualContentComponent} from './components/manual-content/manual-content.component';
import {ManualEnComponent} from './components/manual-content/manual-en/manual-en.component';
import {ManualEsComponent} from './components/manual-content/manual-es/manual-es.component';
import {AccessAclsComponent} from './routes/access/access-acls/access-acls.component';
import {AccessJwtComponent} from './routes/access/access-jwt/access-jwt.component';
import {AccessBasicComponent} from './routes/access/access-basic/access-basic.component';
import {AccessKeyComponent} from './routes/access/access-key/access-key.component';
import {ElementConsumerComponent} from './routes/access/element-consumer/element-consumer.component';
import {ArchitectComponent} from './routes/architect/architect.component';
import {CertificateCacertComponent} from './routes/certificates/certificate-cacert/certificate-cacert.component';
import {CertificateCertComponent} from './routes/certificates/certificate-cert/certificate-cert.component';
import {CertificateSniComponent} from './routes/certificates/certificate-sni/certificate-sni.component';
import {ElementRouteComponent} from './routes/elements/element-route/element-route.component';
import {ElementServiceComponent} from './routes/elements/element-service/element-service.component';
import {ElementUpstreamComponent} from './routes/elements/element-upstream/element-upstream.component';
import {ElementVaultComponent} from './routes/elements/element-vault/element-vault.component';
import {LandingComponent} from './routes/landing/landing.component';
import {NodeInformationComponent} from './routes/node-information/node-information.component';
import {PageNotFoundComponent} from './routes/page-not-found/page-not-found.component';
import {PluginListComponent} from './routes/plugins/plugin-list/plugin-list.component';
import {MatPaginatorIntlSpanish} from './shared/spanish-paginator-intl';
import {DialogInfoOauth2Component} from './components/dialog-info-oauth2/dialog-info-oauth2.component';
import {AccessOauth2Component} from './routes/access/access-oauth2/access-oauth2.component';
import {DialogSettingsComponent} from "./components/dialog-settings/dialog-settings.component";

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
        DialogInfoVaultComponent,
        DialogConfirmComponent,
        ElementServiceComponent,
        ElementRouteComponent,
        ElementUpstreamComponent,
        ElementVaultComponent,
        ElementConsumerComponent,
        DialogNewRouteComponent,
        DialogNewVaultComponent,
        DialogNewConsumerComponent,
        DialogNewUpstreamComponent,
        DialogNewPluginComponent,
        DialogInfoRouteComponent,
        DialogInfoUpstreamComponent,
        DialogNewTargetComponent,
        DialogInfoTargetComponent,
        CertificateSniComponent,
        CertificateCacertComponent,
        CertificateCertComponent,
        DialogNewSniComponent,
        DialogNewCertComponent,
        DialogNewCacertComponent,
        DialogSettingsComponent,
        PluginListComponent,
        DialogInfoPluginComponent,
        PluginFormFieldsComponent,
        DialogAboutComponent,
        ManualContentComponent,
        DialogInfoAclComponent,
        AccessAclsComponent,
        AccessBasicComponent,
        AccessKeyComponent,
        DialogInfoBasicComponent,
        DialogInfoKeyComponent,
        ManualEnComponent,
        ManualEsComponent,
        DialogNewRsuComponent,
        AccessJwtComponent,
        DialogInfoJwtComponent,
        DialogInfoOauth2Component,
        AccessOauth2Component
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
        MatBadgeModule,
        MatListModule,
        MatIconModule,
        MatAutocompleteModule,
        MatTooltipModule,
        MatSidenavModule,
        MatSortModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatTableModule,
        MatSlideToggleModule,
        MatStepperModule,
        NgxChartsModule,
        ReactiveFormsModule,
        FormsModule,
        NgxJsonViewerModule,
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
        }),
        MatGridListModule
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

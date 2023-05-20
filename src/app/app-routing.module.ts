import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ConnectedGuard} from './guards/connected.guard';
import {AccessAclsComponent} from './routes/access/access-acls/access-acls.component';
import {AccessJwtComponent} from './routes/access/access-jwt/access-jwt.component';
import {AccessBasicComponent} from './routes/access/access-basic/access-basic.component';
import {AccessKeyComponent} from './routes/access/access-key/access-key.component';
import {AccessOauth2Component} from './routes/access/access-oauth2/access-oauth2.component';
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

const routes: Routes = [
    {path: 'landing', component: LandingComponent},
    {path: 'node-information', component: NodeInformationComponent, canActivate: [ConnectedGuard]},
    {path: 'architect', component: ArchitectComponent, canActivate: [ConnectedGuard]},
    {path: 'element-service', component: ElementServiceComponent, canActivate: [ConnectedGuard]},
    {path: 'element-route', component: ElementRouteComponent, canActivate: [ConnectedGuard]},
    {path: 'element-upstream', component: ElementUpstreamComponent, canActivate: [ConnectedGuard]},
    {path: 'element-consumer', component: ElementConsumerComponent, canActivate: [ConnectedGuard]},
    {path: 'element-vault', component: ElementVaultComponent, canActivate: [ConnectedGuard]},
    {path: 'access-acls', component: AccessAclsComponent, canActivate: [ConnectedGuard]},
    {path: 'access-basic', component: AccessBasicComponent, canActivate: [ConnectedGuard]},
    {path: 'access-key', component: AccessKeyComponent, canActivate: [ConnectedGuard]},
    {path: 'access-jwt', component: AccessJwtComponent, canActivate: [ConnectedGuard]},
    {path: 'access-oauth2', component: AccessOauth2Component, canActivate: [ConnectedGuard]},
    {path: 'plugin-list', component: PluginListComponent, canActivate: [ConnectedGuard]},
    {path: 'certificate-cert', component: CertificateCertComponent, canActivate: [ConnectedGuard]},
    {path: 'certificate-cacert', component: CertificateCacertComponent, canActivate: [ConnectedGuard]},
    {path: 'certificate-sni', component: CertificateSniComponent, canActivate: [ConnectedGuard]},
    {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full'
    },
    {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        scrollPositionRestoration: 'enabled',
        relativeLinkResolution: 'corrected'
    })],
    exports: [RouterModule]
})

export class AppRoutingModule {
}

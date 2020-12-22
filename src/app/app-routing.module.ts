import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectedGuard } from './guards/connected.guard';
import { ArchitectComponent } from './routes/architect/architect.component';
import { ElementConsumerComponent } from './routes/elements/element-consumer/element-consumer.component';
import { ElementRouteComponent } from './routes/elements/element-route/element-route.component';
import { ElementServiceComponent } from './routes/elements/element-service/element-service.component';
import { ElementUpstreamComponent } from './routes/elements/element-upstream/element-upstream.component';
import { LandingComponent } from './routes/landing/landing.component';
import { NodeInformationComponent } from './routes/node-information/node-information.component';
import { PageNotFoundComponent } from './routes/page-not-found/page-not-found.component';

const routes: Routes = [
    {path: 'landing', component: LandingComponent},
    {path: 'node-information', component: NodeInformationComponent, canActivate: [ConnectedGuard]},
    {path: 'architect', component: ArchitectComponent, canActivate: [ConnectedGuard]},
    {path: 'element-service', component: ElementServiceComponent, canActivate: [ConnectedGuard]},
    {path: 'element-route', component: ElementRouteComponent, canActivate: [ConnectedGuard]},
    {path: 'element-upstream', component: ElementUpstreamComponent, canActivate: [ConnectedGuard]},
    {path: 'element-consumer', component: ElementConsumerComponent, canActivate: [ConnectedGuard]},
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

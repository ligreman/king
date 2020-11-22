import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchitectComponent } from './routes/architect/architect.component';
import { LandingComponent } from './routes/landing/landing.component';
import { NodeInformationComponent } from './routes/node-information/node-information.component';
import { PageNotFoundComponent } from './routes/page-not-found/page-not-found.component';

const routes: Routes = [
    {path: 'landing', component: LandingComponent},
    {path: 'node-information', component: NodeInformationComponent},
    {path: 'architect', component: ArchitectComponent},
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

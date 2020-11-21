import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './routes/landing/landing.component';
import { NodeInformationComponent } from './routes/node-information/node-information.component';
import { PageNotFoundComponent } from './routes/page-not-found/page-not-found.component';

const routes: Routes = [
    {path: 'landing', component: LandingComponent},
    {path: 'node-information', component: NodeInformationComponent},
    {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full'
    },
    {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true, relativeLinkResolution: 'legacy'})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

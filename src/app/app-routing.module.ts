import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NodeInformationComponent } from './routes/node-information/node-information.component';
import { PageNotFoundComponent } from './routes/page-not-found/page-not-found.component';

const routes: Routes = [
    {path: 'node-information', component: NodeInformationComponent},
    {
        path: '',
        redirectTo: '/node-information',
        pathMatch: 'full'
    },
    {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

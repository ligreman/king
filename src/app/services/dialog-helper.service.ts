import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../components/dialog-confirm/dialog-confirm.component';
import { DialogInfoConsumerComponent } from '../components/dialog-info-consumer/dialog-info-consumer.component';
import { DialogInfoRouteComponent } from '../components/dialog-info-route/dialog-info-route.component';
import { DialogInfoServiceComponent } from '../components/dialog-info-service/dialog-info-service.component';
import { DialogInfoUpstreamComponent } from '../components/dialog-info-upstream/dialog-info-upstream.component';
import { DialogNewConsumerComponent } from '../components/dialog-new-consumer/dialog-new-consumer.component';
import { DialogNewRouteComponent } from '../components/dialog-new-route/dialog-new-route.component';
import { DialogNewServiceComponent } from '../components/dialog-new-service/dialog-new-service.component';
import { DialogNewTargetComponent } from '../components/dialog-new-target/dialog-new-target.component';
import { DialogNewUpstreamComponent } from '../components/dialog-new-upstream/dialog-new-upstream.component';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class DialogHelperService {

    constructor(private dialog: MatDialog, private api: ApiService, private toast: ToastService) { }

    /*
        Añade un servicio nuevo
     */
    addEditService(selected = null) {
        return new Promise((resolve, reject) => {
            // Miro si me viene datos del seleccionado para entonces mostrar ventana de editar
            let selectedServiceId = null;
            if (selected !== null) {
                selectedServiceId = selected.id;
            }

            const dialogRef = this.dialog.open(DialogNewServiceComponent, {
                disableClose: true,
                minWidth: '80vw',
                minHeight: '50vh',
                data: selectedServiceId
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== 'null') {
                    // Si no venía selected, es que es nuevo servicio
                    if (selectedServiceId === null) {
                        // llamo al API
                        this.api.postNewService(result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.new_service', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                    // Si venía es que es edición
                    else {
                        this.api.patchService(selectedServiceId, result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.update_service', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                } else {
                    reject();
                }
            });
        });
    }

    /*
        Añade una ruta
     */
    addEditRoute(selected = null) {
        return new Promise((resolve, reject) => {
            // Miro si me viene datos del seleccionado para entonces mostrar ventana de editar
            let selectedRouteId = null;
            if (selected !== null) {
                selectedRouteId = selected.id;
            }

            const dialogRef = this.dialog.open(DialogNewRouteComponent, {
                disableClose: true,
                minWidth: '80vw',
                minHeight: '50vh',
                data: selectedRouteId
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== 'null') {
                    // Si no venía selected, es que es nuevo
                    if (selectedRouteId === null) {
                        // llamo al API
                        this.api.postNewRoute(result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.new_route', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                    // Si venía es que es edición
                    else {
                        this.api.patchRoute(selectedRouteId, result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.update_route', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                } else {
                    reject();
                }
            });
        });
    }

    /*
        Añade un upstream
     */
    addEditUpstream(selected = null) {
        return new Promise((resolve, reject) => {
            // Miro si me viene datos del seleccionado para entonces mostrar ventana de editar
            let selectedUpstreamId = null;
            if (selected !== null) {
                selectedUpstreamId = selected.id;
            }

            const dialogRef = this.dialog.open(DialogNewUpstreamComponent, {
                disableClose: true,
                minWidth: '80vw',
                minHeight: '50vh',
                data: selectedUpstreamId
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== 'null') {
                    // Si no venía selected, es que es nuevo
                    if (selectedUpstreamId === null) {
                        // llamo al API
                        this.api.postNewUpstream(result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.new_upstream', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                    // Si venía es que es edición
                    else {
                        this.api.patchUpstream(selectedUpstreamId, result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.update_upstream', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                } else {
                    reject();
                }
            });
        });
    }

    /*
        Añade un consumidor
     */
    addEditConsumer(selected = null) {
        return new Promise((resolve, reject) => {
            // Miro si me viene datos del seleccionado para entonces mostrar ventana de editar
            let selectedConsumerId = null;
            if (selected !== null) {
                selectedConsumerId = selected.id;
            }

            const dialogRef = this.dialog.open(DialogNewConsumerComponent, {
                disableClose: true,
                minWidth: '80vw',
                minHeight: '50vh',
                data: selectedConsumerId
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== 'null') {
                    // Si no venía selected, es que es nuevo
                    if (selectedConsumerId === null) {
                        // llamo al API
                        this.api.postNewConsumer(result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.new_consumer', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                    // Si venía es que es edición
                    else {
                        this.api.patchConsumer(selectedConsumerId, result).subscribe(value => {
                            this.toast.success('text.id_extra', 'success.update_consumer', {msgExtra: value['id']});
                            resolve();
                        }, error => {
                            this.toast.error_general(error, {disableTimeOut: true});
                            reject();
                        });
                    }
                } else {
                    reject();
                }
            });
        });
    }

    /*
        Añade un target
     */
    addTarget(selectedUpstream) {
        return new Promise((resolve, reject) => {
            // Miro si me viene datos del seleccionado para entonces mostrar ventana de editar
            let selectedUpstreamId = null;
            if (selectedUpstream !== null) {
                selectedUpstreamId = selectedUpstream.id;
            } else {
                reject();
            }

            const dialogRef = this.dialog.open(DialogNewTargetComponent, {
                disableClose: true,
                minWidth: '80vw',
                minHeight: '50vh',
                data: selectedUpstreamId
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== 'null') {
                    // llamo al API
                    this.api.postNewTarget(result, selectedUpstreamId).subscribe(value => {
                        this.toast.success('text.id_extra', 'success.new_target', {msgExtra: value['id']});
                        resolve();
                    }, error => {
                        this.toast.error_general(error, {disableTimeOut: true});
                        reject();
                    });

                } else {
                    reject();
                }
            });
        });
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfoElement(select, group) {
        let opt = {
            data: '',
            minHeight: '50vh',
            minWidth: '75vw'
        };
        let component;

        switch (group) {
            case 'service':
                opt.data = select.id;
                component = DialogInfoServiceComponent;
                break;
            case 'route':
                opt.data = select.id;
                component = DialogInfoRouteComponent;
                break;
            case 'upstream':
                opt.data = select.id;
                component = DialogInfoUpstreamComponent;
                break;
            case 'consumer':
                opt.data = select.id;
                component = DialogInfoConsumerComponent;
                break;
        }

        this.dialog.open(component, opt);
    }

    /*
        Borra el elemento seleccionado
     */
    deleteElement(select, group) {
        return new Promise((resolve, reject) => {
            let opt = {
                data: {}
            };

            switch (group) {
                case 'service':
                case 'route':
                case 'upstream':
                    opt.data = {
                        title: 'dialog.confirm.delete_' + group + '_title',
                        content: 'dialog.confirm.delete_' + group,
                        name: select.name,
                        id: select.id
                    };
                    break;
                case 'consumer':
                    opt.data = {
                        title: 'dialog.confirm.delete_consumer_title',
                        content: 'dialog.confirm.delete_consumer',
                        name: select.username,
                        id: select.id
                    };
                    break;
            }

            const dialogRef = this.dialog.open(DialogConfirmComponent, opt);
            dialogRef.afterClosed().subscribe(result => {
                if (result === 'true') {

                    // llamo al API
                    switch (group) {
                        case 'service':
                            this.api.deleteService(select.id).subscribe(() => {
                                this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                resolve();
                            }, error => {
                                this.toast.error_general(error, {disableTimeOut: true});
                                reject();
                            });
                            break;
                        case 'route':
                            this.api.deleteRoute(select.id).subscribe(() => {
                                this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                resolve();
                            }, error => {
                                this.toast.error_general(error, {disableTimeOut: true});
                                reject();
                            });
                            break;
                        case 'upstream':
                            this.api.deleteUpstream(select.id).subscribe(() => {
                                this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                resolve();
                            }, error => {
                                this.toast.error_general(error, {disableTimeOut: true});
                                reject();
                            });
                            break;
                        case 'consumer':
                            this.api.deleteConsumer(select.id).subscribe(() => {
                                this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.username});
                                resolve();
                            }, error => {
                                this.toast.error_general(error, {disableTimeOut: true});
                                reject();
                            });
                            break;
                    }
                } else {
                    reject();
                }
            });
        });
    }
}

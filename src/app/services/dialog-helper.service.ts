import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../components/dialog-confirm/dialog-confirm.component';
import { DialogInfoServiceComponent } from '../components/dialog-info-service/dialog-info-service.component';
import { DialogNewServiceComponent } from '../components/dialog-new-service/dialog-new-service.component';
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
        Muestra la info del elemento seleccionado
     */
    showInfoElement(select) {
        let opt = {
            data: '',
            minHeight: '50vh',
            minWidth: '75vw'
        };

        switch (select.group) {
            case 'service':
                opt.data = select.id;
                break;
            case 'route':
                break;
            case 'upstream':
                break;
            case 'consumer':
                break;
        }

        this.dialog.open(DialogInfoServiceComponent, opt);
    }

    /*
        Borra el elemento seleccionado
     */
    deleteElement(select) {
        return new Promise((resolve, reject) => {
            let opt = {
                data: {}
            };
            switch (select.group) {
                case 'service':
                    opt.data = {title: 'dialog.confirm.delete_service_title', content: 'dialog.confirm.delete_service', name: select.label, id: select.id};
                    break;
                case 'route':
                    break;
                case 'upstream':
                    break;
                case 'consumer':
                    break;
            }

            const dialogRef = this.dialog.open(DialogConfirmComponent, opt);
            dialogRef.afterClosed().subscribe(result => {
                if (result === 'true') {

                    // llamo al API
                    switch (select.group) {
                        case 'service':
                            this.api.deleteService(select.id).subscribe(() => {
                                this.toast.success('text.id_extra', 'success.delete_service', {msgExtra: select.id});
                                resolve();
                            }, error => {
                                this.toast.error_general(error, {disableTimeOut: true});
                                reject();
                            });
                            break;
                        case 'route':
                            break;
                        case 'upstream':
                            break;
                        case 'consumer':
                            break;
                    }
                } else {
                    reject();
                }
            });
        });
    }
}

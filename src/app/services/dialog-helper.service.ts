import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DialogConfirmComponent} from '../components/dialog-confirm/dialog-confirm.component';
import {DialogInfoAclComponent} from '../components/dialog-info-acl/dialog-info-acl.component';
import {DialogInfoJwtComponent} from '../components/dialog-info-jwt/dialog-info-jwt.component';
import {DialogInfoBasicComponent} from '../components/dialog-info-basic/dialog-info-basic.component';
import {DialogInfoKeyComponent} from '../components/dialog-info-key/dialog-info-key.component';
import {DialogInfoPluginComponent} from '../components/dialog-info-plugin/dialog-info-plugin.component';
import {DialogInfoRouteComponent} from '../components/dialog-info-route/dialog-info-route.component';
import {DialogInfoServiceComponent} from '../components/dialog-info-service/dialog-info-service.component';
import {DialogInfoTargetComponent} from '../components/dialog-info-target/dialog-info-target.component';
import {DialogInfoUpstreamComponent} from '../components/dialog-info-upstream/dialog-info-upstream.component';
import {DialogInfoVaultComponent} from '../components/dialog-info-vault/dialog-info-vault.component';
import {DialogNewCacertComponent} from '../components/dialog-new-cacert/dialog-new-cacert.component';
import {DialogNewCertComponent} from '../components/dialog-new-cert/dialog-new-cert.component';
import {DialogNewConsumerComponent} from '../components/dialog-new-consumer/dialog-new-consumer.component';
import {DialogNewPluginComponent} from '../components/dialog-new-plugin/dialog-new-plugin.component';
import {DialogNewRouteComponent} from '../components/dialog-new-route/dialog-new-route.component';
import {DialogNewRsuComponent} from '../components/dialog-new-rsu/dialog-new-rsu.component';
import {DialogNewServiceComponent} from '../components/dialog-new-service/dialog-new-service.component';
import {DialogNewSniComponent} from '../components/dialog-new-sni/dialog-new-sni.component';
import {DialogNewTargetComponent} from '../components/dialog-new-target/dialog-new-target.component';
import {DialogNewUpstreamComponent} from '../components/dialog-new-upstream/dialog-new-upstream.component';
import {DialogNewVaultComponent} from '../components/dialog-new-vault/dialog-new-vault.component';
import {ApiService} from './api.service';
import {GlobalsService} from './globals.service';
import {ToastService} from './toast.service';
import {DialogInfoOauth2Component} from "../components/dialog-info-oauth2/dialog-info-oauth2.component";
import {
    DialogNewRouteNoexpressionsComponent
} from "../components/dialog-new-route-noexpressions/dialog-new-route-noexpressions.component";

@Injectable({
    providedIn: 'root'
})
export class DialogHelperService {

    constructor(private dialog: MatDialog, private api: ApiService, private toast: ToastService, private globals: GlobalsService) {
    }


    addEdit(selected, group, extras = null) {
        return new Promise<void>((resolve, reject) => {
            let selectedId = null;
            if (selected !== null) {
                selectedId = selected.id;
            }

            let component;

            switch (group) {
                case 'rsu':
                    component = DialogNewRsuComponent;
                    break;
                case 'service':
                    component = DialogNewServiceComponent;
                    break;
                case 'route':
                    if (this.globals.ROUTER_MODE) {
                        // Expressions
                        component = DialogNewRouteComponent;
                    } else {
                        // No Expressions
                        component = DialogNewRouteNoexpressionsComponent;
                    }
                    break;
                case 'vault':
                    component = DialogNewVaultComponent;
                    break;
                case 'upstream':
                    component = DialogNewUpstreamComponent;
                    break;
                case 'consumer':
                    component = DialogNewConsumerComponent;
                    if (selected !== null && selected.consumerId) {
                        selectedId = selected.consumerId;
                    } else if (selected !== null) {
                        selectedId = selected.id;
                    }
                    break;
                case 'sni':
                    component = DialogNewSniComponent;
                    break;
                case 'cert':
                    component = DialogNewCertComponent;
                    break;
                case 'cacert':
                    component = DialogNewCacertComponent;
                    break;
                case 'target':
                    component = DialogNewTargetComponent;
                    break;
                case 'plugin':
                    component = DialogNewPluginComponent;
                    selectedId = {selectedId, extras};
                    break;
            }

            const dialogRef = this.dialog.open(component, {
                disableClose: true,
                minWidth: '80vw',
                minHeight: '50vh',
                data: selectedId
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== null && result !== 'null') {
                    resolve();
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
            case 'vault':
                opt.data = select.id;
                component = DialogInfoVaultComponent;
                break;
            case 'target':
                opt.data = select.id + '#' + select.data.upstream.id;
                component = DialogInfoTargetComponent;
                break;
            case 'plugin':
                opt.data = select.id;
                component = DialogInfoPluginComponent;
                break;
            case 'acl':
                opt.data = select;
                component = DialogInfoAclComponent;
                break;
            case 'basic':
                opt.data = select;
                component = DialogInfoBasicComponent;
                break;
            case 'key':
                opt.data = select;
                component = DialogInfoKeyComponent;
                break;
            case 'jwt':
                opt.data = select;
                component = DialogInfoJwtComponent;
                break;
            case 'oauth2':
                opt.data = select;
                opt.minWidth = '95vw';
                component = DialogInfoOauth2Component;
                break;
        }

        this.dialog.open(component, opt);
    }

    /*
        Borra el elemento seleccionado
     */
    deleteElement(select, group) {
        return new Promise<void>((resolve, reject) => {
            let opt = {
                data: {}
            };

            switch (group) {
                case 'service':
                case 'route':
                case 'upstream':
                case 'vault':
                case 'sni':
                case 'cert':
                case 'cacert':
                    opt.data = {
                        title: 'dialog.confirm.delete_' + group + '_title',
                        content: 'dialog.confirm.delete_' + group,
                        name: select.name || select.id,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'consumer':
                    if (!select.consumerId) {
                        select.consumerId = select.id;
                    }
                    opt.data = {
                        title: 'dialog.confirm.delete_consumer_title',
                        content: 'dialog.confirm.delete_consumer',
                        name: select.username || select.custom_id,
                        consumerId: select.consumerId,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'target':
                    opt.data = {
                        title: 'dialog.confirm.delete_target_title',
                        content: 'dialog.confirm.delete_target',
                        name: select.target,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'plugin':
                    opt.data = {
                        title: 'dialog.confirm.delete_plugin_title',
                        content: 'dialog.confirm.delete_plugin',
                        name: select.name,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'basic':
                    opt.data = {
                        title: 'dialog.confirm.delete_basic_title',
                        content: 'dialog.confirm.delete_basic',
                        name: select.name,
                        consumerId: select.consumerId,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'acl':
                    opt.data = {
                        title: 'dialog.confirm.delete_acl_title',
                        content: 'dialog.confirm.delete_acl',
                        name: select.name,
                        consumerId: select.consumerId,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'key':
                    opt.data = {
                        title: 'dialog.confirm.delete_key_title',
                        content: 'dialog.confirm.delete_key',
                        name: select.name,
                        consumerId: select.consumerId,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'jwt':
                    opt.data = {
                        title: 'dialog.confirm.delete_jwt_title',
                        content: 'dialog.confirm.delete_jwt',
                        name: select.name,
                        consumerId: select.consumerId,
                        id: select.id,
                        delete: true
                    };
                    break;
                case 'oauth2':
                    opt.data = {
                        title: 'dialog.confirm.delete_oauth2_title',
                        content: 'dialog.confirm.delete_oauth2',
                        name: select.name,
                        consumerId: select.consumerId,
                        id: select.id,
                        delete: true
                    };
                    break;
            }

            const dialogRef = this.dialog.open(DialogConfirmComponent, opt);
            dialogRef.afterClosed().subscribe((result) => {
                if (result === 'true') {

                    // llamo al API
                    switch (group) {
                        case 'service':
                            this.api.deleteService(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                },
                                error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'route':
                            this.api.deleteRoute(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'upstream':
                            this.api.deleteUpstream(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'consumer':
                            this.api.deleteConsumer(select.consumerId).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: (select.username || select.custom_id)});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'vault':
                            this.api.deleteVault(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                },
                                error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'target':
                            this.api.deleteTarget(select.id, select.upstream.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.target});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'sni':
                            this.api.deleteSni(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'cert':
                            this.api.deleteCertificate(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.id});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'cacert':
                            this.api.deleteCACertificate(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.id});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'plugin':
                            this.api.deletePlugin(select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.id});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'acl':
                            this.api.deleteConsumerAcl(select.consumerId, select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'basic':
                            this.api.deleteConsumerBasicAuth(select.consumerId, select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'key':
                            this.api.deleteConsumerApiKey(select.consumerId, select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'jwt':
                            this.api.deleteConsumerJwtToken(select.consumerId, select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                        case 'oauth2':
                            this.api.deleteConsumerOAuthApp(select.consumerId, select.id).subscribe({
                                next: () => {
                                    this.toast.success('text.id_extra', 'success.delete_' + group, {msgExtra: select.name});
                                    resolve();
                                }, error: (error) => {
                                    this.toast.error_general(error, {disableTimeOut: true});
                                    reject();
                                }
                            });
                            break;
                    }
                } else {
                    reject();
                }
            });
        });
    }

    confirm(data) {
        return new Promise<void>((resolve, reject) => {
            let opt = {
                data: {
                    id: data?.id || '',
                    content: data?.content || '',
                    title: data?.title || '',
                    name: data?.name || '',
                    delete: data?.delete
                }
            };

            const dialogRef = this.dialog.open(DialogConfirmComponent, opt);
            dialogRef.afterClosed().subscribe(result => {
                if (result === 'true') {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    getRouterMode() {
        return new Promise<void>((resolve, reject) => {
            if (this.globals.ROUTER_MODE === '') {
                this.api.getNodeInformation()
                    .subscribe({
                        next: (res) => {
                            this.globals.ROUTER_MODE = res['configuration']['router_flavor'];
                            resolve();
                        }, error: () => reject()
                    });
            } else {
                resolve();
            }
        });
    }
}

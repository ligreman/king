import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from './services/api.service';
import { DialogHelperService } from './services/dialog-helper.service';
import { GlobalsService } from './services/globals.service';
import { NodeService } from './services/node.service';
import { ToastService } from './services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    lang = new FormControl('');

    formNodes = this.fb.group({
        node: ['', Validators.required]
    });

    node_list: string[] = [];


    constructor(private translate: TranslateService, private api: ApiService, private globals: GlobalsService, private fb: FormBuilder,
                private toast: ToastService, private route: Router, private nodeWatcher: NodeService, private dialogHelper: DialogHelperService) {
        // Cargo del localStorage el idioma
        const language = localStorage.getItem('language');
        if (language == 'es' || language == 'en') {
            this.lang.setValue(language);
        } else {
            this.lang.setValue('en');
        }

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang(this.lang.value);
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(this.lang.value);

        // Cargo del localStorage los datos de nodos usados
        let local = localStorage.getItem('kongNodes');
        if (local) {
            local = atob(local);
            this.node_list = local.split(',');
        }
        // El último nodo al que conecté lo pongo por defecto
        let last = localStorage.getItem('kongLastNode');
        if (last) {
            last = atob(last);
            // Pongo el valor
            this.formNodes.setValue({node: last});
            this.globals.NODE_API_URL = last;
            // Voy a la página inicial
        }
    }

    ngOnInit(): void {
        this.dialogHelper.addEditRoute(null)
            .then(() => { })
            .catch(error => {});
    }

    ngOnDestroy(): void {
    }

    /*
        Conecta al nodo de Kong, pidiendo su información básica
     */
    connectToNode() {
        if (this.formNodes.invalid) {
            return;
        }

        // Recojo el valor
        let node = this.nodeField.value;
        node = node.replace(new RegExp('/$'), '');

        // Guardo el nodo como valor para conectar
        this.globals.NODE_API_URL = node;

        // Conecto al nodo de Kong elegido
        this.api.getNodeInformation()
            .subscribe(res => {
                // Si ha ido bien la conexión guardo como nodo esta url
                if (!this.node_list.includes(node)) {
                    this.node_list.push(node);
                    localStorage.setItem('kongNodes', btoa(this.node_list.join(',')));
                }
                localStorage.setItem('kongLastNode', btoa(node));
                this.toast.success('header.node_connected', '', {msgExtra: node});

                // Aviso del cambio de nodo
                this.nodeWatcher.changeNode(node);

                // Voy a la página de información de nodos
                this.route.navigate(['/node-information']);
            }, error => {
                this.toast.error('error.node_connection');
            });
    }

    changeLang(newLang: string) {
        this.lang.setValue(newLang);
        this.translate.use(this.lang.value);
        localStorage.setItem('language', this.lang.value);
    }

    isConnectedToNode() {
        return this.globals.NODE_API_URL !== '';
    }

    isElementRouteActive() {
        if (this.route.url === '/element-service' || this.route.url === '/element-route' || this.route.url === '/element-upstream' || this.route.url === '/element-consumer') {
            return 'active-route';
        } else {
            return '';
        }
    }

    isCertificateRouteActive() {
        return '';
    }

    // getter para acceder de forma más sencilla al campo
    get nodeField() { return this.formNodes.get('node'); }

    /*
        Prevent backspace navigate back in browser
     */
    @HostListener('document:keydown', ['$event'])
    onKeyDown(evt: KeyboardEvent) {
        if (evt.key === 'Backspace') {
            let doPrevent = true;
            const types = ['text', 'password', 'file', 'search', 'email', 'number', 'date', 'color', 'datetime', 'datetime-local', 'month', 'range', 'search', 'tel', 'time', 'url', 'week'];
            const target = (<HTMLInputElement>evt.target);

            const disabled = target.disabled || (<HTMLInputElement>event.target).readOnly;
            if (!disabled) {
                if (target.isContentEditable) {
                    doPrevent = false;
                } else if (target.nodeName === 'INPUT') {
                    let type = target.type;
                    if (type) {
                        type = type.toLowerCase();
                    }
                    if (types.indexOf(type) > -1) {
                        doPrevent = false;
                    }
                } else if (target.nodeName === 'TEXTAREA') {
                    doPrevent = false;
                }
            }
            if (doPrevent) {
                evt.preventDefault();
                return false;
            }
        }
    }
}


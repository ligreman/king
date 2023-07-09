import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {DialogAboutComponent} from './components/dialog-about/dialog-about.component';
import {ApiService} from './services/api.service';
import {GlobalsService} from './services/globals.service';
import {NodeService} from './services/node.service';
import {ToastService} from './services/toast.service';
import {DialogSettingsComponent} from "./components/dialog-settings/dialog-settings.component";
import {firstValueFrom} from "rxjs";

@AutoUnsubscribe()
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    lang = new FormControl('');
    openedManual = false;
    showManualText = false;
    manualStyles = {'height': 0, 'top': 0};
    enabledPlugins = [];

    formNodes = this.fb.group({
        node: ['', Validators.required]
    });

    node_list: string[] = [];


    constructor(private translate: TranslateService, private api: ApiService, private globals: GlobalsService, private fb: FormBuilder,
                private toast: ToastService, private route: Router, private nodeWatcher: NodeService, private dialog: MatDialog) {
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
        }

        // Cargo del localStorage los datos del LoopBack
        let loop = localStorage.getItem('kongLoopback');
        if (loop) {
            try {
                loop = atob(loop);
                // Pongo el valor
                this.globals.LOOPBACK = JSON.parse(loop);
            } catch (e) {
                this.toast.error('error.load_loopback')
            }
        }
    }

    // GETTERS
    get nodeField() {
        return this.formNodes.get('node');
    }

    ngOnInit(): void {
        const confFile = localStorage.getItem('kongConfigFileUrl');
        if (confFile !== undefined && confFile !== null && confFile !== '') {
            this.globals.CONFIG_URL = confFile;
        }

        // Get config
        this.loadConfig().then(value => {
            if (value !== null) {
                this.globals.NODE_API_URL = value['kongNodeUrl'];
            }

            // TODO si está loopback activo, abro la pantalla de setting para que metas las credenciales y conectes
            // Conecto al nodo y si no lo consigo voy a landing
            if (this.globals.NODE_API_URL !== '' && this.globals.ROUTER_MODE === '') {
                this.api.getNodeInformation()
                    .subscribe({
                        next: (res) => {
                            this.globals.ROUTER_MODE = res['configuration']['router_flavor'];
                            this.connectToNode();
                        }, error: () => this.route.navigate(['/landing'])
                    });
            }
        });
    }

    ngOnDestroy(): void {
    }

    async loadConfig() {
        let config = null, cfg = undefined;
        try {
            if (this.globals.CONFIG_URL !== '') {
                cfg = await firstValueFrom(this.api.getConfig());
            }
        } catch (e) {
        }

        // If not found online, try to get local
        if (cfg === undefined || cfg === null) {
            cfg = localStorage.getItem('kongConfig');
            if (cfg !== undefined && cfg !== null && cfg !== '') {
                config = JSON.parse(atob(cfg));
            }
        } else {
            config = cfg;
            // Save in local too
            localStorage.setItem('kongConfig', btoa(JSON.stringify(cfg)));
        }

        return config;
    }

    connectSettings() {
        const dialogRef = this.dialog.open(DialogSettingsComponent, {
            minWidth: '80vw',
            minHeight: '50vh',
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result !== null && result !== 'null') {
            } else {
            }
        });
    }

    /**
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
            .subscribe({
                next: (res) => {
                    // Si ha ido bien la conexión guardo como nodo esta url
                    if (!this.node_list.includes(node)) {
                        this.node_list.push(node);
                        localStorage.setItem('kongNodes', btoa(this.node_list.join(',')));
                    }
                    localStorage.setItem('kongLastNode', btoa(node));
                    this.toast.success('header.node_connected', '', {msgExtra: node});

                    // Aviso del cambio de nodo
                    this.nodeWatcher.changeNode(node);

                    // Recojo los plugins activos para habilitar las secciones
                    this.enabledPlugins = res['plugins']['enabled_in_cluster'];

                    // Modo del router
                    this.globals.ROUTER_MODE = res['configuration']['router_flavor'];

                    // Voy a la página de información de nodos
                    this.route.navigate(['/node-information']);
                }, error: (error) => this.toast.error('error.node_connection')
            });
    }

    /**
     Cambia el idioma
     */
    changeLang(newLang: string) {
        this.lang.setValue(newLang);
        this.translate.use(this.lang.value);
        localStorage.setItem('language', this.lang.value);
    }

    /**
     Muestra u oculta el manual de usuario
     */
    toggleManual() {
        // Si voy a mostrar el manual
        if (!this.openedManual) {
            this.openedManual = !this.openedManual;

            const body = document.getElementById('body-container');
            const footer = document.getElementById('footer-container');
            this.manualStyles.height = (body.offsetHeight - footer.offsetHeight);

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            // if any scroll is attempted, set this to the previous value
            window.onscroll = () => {
                window.scrollTo(scrollLeft, scrollTop);
            };

            // Animation for manual open
            setTimeout(() => {
                this.showManualText = true;
            }, 100);
        } else {
            this.showManualText = false;

            // Reset scroll
            window.onscroll = () => {
            };

            // Animation for manual close
            setTimeout(() => {
                this.openedManual = !this.openedManual;
            }, 500);
        }
    }

    /**
     Scroll hacia un elemento
     */
    scrollTo(element) {
        element.scrollIntoView();
    }

    /**
     Comprueba si estamos conectados a un nodo o no
     */
    isConnectedToNode() {
        return this.globals.NODE_API_URL !== '';
    }

    /**
     Comprueba si estamos en la ruta de elementos
     */
    isElementRouteActive() {
        if (this.route.url === '/element-service' || this.route.url === '/element-route' || this.route.url === '/element-upstream') {
            return 'active-route';
        } else {
            return '';
        }
    }

    /**
     Comprueba si estamos en la ruta de certificados
     */
    isCertificateRouteActive() {
        if (this.route.url === '/certificate-sni' || this.route.url === '/certificate-cert' || this.route.url === '/certificate-cacert') {
            return 'active-route';
        } else {
            return '';
        }
    }

    /**
     * Comprueba si estamos en la ruta de control de acceso
     */
    isAccessControlRouteActive() {
        if (this.route.url === '/element-consumer' || this.route.url === '/access-acls' || this.route.url === '/') {
            return 'active-route';
        } else {
            return '';
        }
    }

    /**
     * Comprueba que un plugin esté activo
     * @param plugin Nombre del plugin
     */
    isPluginActive(plugin) {
        return this.enabledPlugins.includes(plugin);
    }

    /*
        Prevent backspace navigate back in browser
     */
    @HostListener('document:keydown', ['$event'])
    onKeyDown(evt: KeyboardEvent) {
        if (evt.key === 'Backspace') {
            let doPrevent = true;
            const types = ['text', 'password', 'file', 'search', 'email', 'number', 'date', 'color', 'datetime', 'datetime-local', 'month', 'range', 'search', 'tel', 'time', 'url', 'week'];
            const target = (evt.target as HTMLInputElement);

            const disabled = target.disabled || (event.target as HTMLInputElement).readOnly;
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

    showAbout() {
        this.dialog.open(DialogAboutComponent, {});
    }
}


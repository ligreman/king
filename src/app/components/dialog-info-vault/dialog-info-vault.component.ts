import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-vault',
    templateUrl: './dialog-info-vault.component.html',
    styleUrls: ['./dialog-info-vault.component.scss'],
    standalone: false
})
export class DialogInfoVaultComponent implements OnInit, OnDestroy {
    vault;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public vaultId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recojo los datos del api
        this.api.getVault(this.vaultId)
            .subscribe({
                next: (vault) => {
                    this.vault = vault;
                },
                error: (error) => this.toast.error_general(error)
                , complete: () => this.loading = false
            });
    }

    ngOnDestroy(): void {
    }

    drawConfigs(txt) {
        if (txt === null || txt === undefined) {
            return [''];
        }

        let res = [];
        const d = Object.getOwnPropertyNames(txt);

        for (const i of d) {
            res.push(i + ': ' + txt[i]);
        }

        return res;
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.vault, null, 2)], {type: 'text/json'});
        saveAs(blob, 'vault_' + this.vaultId + '.json');
    }
}

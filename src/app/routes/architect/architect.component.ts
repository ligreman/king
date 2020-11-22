import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSet, Network } from 'vis-network/standalone';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-architect',
    templateUrl: './architect.component.html',
    styleUrls: ['./architect.component.scss']
})
export class ArchitectComponent implements OnInit {

    constructor(private api: ApiService, private route: Router, private toast: ToastService) {
        // Compruebo la conexión al nodo
        this.api.getNodeStatus()
            .subscribe(value => {
                },
                error => {
                    this.toast.error('error.node_connection');
                    this.route.navigate(['/landing']);
                });
    }

    ngOnInit(): void {
        // create an array with nodes
        const nodes = new DataSet([
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ]);

        // create an array with edges
        // @ts-ignore
        const edges = new DataSet([
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5},
            {from: 3, to: 3}
        ]);

        // create a network
        const container = document.getElementById('node-network');
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {};
        const network = new Network(container, data, options);
    }

}

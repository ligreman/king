import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NodeService {
    // Observable sources
    private nodeChangedSource = new Subject<string>();

    // Observable streams
    nodeChanged$ = this.nodeChangedSource.asObservable();

    // Service message commands
    changeNode(node: string) {
        this.nodeChangedSource.next(node);
    }
}

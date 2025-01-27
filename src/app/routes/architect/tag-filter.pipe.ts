import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'tagFilter',
    standalone: false
})
export class TagFilterPipe implements PipeTransform {

  transform(items: string[], showClusters: boolean): unknown {
      return items.filter(item => item.startsWith('c-') === showClusters);
  }

}

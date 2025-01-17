import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {firstValueFrom, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {GlobalsService} from './globals.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private httpClient: HttpClient, private globals: GlobalsService) {
    }

    /*
      Manage the errors
     */
    handleError(error: HttpErrorResponse) {
        let errorMessage;
        if (error['error']['message']) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Code: ${error.status}. Error: ${error.message}`;
        }
        return throwError({code: error.status, message: errorMessage});
    }

    parseOffsetAndTags(offset, tags = null, tagsAnd = true) {
        let offsetQuery = '';
        if (offset !== null) {
            offsetQuery = '&offset=' + offset;
        }

        let tagsQuery = '';
        if (tags !== null && tags.length > 0) {
            let tt = [];
            tags.forEach(t => {
                if (t !== '') {
                    tt.push(t);
                }
            });

            if (tt.length > 0) {
                if (tagsAnd) {
                    tagsQuery = '&tags=' + tt.join(',');
                } else {
                    tagsQuery = '&tags=' + tt.join('/');
                }
            }
        }
        return {offsetQuery, tagsQuery};
    }

    cherrypickData(data, fields = []) {
        let r = [];
        for (const d in data) {
            let elem = {};
            fields.forEach(field => {
                elem[field] = data[d][field];
            });
            r.push(elem);
        }
        return r;
    }

    /*
        NODES ENDPOINTS
     */
    public getNodeInformation() {
        // return this.httpClient.get(this.globals.NODE_API_URL + '/', {headers: {'apikey': '12345'}}).pipe(catchError(this.handleError));
        return this.httpClient.get(this.globals.NODE_API_URL + '/').pipe(catchError(this.handleError));
    }

    public getNodeStatus() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/status').pipe(catchError(this.handleError));
    }

    /*
        GENERAL ENDPOINTS
     */
    public getConfiguration() {
        return this.httpClient.get(this.globals.CONFIG_URL).pipe(catchError(this.handleError));
    }

    /*
        TAGS ENDPOINTS
     */
    public getTags() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/tags').pipe(catchError(this.handleError));
    }

    /*
        SERVICE ENDPOINTS
     */
    public getServices(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/services?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getService(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/services/' + id).pipe(catchError(this.handleError));
    }

    public postNewService(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/services', body).pipe(catchError(this.handleError));
    }

    public patchService(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/services/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteService(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/services/' + id).pipe(catchError(this.handleError));
    }

    async getAllServices(offset = null, results = [], fields = [], tags = null, tagsAnd = true) {
        try {
            const page = await firstValueFrom(this.getServices(1000, offset, tags, tagsAnd));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllServices(page['offset'], results, fields, tags, tagsAnd);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }

    /*
        ROUTE ENDPOINTS
     */
    public getRoutes(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/routes?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getRoute(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/routes/' + id).pipe(catchError(this.handleError));
    }

    public postNewRoute(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/routes', body).pipe(catchError(this.handleError));
    }

    public patchRoute(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/routes/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteRoute(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/routes/' + id).pipe(catchError(this.handleError));
    }

    async getAllRoutes(offset = null, results = [], fields = [], tags = null, tagsAnd = true) {
        try {
            const page = await firstValueFrom(this.getRoutes(1000, offset, tags, tagsAnd));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllRoutes(page['offset'], results, fields, tags, tagsAnd);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }

    /*
        UPSTREAMS ENDPOINTS
     */
    public getUpstreams(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getUpstream(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams/' + id).pipe(catchError(this.handleError));
    }

    public getUpstreamHealth(id: string) {
        let params = new HttpParams().set('balancer_health', '1');
        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams/' + id + '/health', {params: params}).pipe(catchError(this.handleError));
    }

    public getUpstreamTargetsHealth(id: string, size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams/' + id + '/health?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public postNewUpstream(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/upstreams', body).pipe(catchError(this.handleError));
    }

    public patchUpstream(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/upstreams/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteUpstream(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/upstreams/' + id).pipe(catchError(this.handleError));
    }

    async getAllUpstreams(offset = null, results = [], fields = [], tags = null, tagsAnd = true) {
        try {
            const page = await firstValueFrom(this.getUpstreams(1000, offset, tags, tagsAnd));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllUpstreams(page['offset'], results, fields, tags, tagsAnd);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }


    /*
        VAULT ENDPOINTS
     */
    public getVaults(size: number = 1000, offset: string | null = null) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset);

        return this.httpClient.get(this.globals.NODE_API_URL + '/vaults?sort_desc=1&size=' + size + offsetQuery).pipe(catchError(this.handleError));
    }

    public getVault(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/vaults/' + id).pipe(catchError(this.handleError));
    }

    public postNewVault(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/vaults', body).pipe(catchError(this.handleError));
    }

    public patchVault(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/vaults/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteVault(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/vaults/' + id).pipe(catchError(this.handleError));
    }

    /*
        CONSUMERS ENDPOINTS
     */
    public getConsumers(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getConsumer(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers/' + id).pipe(catchError(this.handleError));
    }

    public postNewConsumer(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumers', body).pipe(catchError(this.handleError));
    }

    public patchConsumer(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/consumers/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteConsumer(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumers/' + id).pipe(catchError(this.handleError));
    }

    async getAllConsumers(offset = null, results = [], fields = [], tags = null, tagsAnd = true) {
        try {
            const page = await firstValueFrom(this.getConsumers(1000, offset, tags, tagsAnd));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllConsumers(page['offset'], results, fields, tags, tagsAnd);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }

    /*
        TARGET ENDPOINTS
     */
    public getTargets(upstreamId: string, size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);
        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public postNewTarget(body, upstreamId: string) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets', body).pipe(catchError(this.handleError));
    }

    public deleteTarget(id: string, upstreamId: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets/' + id).pipe(catchError(this.handleError));
    }

    public putSetTargetHealthy(id: string, upstreamId: string) {
        return this.httpClient.put(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets/' + id + '/healthy', {}).pipe(catchError(this.handleError));
    }

    public putSetTargetUnhealthy(id: string, upstreamId: string) {
        return this.httpClient.put(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets/' + id + '/unhealthy', {}).pipe(catchError(this.handleError));
    }

    public putSetAddressHealthy(id: string, upstreamId: string, address: string) {
        return this.httpClient.put(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets/' + id + '/' + address + '/healthy', {}).pipe(catchError(this.handleError));
    }

    public putSetAddressUnhealthy(id: string, upstreamId: string, address: string) {
        return this.httpClient.put(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets/' + id + '/' + address + '/unhealthy', {}).pipe(catchError(this.handleError));
    }

    async getAllTargets(upId, offset = null, results = [], fields = []) {
        try {
            const page = await firstValueFrom(this.getTargets(upId, 1000, offset));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllTargets(page['offset'], results, fields);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }


    /*
       CERTIFICATE ENDPOINTS
    */
    public getCertificates(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/certificates?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getCertificate(certId: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/certificates/' + certId).pipe(catchError(this.handleError));
    }

    public postNewCertificate(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/certificates', body).pipe(catchError(this.handleError));
    }

    public patchCertificate(certId: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/certificates/' + certId, body).pipe(catchError(this.handleError));
    }

    public deleteCertificate(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/certificates/' + id).pipe(catchError(this.handleError));
    }

    async getAllCertificates(offset = null, results = [], fields = []) {
        try {
            const page = await firstValueFrom(this.getCertificates(1000, offset));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllCertificates(page['offset'], results, fields);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }


    /*
       CA CERTIFICATE ENDPOINTS
    */
    public getCACertificates(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/ca_certificates?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getCACertificate(certId: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/ca_certificates/' + certId).pipe(catchError(this.handleError));
    }

    public postNewCACertificate(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/ca_certificates', body).pipe(catchError(this.handleError));
    }

    public patchCACertificate(certId: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/ca_certificates/' + certId, body).pipe(catchError(this.handleError));
    }

    public deleteCACertificate(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/ca_certificates/' + id).pipe(catchError(this.handleError));
    }

    async getAllCACertificates(offset = null, results = [], fields = []) {
        try {
            const page = await firstValueFrom(this.getCACertificates(1000, offset));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllCACertificates(page['offset'], results, fields);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }


    /*
       SNI ENDPOINTS
    */
    public getSnis(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);
        return this.httpClient.get(this.globals.NODE_API_URL + '/snis?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getSni(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/snis/' + id).pipe(catchError(this.handleError));
    }

    public postNewSni(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/snis', body).pipe(catchError(this.handleError));
    }

    public patchSni(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/snis/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteSni(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/snis/' + id).pipe(catchError(this.handleError));
    }

    async getAllSnis(offset = null, results = [], fields = []) {
        try {
            const page = await firstValueFrom(this.getSnis(1000, offset));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllSnis(page['offset'], results, fields);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }

    /*
        PLUGIN ENDPOINTS
     */
    public getPlugins(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);
        return this.httpClient.get(this.globals.NODE_API_URL + '/plugins?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getPlugin(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/plugins/' + id).pipe(catchError(this.handleError));
    }

    public getPluginsEnabled() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/plugins/enabled?sort_desc=1&size=1000').pipe(catchError(this.handleError));
    }

    public postNewPlugin(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/plugins', body).pipe(catchError(this.handleError));
    }

    public patchPlugin(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/plugins/' + id, body).pipe(catchError(this.handleError));
    }

    public enablePlugin(id: string, enable: boolean) {
        const body = {
            enabled: enable
        };
        return this.httpClient.patch(this.globals.NODE_API_URL + '/plugins/' + id, body).pipe(catchError(this.handleError));
    }

    public deletePlugin(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/plugins/' + id).pipe(catchError(this.handleError));
    }

    public getPluginSchema(plugin: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/schemas/plugins/' + plugin).pipe(catchError(this.handleError));
    }

    async getAllPlugins(offset = null, results = [], fields = [], tags = null, tagsAnd = true) {
        try {
            const page = await firstValueFrom(this.getPlugins(1000, offset, tags, tagsAnd));

            if (fields.length > 0) {
                results.push(...this.cherrypickData(page['data'], fields));
            } else {
                results.push(...page['data']);
            }

            // is there more data?
            if (page['offset'] !== null && page['offset'] !== undefined) {
                return this.getAllPlugins(page['offset'], results, fields, tags, tagsAnd);
            } else {
                return {data: results, total: results.length};
            }
        } catch (err) {
            throw err;
        }
    }

    /*
        ACL PLUGIN
     */
    public getAcls(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);
        return this.httpClient.get(this.globals.NODE_API_URL + '/acls?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getConsumerAcls(consumer: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers/' + consumer + '/acls').pipe(catchError(this.handleError));
    }

    public postConsumerAcl(consumer: string, body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumers/' + consumer + '/acls', body).pipe(catchError(this.handleError));
    }

    public getAclConsumer(aclId) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/acls/' + aclId + '/consumer').pipe(catchError(this.handleError));
    }

    public deleteConsumerAcl(consumer: string, acl: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumers/' + consumer + '/acls/' + acl).pipe(catchError(this.handleError));
    }

    /*
        BASIC AUTH PLUGIN
     */
    public getBasicAuths(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/basic-auths?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getConsumerBasicAuths(consumer: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers/' + consumer + '/basic-auth').pipe(catchError(this.handleError));
    }

    public postConsumerBasicAuth(consumer: string, body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumers/' + consumer + '/basic-auth', body).pipe(catchError(this.handleError));
    }

    public deleteConsumerBasicAuth(consumer: string, key: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumers/' + consumer + '/basic-auth/' + key).pipe(catchError(this.handleError));
    }

    /*
        API KEY PLUGIN
     */
    public getApiKeys(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/key-auths?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getConsumerApiKeys(consumer: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers/' + consumer + '/key-auth').pipe(catchError(this.handleError));
    }

    public postConsumerApiKey(consumer: string, body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumers/' + consumer + '/key-auth', body).pipe(catchError(this.handleError));
    }

    public deleteConsumerApiKey(consumer: string, key: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumers/' + consumer + '/key-auth/' + key).pipe(catchError(this.handleError));
    }


    /*
        JWT TOKEN PLUGIN
     */
    public getJwtTokens(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/jwts?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getConsumerJwtTokens(consumer: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers/' + consumer + '/jwt').pipe(catchError(this.handleError));
    }

    public postConsumerJwtTokens(consumer: string, body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumers/' + consumer + '/jwt', body).pipe(catchError(this.handleError));
    }

    public deleteConsumerJwtToken(consumer: string, token: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumers/' + consumer + '/jwt/' + token).pipe(catchError(this.handleError));
    }


    /*
        OAUTH 2.0 AUTHENTICATION PLUGIN
     */
    public getOAuthApp(size: number = 1000, offset: string | null = null, tags = null, tagsAnd = true) {
        const {offsetQuery, tagsQuery} = this.parseOffsetAndTags(offset, tags, tagsAnd);

        return this.httpClient.get(this.globals.NODE_API_URL + '/oauth2?sort_desc=1&size=' + size + offsetQuery + tagsQuery).pipe(catchError(this.handleError));
    }

    public getConsumerOAuthApp(consumer: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumers/' + consumer + '/oauth2').pipe(catchError(this.handleError));
    }

    public postConsumerOAuthApp(consumer: string, body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumers/' + consumer + '/oauth2 ', body).pipe(catchError(this.handleError));
    }

    public deleteConsumerOAuthApp(consumer: string, token: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumers/' + consumer + '/oauth2/' + token).pipe(catchError(this.handleError));
    }
}

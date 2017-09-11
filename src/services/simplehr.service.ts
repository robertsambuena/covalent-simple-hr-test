import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService, RESTService } from '@covalent/http';
import { MOCK_API } from '../config/api.config';

@Injectable()

export class SimplehrService {

  constructor(private http: Http) {

  }

  query() {
    var options = new RequestOptions({
      headers: new Headers({
        'content-type': 'application/json',
        'authorization': 'Basic YWRtaW46UGEkJHcwcmQ='
      })
    });

    return this.http.get('https://labs.simplicityengine.net:9083/user', options)
    .map((res: Response) => {
      return res.json();
    });
  }

  failedQuery() {
    return this.http.get('data/people.json')
    .map((res: Response) => {
      return res.json();
    });
  }

  delete(id) {
    return this.http.delete('https://labs.simplicityengine.net:9083/user/' + id)
    .map((res: Response) => {
      return res.json();
    });
  }

  failedDelete(id) {
    return this.http.get('data/people.json')
    .map((res: Response) => {
      return {
        status: 'SUCCESS',
        error: 'OK',
        id: id
      };
    });
  }
}

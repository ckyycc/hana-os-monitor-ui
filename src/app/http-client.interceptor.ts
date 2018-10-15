import {Injectable} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { isDevMode } from '@angular/core';

@Injectable()
export class HttpClientInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // let secureReq = null;
    // if (isDevMode()) {
    //   //in production, angular integrated to expressjs, do not need clone request.
    //   if (!request.url.includes("/assets/i18n")) {
    //     secureReq = request.clone({
    //       url: `https://VANN00592391A.amer.global.corp.sap:4433/${request.url}`, //.replace('http://', 'https://'),
    //       // url: `https://llbpal91.pal.sap.corp:4433/${request.url}`, //.replace('http://', 'https://'),
    //       headers: request.headers.set('Content-Type', 'application/json')
    //     });
    //   } else {
    //     secureReq = request;
    //   }
    // } else {
    //   secureReq = request;
    // }
    // let secureReq = request.clone({
    //   headers: request.headers.set('Content-Type', 'application/json')
    // });

    // handle error
    return next.handle(request).catch((err: HttpErrorResponse) => {
      let errorMessage;
      if (err.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        errorMessage = err.error.message;
        console.error('An error occurred:', err.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        if (err.status == 0) {
          errorMessage = `(${err.status})undefined error.`;
        } else {
          errorMessage = err.error ? `(${err.status}):${err.error}` : `(${err.status})`;
        }
        console.error(`Backend returned code ${err.status}, body was: ${err}`);
      }

      return Observable.throwError(`${errorMessage}`);
    });
  }
}

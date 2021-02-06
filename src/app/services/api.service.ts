import { Injectable } from '@angular/core';

import { environment } from'./../../environments/environment';

import { HttpClient } from'@angular/common/http';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { Storage } from '@ionic/storage'
import { Platform } from '@ionic/angular';

const JWT_KEY = 'jwt_token';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private user = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private platform: Platform
    ) { 

      this.platform.ready().then( () =>{
        this.storage.get(JWT_KEY).then( (data) =>{
          if(data){
            console.log('Storage JWT_KEY', data);
            this.user.next(data);
          }
        })
      })

    }

  signIn( username, password){
    return this.http.post(environment.authUrl + 'token', { username, password}).pipe(
      switchMap( (data) => {
        console.log('signIn token ', data)
        return from(this.storage.set(JWT_KEY, data));
      }),
      tap( (data) =>{
        this.user.next(data)
      })
    )
  }

  getCurrentUser(){
    return this.user.asObservable();
  }

  logout(){
    this.storage.remove(JWT_KEY).then( () =>{
      this.user.next(null);
    })
  }

  getPosts(page = 1, categoryId = null, search = ''): Observable<any>{

    const options = {
      observe: "response" as "body",
      params: {
        per_page: '2',
        page: '' + page
      }
    };
    let url = environment.apiUrl + 'posts?_embed'

    console.log('URL : ', url)
    if(categoryId){
      url += '&categories=' + categoryId;
    }

    if (search != ''){
      url += '&search=' + search;
    }

    return this.http.get(url, options).pipe(
      map( (res) => {
        const data = res['body'];

        for (let post of data){
          if(post['_embedded']['wp:featuredmedia']){
            post.media_url = post['_embedded']['wp:featuredmedia'][0]['media_details'].sizes['medium'].source_url;
          }
        }

        return {
          posts: data,
          pages: res['headers'].get('x-wp-totalpages'),
          totalPosts: res['headers'].get('x-wp-total')

        }

      })
    )

  }

  getPostContent(id){
    return this.http.get<any>(environment.apiUrl + 'posts/' + id + '?_embed').pipe(
      map( (post) => {
        if(post['_embedded']['wp:featuredmedia']){
          post.media_url = post['_embedded']['wp:featuredmedia'][0]['media_details'].sizes['medium'].source_url;
        }
        return post;
      })
    )
  }

  getCategories(){
    return this.http.get<any>(environment.apiUrl + 'categories').pipe(
      map( (res) =>{
        
        const items= [];

        for(let item of res){
          if(item.count == 0) continue;
          items.push({
            id: item.id,
            name: item.name,
            slug: item.slug,
            count: item.count
          });
        }

        return items;
      })
    )
  }

  getPages(){
    return this.http.get<any>(environment.apiUrl + 'pages').pipe(
      map( (res) =>{
        
        const matches = [12,10,3,2];

        const items = [];

        for(let item of res){
          if( !matches.includes(item.id) ) continue;
          items.push({
            url: 'page/' + item.id,
            title: item.title.rendered,
            icon: 'file-tray',
          });
        }

        return items;
      })
    )
  }

  getPageContent(id){
    return this.http.get<any>(environment.apiUrl + 'pages/' + id + '?_embed').pipe(
      map( (page) => {
        if(page['_embedded']['wp:featuredmedia']){
          page.media_url = page['_embedded']['wp:featuredmedia'][0]['media_details'].sizes['medium'].source_url;
        }
        return page;
      })
    )
  }

}

import { Component, OnInit } from '@angular/core';
import { ApiService } from './../../services/api.service';
import { LoadingController } from '@ionic/angular';

import { PopoverController } from '@ionic/angular';
import { CategoryFilterPage } from '../category-filter/category-filter.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.page.html',
  styleUrls: ['./posts.page.scss'],
})
export class PostsPage implements OnInit {

  page = 1;
  totalPosts = 0;
  totalPages = 0;
  posts: any;
  categoryFilter = null;
  searchTerm: string;
  categoryName: string;

  constructor(
    private api: ApiService,
    private loadingCtrl: LoadingController,
    private popOver: PopoverController,
    private router: Router
    ) { }

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts( infiniteScroll = null ){

    let loading = null;

    if (!infiniteScroll){
      loading = await this.loadingCtrl.create({
            message: 'Loading posts...'
      });
      await loading.present();
    }

    // if (infiniteScroll){
    //   infiniteScroll.target.disabled = false
    // }

    this.api.getPosts(this.page, this.categoryFilter, this.searchTerm).subscribe( (res) =>{
      if(infiniteScroll){

        infiniteScroll.target.complete();
        this.posts = [...this.posts, ...res.posts];

        // if(this.page == this.totalPages){
        //   infiniteScroll.target.disabled = true;
        // }

      }
      else{
        this.posts = res.posts;
      }

      this.totalPages = res.pages;
      this.totalPosts = res.totalPosts;
      console.log('loadPosts', res);

      if (!infiniteScroll){

        loading.dismiss();
      }
    }, 
    (err) =>{

      console.log('loadPosts ERROR !', err);

    },
    () =>{

      if(!infiniteScroll){

        loading.dismiss();

      }
    })
  }

  loadMore(e){

    console.log('Loading more...', e);
    if(this.page < this.totalPages){
      
      this.page++;
      this.loadPosts(e);

    }

  }

  async openFilter(e){
    const popover = await this.popOver.create({
      component: CategoryFilterPage,
      event: e,
      translucent: false,
      componentProps:{
        selected: this.categoryFilter
      }
    });
    popover.onDidDismiss().then( (res) => {
      console.log('after popOver : ', res)
      if (res && res.data){
        this.categoryFilter = res.data.id;
        this.categoryName = res.data.name;
        this.loadPosts();
        this.page = 1;
        this.totalPages = 0;
      }
    })
    await popover.present();
  }

  searchChanged(){
    console.log("SearchTerm : ", this.searchTerm);
    this.loadPosts();
    this.page = 1;
  }

  readPost(id){
    this.router.navigateByUrl('/posts/' + id);
  }

}

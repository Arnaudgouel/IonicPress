import { Component, OnInit } from '@angular/core';

import { ApiService } from './../../services/api.service';

import { ActivatedRoute } from '@angular/router';

import { Plugins } from '@capacitor/core';

const { Share } = Plugins;

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.page.html',
  styleUrls: ['./post-details.page.scss'],
})
export class PostDetailsPage implements OnInit {

  post: any;

  constructor(private api: ApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('PostID: ', id);
    this.api.getPostContent(id).subscribe( (res) => {
      console.log('postContent : ', res);
      this.post = res;
    })
  }

  async sharePost(){
    let shareRet = await Share.share({
      title: this.post.title.rendered,
      text: 'Check this amazing post',
      url: this.post.link,
      dialogTitle: 'Share with buddies'
    });
  }

}

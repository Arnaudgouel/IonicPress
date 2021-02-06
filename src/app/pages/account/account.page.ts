import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonSlides, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  @ViewChild('sliderRef', { static: true }) slides: IonSlides;  

  userForm: FormGroup;
  user = this.api.getCurrentUser();
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  lockedSlides: boolean;
  userDetails = {
    email: '',
    username: '',
  };

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private storage: Storage,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    console.log('User :', this.user);
    this.user.subscribe( (res) =>{
      if(res){
        console.log('Connected');
        console.log('res user subscribe: ', res.user_email);
        this.userDetails.email = res.user_email;
        this.userDetails.username = res.user_nicename;
        this.slides.lockSwipes(false).then( () =>{
          this.lockedSlides = false;
        });
      }
      else{
        console.log('Disconnected');
        this.userDetails.email = '';
        this.userDetails.username = '';
        this.slides.lockSwipes(true).then( () =>{
          this.lockedSlides = true;
        });
      }
      console.log('User subscribe: ', res);
      
    })
    // this.checkUserConnected();
  }

  login(){
    console.log('username : ', this.userForm.value.username);
    console.log('password : ', this.userForm.value.password);
    this.api.signIn(this.userForm.value.username, this.userForm.value.password).subscribe( (res) =>{
      console.log('login success ', res)
    },
    async (err) =>{
      const alert = await this.alertCtrl.create(
        {
          header: 'ERROR',
          subHeader: err.error.data.status,
          message: err.error.message,
          buttons: ['OK']
        }
      );
      await alert.present();
    })
  }

  logout(){
    this.api.logout();
  }

  slideDidChange(e){
    console.log('Slide changed', e);
    if(this.lockedSlides){
      this.presentToast();
    }
  }

  async checkUserConnected(){
    if(await this.user){
      console.log('Connected');
    }
    else{
      console.log('Disconnected');
    }
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'You have to be connected to swipe',
      duration: 2000
    });
    toast.present();
  }
}
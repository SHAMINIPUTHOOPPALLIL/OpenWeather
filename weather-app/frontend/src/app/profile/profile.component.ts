import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services';
import { User } from '../_models';

@Component({ templateUrl: 'profile.component.html' })
export class ProfileComponent implements OnInit {
    currentUser: User;
    profileForm: FormGroup;

    constructor(private authenticationService: AuthenticationService, private formBuilder: FormBuilder) { 
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);       
    }

    ngOnInit() {
        this.profileForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required]            
        });
    }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  username = 'adimin';
  role = 'role';
  open: boolean = true;
  closeBtn() {
    this.open = !this.open;
  }
  isLoggedIn: boolean = false; // To track menu state

  // Function to toggle menu state
  toggleMenu() {
    this.isLoggedIn = !this.isLoggedIn;
    console.log('Menu state:', this.isLoggedIn);
}
}
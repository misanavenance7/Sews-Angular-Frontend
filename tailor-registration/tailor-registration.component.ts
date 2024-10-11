import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TailorRegistrationService } from '../../service/tailor-registration.service';

@Component({
  selector: 'app-tailor-registration',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  imports: [
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './tailor-registration.component.html',
  styleUrls: ['./tailor-registration.component.css'],
})
export class TailorRegistrationComponent implements OnInit {

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  passport_size: File | null = null; // Initialize as null

  private _formBuilder = inject(FormBuilder);

  constructor(private fb: FormBuilder, private router: Router, private gqlService: TailorRegistrationService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required],
      national_id_number: ['', Validators.required],
    });

    this.secondFormGroup = this._formBuilder.group({
      sex: ['', Validators.required],
      area_of_residence: ['', Validators.required],
      area_of_work: ['', Validators.required],
      passport_size: [null, Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement; // Type assertion for better clarity
    if (target.files && target.files.length) {
      this.passport_size = target.files[0]; // Assign the first selected file
      const reader = new FileReader();
      reader.readAsDataURL(this.passport_size!);

      reader.onload = () => {
        this.secondFormGroup.patchValue({
          passport_size: reader.result
        });
        
        // Need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    } else {
      this.passport_size = null; // Reset if no files selected
    }
  }

  onSubmit() {


    console.log("test 01")

    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {

      console.log("test 02 inside")
      const formData = new FormData(); // Create FormData instance

      // Append all form values to FormData
      Object.entries({ 
          ...this.firstFormGroup.value, 
          ...this.secondFormGroup.value, 
          ...this.thirdFormGroup.value 
      }).forEach(([key, value]) => {
        if (typeof value === 'string') {
          formData.append(key, value);
        } else if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          throw new Error(`Unsupported type for value: ${typeof value}`);
        }; // Convert to string if necessary
      });

      console.log("test 03 data inset..")

      // Check if passport_size is not null before appending
      if (this.passport_size) {
          formData.append('passport_size', this.passport_size); // Append the actual file object
      } else {
          console.error('No passport file selected');
          return; // Prevent submission if no file is selected
      }

      console.log("test 05 pas afte")


      console.log('test..01')
      this.gqlService.RegisterTailor(
          this.firstFormGroup.value.full_name,
          this.thirdFormGroup.value.username, 
          this.firstFormGroup.value.email,
          this.firstFormGroup.value.national_id_number,
          this.firstFormGroup.value.phone_number,
          this.secondFormGroup.value.sex,
          this.passport_size.name, // Use file name directly
          this.secondFormGroup.value.area_of_residence,
          this.secondFormGroup.value.area_of_work,
          this.thirdFormGroup.value.password
      ).subscribe(
          (response) => {
              console.log('Registration successful:', response);
              this.router.navigate(['/success']); // Navigate on success
          },
          (error) => {
              console.error('Registration error:', error);
          }
      );
    } else {
        console.error('Form is invalid');
        console.error('First Form Errors:', this.firstFormGroup.errors);
        console.error('Second Form Errors:', this.secondFormGroup.errors);
        console.error('Third Form Errors:', this.thirdFormGroup.errors);
    }
  }
}

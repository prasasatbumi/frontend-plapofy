import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutComponent } from '../../core/components/layout/layout.component';
import { LucideAngularModule, User, Phone, MapPin, Calendar, Save, AlertCircle, ShieldCheck, CreditCard, Banknote, Clock } from 'lucide-angular';
import { ProfileService, CustomerProfile } from '../../core/services/profile.service';
import { Store } from '@ngrx/store';
import { ProfileActions } from '../../core/store/profile/profile.actions';
import { selectUserProfile, selectMissingFields, selectProfileLoading } from '../../core/store/profile/profile.selectors';
import { LoanActions } from '../../core/store/loan/loan.actions';
import { selectAllLoans } from '../../core/store/loan/loan.selectors';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent, LucideAngularModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  // Icons
  readonly User = User;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly Save = Save;
  readonly AlertCircle = AlertCircle;
  readonly CreditCard = CreditCard;
  readonly Banknote = Banknote;
  readonly Clock = Clock;

  // State Selectors
  profile = this.store.selectSignal(selectUserProfile);
  missingFields = this.store.selectSignal(selectMissingFields);
  isLoading = this.store.selectSignal(selectProfileLoading);
  loans = this.store.selectSignal(selectAllLoans);

  activeLoan = computed(() => {
    // Find the first loan that is active (not PAID or REJECTED)
    // Assuming PAID status exists, if not, DISBURSED is the last active state.
    // If we want to show 'DISBURSED' loan as active until paid, we include it.
    return this.loans().find(l => 
        ['SUBMITTED', 'REVIEWED', 'APPROVED', 'DISBURSED'].includes(l.currentStatus)
    );
  });

  // Use same loading for KYC for now, or derive locally if needed. 
  // Since reducer shares 'loading', let's use the main loading selector.
  isKycLoading = this.isLoading;

  profileForm = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    dateOfBirth: [''],
    address: [''],
    bankName: [''],
    bankAccountNumber: ['', Validators.pattern(/^[0-9]+$/)]
  });

  kycForm = this.fb.group({
    ktpImage: [null, Validators.required],
    selfieImage: [null, Validators.required]
  });

  formattedIcon(name: string) {
    if (name === 'ShieldCheck') return ShieldCheck;
    return User;
  }

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.kycForm.patchValue({ [field]: file });
      this.kycForm.get(field)?.updateValueAndValidity();
    }
  }

  submitKyc() {
    if (this.kycForm.invalid) return;

    const formData = new FormData();
    const ktp = this.kycForm.get('ktpImage')?.value;
    const selfie = this.kycForm.get('selfieImage')?.value;

    if (ktp) formData.append('ktpImage', ktp);
    if (selfie) formData.append('selfieImage', selfie);

    this.store.dispatch(ProfileActions.submitKYC({ formData }));
  }

  ngOnInit() {
    this.store.dispatch(ProfileActions.loadProfile());
    this.store.dispatch(ProfileActions.checkCompleteness());
    this.store.dispatch(LoanActions.loadLoans({})); // Load loans to find active one
  }

  constructor() {
    effect(() => {
      const profile = this.profile();
      if (profile) {
        this.profileForm.patchValue({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address,
          bankName: profile.bankName,
          bankAccountNumber: profile.bankAccountNumber
        }, { emitEvent: false });
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    const data = this.profileForm.value;
    this.store.dispatch(ProfileActions.updateProfile({ profile: data as Partial<CustomerProfile> }));
  }
}

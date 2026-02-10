import { Component, signal, computed, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldCheck, Zap, Clock, ChevronRight, Smartphone, Star, Calculator, CheckCircle2 } from 'lucide-angular';
import { PlafondService, Plafond } from '../../core/services/plafond.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans">
      <!-- Navbar -->
      <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-2">
              <img src="/assets/logo.png" alt="Plapofy Logo" class="h-10 w-10 rounded-xl shadow-sm">
              <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Plapofy</span>
            </div>
            <div class="hidden md:flex items-center gap-8 ml-8">
              <a href="#about" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Tentang</a>
              <a href="#calculator" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Simulasi</a>
              <a href="#features" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Keunggulan</a>
              <a href="#faq" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">FAQ</a>
            </div>
            <div class="flex items-center gap-4 ml-auto">
              <button class="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl flex items-center gap-2">
                <lucide-icon [img]="Smartphone" class="w-4 h-4"></lucide-icon>
                Unduh Aplikasi
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            
            <!-- Text Content -->
            <div class="text-center lg:text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wide mb-6">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Tersedia di iOS & Android
              </div>
              <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                Pinjaman Modal Usaha, <br>
                <span class="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Peluang Tak Terbatas.</span>
              </h1>
              <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Solusi pendanaan bisnis hingga <strong>Rp 15 Miliar</strong>. Bunga kompetitif mulai 0.8%, proses digital, dan didukung AI untuk persetujuan cepat.
              </p>
              
              <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button class="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200/50">
                   <lucide-icon [img]="Smartphone" class="w-5 h-5"></lucide-icon>
                   Unduh Aplikasi
                </button>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <div class="flex -space-x-2">
                        <div class="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                        <div class="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div class="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    </div>
                    <span>Dipercaya 10rb+ pengguna</span>
                </div>
              </div>
            </div>

            <!-- Visual Content -->
            <div class="relative lg:h-[600px] flex items-center justify-center">
                <!-- Background Decorative Blobs -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-[400px] h-[400px] bg-teal-100 rounded-full blur-3xl opacity-50"></div>
                
                <!-- Mascot Image (Using Celebration/Hero Variant) -->
                 <img src="/assets/celebrate.png" alt="Plapofy Mascot Celebration" class="relative z-10 w-full max-w-md drop-shadow-2xl hover:scale-105 transition-transform duration-500 mix-blend-multiply">
                 

            </div>

          </div>
        </div>
      </section>

      <!-- Brand Story & Mascot Section (New) -->
      <section id="about" class="py-24 bg-blue-50/50 border-b border-gray-100 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row items-center gap-16 relative">
                <!-- Mascot Container with corrected spacing/z-index -->
                <div class="w-full md:w-1/3 flex justify-center relative z-10">
                    <div class="relative group cursor-pointer p-8"> 
                        <div class="absolute inset-0 bg-teal-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity scale-75"></div>
                        <img src="/assets/celebrate.png" alt="Plapofy Mascot" class="relative z-20 w-56 h-auto object-contain transition-transform transform group-hover:rotate-6 hover:scale-110 duration-300 drop-shadow-xl">
                        
                        <!-- Floating Badge -->
                        <div class="absolute bottom-4 right-4 z-30 bg-white px-4 py-2 rounded-2xl shadow-lg border border-gray-100 transform rotate-3 group-hover:rotate-0 transition-all">
                            <p class="text-xs font-bold text-teal-600 flex items-center gap-1">
                                Hi, I'm Platy! <span class="text-lg">👋</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/3">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wide mb-4">
                        Kenalan Yuk!
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Apa itu <span class="text-blue-600">Plapofy</span>?</h2>
                    <p class="text-gray-600 text-lg leading-relaxed mb-6">
                        Nama <strong>Plapofy</strong> diambil dari gabungan kata <strong>"Plafond"</strong> dan <strong>"Friendly"</strong>. 
                        Kami hadir untuk memberikan limit pinjaman (plafond) yang bersahabat, transparan, dan tidak mencekik leher.
                    </p>
                    <div class="grid sm:grid-cols-2 gap-6">
                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <lucide-icon [img]="CheckCircle2" class="w-5 h-5 text-blue-500"></lucide-icon> Filosofi Kami
                            </h4>
                            <p class="text-sm text-gray-500">Teman finansial yang "Friendly". Bunga wajar, tanpa biaya siluman, dan penagihan yang manusiawi.</p>
                        </div>
                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <lucide-icon [img]="Zap" class="w-5 h-5 text-teal-500"></lucide-icon> Maskot Kami
                            </h4>
                            <p class="text-sm text-gray-500">Si <strong>Platy</strong> (Platypus). Unik dan adaptif! Bisa berenang di arus digital dan berjalan di darat, siap menemanimu di segala situasi.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <!-- Calculator & Product Options Section -->
      <section class="py-20 bg-white" id="calculator">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Pilih Produk & Simulasikan</h2>
                <p class="text-gray-500">Klik salah satu produk di bawah untuk memulai simulasi cicilan.</p>
            </div>

            <!-- Product Cards (Selection) -->
             <div class="grid md:grid-cols-3 gap-6 mb-12">
                <div *ngFor="let prod of productTiers()" 
                        (click)="selectTier(prod)"
                        class="p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                        [class.border-blue-600]="prod.id === activeTier()?.id"
                        [class.bg-blue-50]="prod.id === activeTier()?.id"
                        [class.border-gray-100]="prod.id !== activeTier()?.id"
                        [class.bg-white]="prod.id !== activeTier()?.id"
                        [class.shadow-xl]="prod.id === activeTier()?.id"
                        [class.shadow-sm]="prod.id !== activeTier()?.id"
                        [class.scale-105]="prod.id === activeTier()?.id">
                        
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="font-bold text-xl text-gray-900" [class.text-blue-700]="prod.id === activeTier()?.id">{{ prod.name }}</h4>
                            <p class="text-sm text-gray-500 mt-1">{{ prod.description }}</p>
                        </div>
                            <div *ngIf="prod.id === activeTier()?.id" class="bg-blue-600 text-white p-1 rounded-full">
                                <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                            </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Plafond</span>
                            <span class="font-bold text-gray-900">{{ formatLimit(prod) }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Bunga</span>
                            <span class="font-bold text-green-600">{{ getInterestRate(prod, 12) }}% <span class="text-xs font-normal text-gray-400">/thn</span></span>
                        </div>
                    </div>

                    <div class="mt-6 w-full py-2 rounded-xl text-center text-sm font-bold transition-colors"
                        [class.bg-blue-600]="prod.id === activeTier()?.id"
                        [class.text-white]="prod.id === activeTier()?.id"
                        [class.bg-gray-100]="prod.id !== activeTier()?.id"
                        [class.text-gray-500]="prod.id !== activeTier()?.id">
                        {{ prod.id === activeTier()?.id ? 'Sedang Dipilih' : 'Pilih ' + prod.name }}
                    </div>
                </div>
            </div>

            <!-- Calculator (Shown based on selection) -->
            <div *ngIf="activeTier()" class="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-100/50">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    
                    <!-- Controls -->
                    <div>
                        <div class="mb-8">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Pinjaman</label>
                            <div class="relative group">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-blue-600">Rp</span>
                                <input type="number" [(ngModel)]="loanAmount" 
                                    class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" 
                                    [min]="activeTier()?.minAmount || 0" [max]="activeTier()?.maxAmount || 0">
                            </div>
                            <input type="range" [(ngModel)]="loanAmount" 
                                [min]="activeTier()?.minAmount || 0" [max]="activeTier()?.maxAmount || 0" step="100000000" 
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4 accent-blue-600">
                            <div class="mt-2 flex justify-between text-xs text-gray-400 font-medium">
                                <span>{{ (activeTier()?.minAmount || 0) | currency:'Rp ':'symbol':'1.0-0' }}</span>
                                <span>{{ (activeTier()?.maxAmount || 0) | currency:'Rp ':'symbol':'1.0-0' }}</span>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-4">Pilih Tenor</label>
                            <div class="grid grid-cols-4 gap-2">
                                <button *ngFor="let t of availableTenors()" 
                                        (click)="selectedTenor.set(t)"
                                        [class.bg-blue-600]="selectedTenor() === t"
                                        [class.text-white]="selectedTenor() === t"
                                        [class.bg-gray-100]="selectedTenor() !== t"
                                        [class.text-gray-600]="selectedTenor() !== t"
                                        class="py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95">
                                    {{ t }} Bln
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Result Display -->
                    <div class="bg-gradient-to-br from-blue-600 to-teal-600 p-8 rounded-3xl text-white text-center relative overflow-hidden">
                        <!-- BG Patterns -->
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <div class="absolute bottom-0 left-0 w-24 h-24 bg-teal-400 opacity-20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

                        <div class="relative z-10">
                            <p class="text-blue-100 text-sm font-medium mb-1">Estimasi Cicilan per Bulan</p>
                            <h3 class="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">{{ monthlyInstallment() | currency:'Rp ':'symbol':'1.0-0' }}</h3>
                            
                            <div class="flex justify-center gap-8 text-sm border-t border-white/20 pt-6">
                                <div>
                                    <p class="text-blue-100 mb-1">Bunga Flat</p>
                                    <p class="font-bold text-xl">{{ activeRate() }}%</p>
                                </div>
                                <div class="w-px bg-white/20"></div>
                                <div>
                                    <p class="text-blue-100 mb-1">Total Pinjaman</p>
                                    <p class="font-bold text-xl">{{ loanAmount() | currency:'Rp ':'symbol':'1.0-0' }}</p>
                                </div>
                            </div>
                            
                            <button class="mt-8 w-full bg-white text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                                Ajukan Sekarang
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </section>

      <!-- Product Features / Selling Points -->
      <section id="features" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih Plapofy?</h2>
            <p class="text-gray-500">Kami membuat pinjaman menjadi mudah, transparan, dan adil. Tanpa biaya tersembunyi, hanya solusi saat Anda butuh.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group shadow-sm relative overflow-hidden">
               <!-- Decorative Rocket -->
               <img src="/assets/rocket.png" class="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 -rotate-12" alt="Rocket">
               
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform relative z-10">
                <lucide-icon [img]="Zap" class="w-6 h-6"></lucide-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Cair Instan dalam 5 Menit</h3>
              <p class="text-gray-500 text-sm mb-4">Dana langsung ditransfer ke rekening Anda sesaat setelah persetujuan. Tanpa menunggu lama.</p>
              <ul class="space-y-2">
                <li class="flex items-center gap-2 text-sm text-gray-600">
                    <lucide-icon [img]="ChevronRight" class="w-4 h-4 text-blue-500"></lucide-icon> Proses Otomatis 24/7
                </li>
                <li class="flex items-center gap-2 text-sm text-gray-600">
                    <lucide-icon [img]="ChevronRight" class="w-4 h-4 text-blue-500"></lucide-icon> Tanpa Dokumen Fisik
                </li>
              </ul>
            </div>

            <!-- Feature 2 -->
            <div class="bg-white p-8 rounded-2xl border border-gray-100 hover:border-teal-200 transition-colors group shadow-sm relative overflow-hidden">
               <div class="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">BEST VALUE</div>
              <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <lucide-icon [img]="Star" class="w-6 h-6"></lucide-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Bunga Kompetitif</h3>
              <p class="text-gray-500 text-sm mb-4">Nikmati bunga mulai dari 0.8% flat per bulan. Lebih rendah dari kebanyakan kartu kredit.</p>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-500">Monthly Rate</span>
                    <span class="text-lg font-bold text-teal-600">0.8% - 1.5%</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">Tenure</span>
                    <span class="text-sm font-medium text-gray-900">3, 6, 12 Months</span>
                  </div>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="bg-white p-8 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors group shadow-sm">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <lucide-icon [img]="Clock" class="w-6 h-6"></lucide-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Tenor Fleksibel</h3>
              <p class="text-gray-500 text-sm mb-4">Pilih rencana pembayaran yang sesuai anggaran Anda. Pelunasan lebih awal? Tanpa denda.</p>
               <ul class="space-y-2">
                <li class="flex items-center gap-2 text-sm text-gray-600">
                    <lucide-icon [img]="ChevronRight" class="w-4 h-4 text-purple-500"></lucide-icon> Pelunasan Kapan Saja
                </li>
                <li class="flex items-center gap-2 text-sm text-gray-600">
                    <lucide-icon [img]="ChevronRight" class="w-4 h-4 text-purple-500"></lucide-icon> Limit hingga Rp 15 Miliar
                </li>
              </ul>
            </div>
        </div>
        </div>
      </section>

      <!-- Requirements Section (New) -->
      <section class="py-20 bg-white border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="order-2 md:order-1 relative">
                    <div class="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 translate-x-12 translate-y-12"></div>
                    <img src="/assets/calculate.png" alt="Requirements - Platy Calculating" class="relative z-10 w-full max-w-sm mx-auto drop-shadow-xl hover:rotate-3 transition-transform duration-500">
                </div>
                <div class="order-1 md:order-2">
                    <h2 class="text-3xl font-bold text-gray-900 mb-6">Siapa yang Bisa Mengajukan?</h2>
                    <p class="text-gray-500 mb-8">Pastikan Anda memenuhi syarat berikut agar pengajuan Anda langsung disetujui.</p>
                    
                    <div class="space-y-4">
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900">Warga Negara Indonesia (WNI)</h4>
                                <p class="text-sm text-gray-500">Memiliki KTP elektronik (NIK sudah terintegrasi NPWP).</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900">Usaha / Pekerjaan Tetap</h4>
                                <p class="text-sm text-gray-500">Memiliki usaha berjalan min. 1 tahun atau karyawan tetap.</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900">Dokumen Legalitas</h4>
                                <p class="text-sm text-gray-500">SIUP/NIB untuk badan usaha (Limit > 1 Miliar).</p>
                            </div>
                        </div>

                         <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900">Rekening Bank Pribadi</h4>
                                <p class="text-sm text-gray-500">Rekening atas nama sendiri sesuai KTP untuk pencairan dana.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </section>

      <!-- How It Works Section (Updated) -->
      <section class="py-20 bg-gray-50 border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Langkah Mudah Pengajuan Pinjaman</h2>
                <p class="text-gray-500">Ikuti 4 langkah praktis ini untuk mendapatkan dana tunai hari ini juga.</p>
            </div>
            
            <div class="grid md:grid-cols-4 gap-8 text-center relative">
                <!-- Connector Line (Desktop) -->
                <div class="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-gray-200 -z-10"></div>

                <!-- Step 1 -->
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-10 transition-transform hover:-translate-y-2 duration-300">
                    <div class="w-16 h-16 bg-white border-4 border-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-sm">1</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Download & Daftar</h3>
                    <p class="text-gray-500 text-sm">Unduh aplikasi Plapofy dan buat akun menggunakan nomor HP aktif Anda.</p>
                </div>

                <!-- Step 2 -->
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-10 transition-transform hover:-translate-y-2 duration-300">
                     <div class="w-16 h-16 bg-white border-4 border-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-sm">2</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Lengkapi Data</h3>
                    <p class="text-gray-500 text-sm">Isi data diri, foto KTP, dan selfie. AI kami akan memverifikasi dalam hitungan detik.</p>
                </div>

                <!-- Step 3 -->
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-10 transition-transform hover:-translate-y-2 duration-300">
                     <div class="w-16 h-16 bg-white border-4 border-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-sm">3</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Pilih Pinjaman</h3>
                    <p class="text-gray-500 text-sm">Tentukan jumlah dan tenor sesuai kebutuhan. Lihat simulasi cicilan secara transparan.</p>
                </div>

                <!-- Step 4 -->
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-10 transition-transform hover:-translate-y-2 duration-300">
                     <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">4</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Dana Cair!</h3>
                    <p class="text-gray-500 text-sm">Setelah disetujui, dana langsung masuk ke rekening bank Anda. Selesai!</p>
                </div>
            </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div class="text-center max-w-3xl mx-auto mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Disukai Ribuan Pengguna</h2>
                <p class="text-gray-500">Jangan hanya percaya kata kami. Dengarkan apa kata mereka.</p>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Review 1 -->
                <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div class="flex text-yellow-400 mb-4">
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                    </div>
                    <p class="text-gray-600 text-sm mb-6">"Sangat membantu untuk ekspansi cabang baru cafe saya. Dana 500 Juta cair cepat tanpa ribet jaminan aset fisik."</p>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">A</div>
                        <div>
                            <p class="text-sm font-bold text-gray-900">Andi S.</p>
                            <p class="text-xs text-gray-500">Jakarta</p>
                        </div>
                    </div>
                </div>

                 <!-- Review 2 -->
                <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                     <div class="flex text-yellow-400 mb-4">
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                    </div>
                    <p class="text-gray-600 text-sm mb-6">"Bunganya cukup adil dibanding aplikasi lain. Plus, maskot platypus-nya lucu banget!"</p>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">S</div>
                        <div>
                            <p class="text-sm font-bold text-gray-900">Siti M.</p>
                            <p class="text-xs text-gray-500">Bandung</p>
                        </div>
                    </div>
                </div>

                 <!-- Review 3 -->
                <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 hidden lg:block">
                     <div class="flex text-yellow-400 mb-4">
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                    </div>
                    <p class="text-gray-600 text-sm mb-6">"Syaratnya transparan. Saya lunas lebih awal dan tidak kena denda aneh-aneh. Sangat direkomendasikan."</p>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">B</div>
                        <div>
                            <p class="text-sm font-bold text-gray-900">Budi H.</p>
                            <p class="text-xs text-gray-500">Surabaya</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section id="faq" class="py-20 bg-gray-900 text-white">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12">Pertanyaan Sering Diajukan</h2>
            <div class="space-y-4">
                <div class="border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-center">
                        <h3 class="font-medium group-hover:text-blue-400">Dokumen apa saja yang dibutuhkan?</h3>
                        <lucide-icon [img]="ChevronRight" class="w-5 h-5 text-gray-500 group-hover:text-blue-400"></lucide-icon>
                    </div>
                    <p class="text-gray-400 text-sm mt-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">Cukup KTP elektronik dan Mutasi Rekening 3 bulan terakhir. Untuk PT/CV butuh Akta & NIB.</p>
                </div>
                
                 <div class="border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-center">
                        <h3 class="font-medium group-hover:text-blue-400">Berapa lama proses persetujuan?</h3>
                        <lucide-icon [img]="ChevronRight" class="w-5 h-5 text-gray-500 group-hover:text-blue-400"></lucide-icon>
                    </div>
                    <p class="text-gray-400 text-sm mt-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">Sebagian besar pengajuan disetujui dalam 15 menit selama jam kerja operasional.</p>
                </div>

                 <div class="border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-center">
                        <h3 class="font-medium group-hover:text-blue-400">Apakah data saya aman?</h3>
                        <lucide-icon [img]="ChevronRight" class="w-5 h-5 text-gray-500 group-hover:text-blue-400"></lucide-icon>
                    </div>
                    <p class="text-gray-400 text-sm mt-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">Ya, kami menggunakan enkripsi 256-bit dan terdaftar serta diawasi oleh OJK.</p>
                </div>
            </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-100 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div class="flex items-center gap-2">
              <img src="/assets/logo.png" alt="Plapofy Logo" class="h-8 w-8 grayscale opacity-50">
              <span class="text-lg font-bold text-gray-400">Plapofy</span>
            </div>
            <div class="text-sm text-gray-400">
                &copy; 2026 PT FinProv Solusi Digital. All rights reserved. <br>
                <span class="text-xs mt-1 block">Terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK).</span>
            </div>
        </div>
        <!-- OJK Disclaimer Banner -->
        <div class="bg-gray-50 py-4 mt-8 border-t border-gray-100">
             <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <div class="flex items-center gap-3 opacity-80 grayscale hover:grayscale-0 transition-all">
                    <!-- Placeholder OJK Logo (Using Shield Icon as visual representation if image missing) -->
                     <div class="border-2 border-gray-400 rounded-full p-1">
                        <lucide-icon [img]="ShieldCheck" class="w-8 h-8 text-gray-600"></lucide-icon>
                     </div>
                     <div>
                        <p class="text-xs font-bold text-gray-700">Terdaftar & Diawasi oleh</p>
                        <p class="text-lg font-extrabold text-gray-900 tracking-wider">OJK</p>
                     </div>
                </div>
                <div class="hidden sm:block w-px h-8 bg-gray-300"></div>
                <p class="text-xs text-gray-500 max-w-lg">
                    PT FinProv Solusi Digital adalah perusahaan finansial teknologi yang terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK) berdasarkan Surat Tanda Berizin/Terdaftar No. S-123/NB.213/2024.
                </p>
             </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent {
  private plafondService = inject(PlafondService);

  // Icons
  readonly ShieldCheck = ShieldCheck;
  readonly Zap = Zap;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly Smartphone = Smartphone;
  readonly Star = Star;
  readonly Calculator = Calculator;
  readonly CheckCircle2 = CheckCircle2;

  // State
  loanAmount = signal(500000000); // 500 Juta default
  selectedTenor = signal(12);
  productTiers = signal<Plafond[]>([]); // Use signal for reactivity

  constructor() {
    this.plafondService.getPlafonds().subscribe({
      next: (data: Plafond[]) => {
        // Sort tiers by maxAmount ascending to ensure logic works correctly
        const sorted = [...data].sort((a, b) => a.maxAmount - b.maxAmount);
        this.productTiers.set(sorted);
      },
      error: (err: any) => console.error('Failed to load products', err)
    });

    // Effect to valid selected tenor
    effect(() => {
      const available = this.availableTenors();
      const current = this.selectedTenor();
      if (available.length > 0 && !available.includes(current)) {
        // Default to the first available tenor if the current one is invalid
        // Or prioritize 12 if available, otherwise first
        if (available.includes(12)) {
          this.selectedTenor.set(12);
        } else {
          this.selectedTenor.set(available[0]);
        }
      }
    }, { allowSignalWrites: true });
  }

  // Helper for template to get interest rate
  getInterestRate(plafond: Plafond, tenor: number): number {
    return plafond.interests.find(i => i.tenor === tenor)?.interestRate || 0;
  }

  // Helper for formatting Credit Limit (minAmount deprecated)
  formatLimit(plafond: Plafond): string {
    const format = (val: number) => {
      if (val >= 1000000000) {
        // Convert to Billions (Miliar)
        return (val / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }).replace('.', ',') + ' M';
      }
      // Convert to Millions (Juta)
      return (val / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' Jt';
    };
    // Only show maxAmount (Credit Limit) since minAmount is deprecated
    return `Up to ${format(plafond.maxAmount)}`;
  }

  // Computed Values
  activeTier = computed(() => {
    const amount = this.loanAmount();
    const tiers = this.productTiers();
    if (tiers.length === 0) return null;

    // Find first tier that covers the amount (Smallest to Largest check)
    // Remove .reverse() so we don't default to the biggest one for small amounts
    return tiers.find(p => amount >= (p.minAmount ?? 0) && amount <= p.maxAmount) || tiers[tiers.length - 1];
  });

  availableTenors = computed(() => {
    const tier = this.activeTier();
    if (!tier || !tier.interests) return [];
    // Return sorted unique tenors
    return [...new Set(tier.interests.map(i => i.tenor))].sort((a, b) => a - b);
  });

  activeRate = computed(() => {
    const tier = this.activeTier();
    if (!tier) return 0;
    const tenor = this.selectedTenor();
    return this.getInterestRate(tier, tenor);
  });

  monthlyInstallment = computed(() => {
    const principal = this.loanAmount();
    const ratePercent = this.activeRate();
    const tenor = this.selectedTenor();

    const totalInterest = principal * (ratePercent / 100);
    const totalPayment = principal + totalInterest;
    return totalPayment / tenor;
  });

  selectTier(tier: Plafond) {
    // Set amount to 50% of the tier's max limit to ensure it falls comfortably within the range
    // This solves the issue where setting a small amount (like 1M) would just select the smallest tier (Starter)
    // even if the user clicked "Prioritas".
    const midPoint = tier.maxAmount * 0.5;
    this.loanAmount.set(Math.max(tier.minAmount ?? 1000000, midPoint));
  }
}

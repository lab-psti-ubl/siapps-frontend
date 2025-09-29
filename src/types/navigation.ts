export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
}

export const adminNavigation: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard'
  },
  {
    key: 'data-absen',
    label: 'Data Absen',
    path: '/admin/data-absen'
  },
  {
    key: 'data-pegawai',
    label: 'Data Pegawai',
    path: '/admin/data-pegawai'
  },
  {
    key: 'data-alat-rfid',
    label: 'Data Alat RFID',
    path: '/admin/data-alat-rfid'
  },
  {
    key: 'manajemen-gaji',
    label: 'Manajemen Gaji',
    path: '/admin/manajemen-gaji'
  },
  {
    key: 'pengaturan',
    label: 'Pengaturan',
    path: '/admin/pengaturan'
  }
];

export const userNavigation: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/user/dashboard'
  },
  {
    key: 'absensi',
    label: 'Absensi',
    path: '/user/absensi',
    children: [
      {
        key: 'absen-masuk',
        label: 'Absen Masuk',
        path: '/user/absen-masuk'
      },
      {
        key: 'absen-keluar',
        label: 'Absen Keluar',
        path: '/user/absen-keluar'
      },
      {
        key: 'ajukan-izin',
        label: 'Ajukan Izin',
        path: '/user/ajukan-izin'
      },
      {
        key: 'riwayat-absensi',
        label: 'Riwayat Absensi',
        path: '/user/riwayat-absensi'
      }
    ]
  },
  {
    key: 'profil',
    label: 'Profil Saya',
    path: '/user/profil'
  }
];
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 - Akses Terbatas | {{ config('app.name', 'Pustaka Penataran PERKEMI') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #F8FBFF;
            color: #112743;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .card {
            background: #ffffff;
            border: 1px solid #DCE7F3;
            border-radius: 16px;
            max-width: 520px;
            width: 100%;
            padding: 40px 32px;
            box-shadow: 0 12px 36px rgba(14, 39, 71, 0.08);
            text-align: center;
        }
        .badge-error {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FCA5A5;
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 26px;
            font-weight: 700;
            color: #0E2747;
            margin-bottom: 12px;
        }
        p.subtitle {
            font-size: 14px;
            color: #4B5563;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .user-box {
            background: #F1F5F9;
            border: 1px solid #CBD5E1;
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            margin-bottom: 28px;
            font-size: 13px;
        }
        .user-box-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        .user-box-row:last-child { margin-bottom: 0; }
        .label { color: #64748B; font-weight: 500; }
        .value { color: #0F172A; font-weight: 600; }
        .role-badge {
            background: #E0E7FF;
            color: #3730A3;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.15s ease;
            border: none;
            width: 100%;
        }
        .btn-primary {
            background-color: #0B63CE;
            color: #ffffff;
        }
        .btn-primary:hover {
            background-color: #094EA3;
        }
        .btn-secondary {
            background-color: #F8FBFF;
            color: #0E2747;
            border: 1px solid #DCE7F3;
        }
        .btn-secondary:hover {
            background-color: #EDF4FD;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Error 403 - Akses Terbatas
        </div>

        <h1>Akses Tidak Diizinkan</h1>
        <p class="subtitle">
            Halaman atau tindakan ini memerlukan hak akses khusus (<strong>Administrator</strong>, <strong>Diktar</strong>, atau <strong>Penyelenggara</strong>). Akun yang sedang aktif di peramban Anda tidak memiliki izin untuk fitur ini.
        </p>

        @auth
        <div class="user-box">
            <div class="user-box-row">
                <span class="label">Nama Akun:</span>
                <span class="value">{{ auth()->user()->name }}</span>
            </div>
            <div class="user-box-row">
                <span class="label">Email:</span>
                <span class="value">{{ auth()->user()->email }}</span>
            </div>
            <div class="user-box-row" style="margin-top: 6px;">
                <span class="label">Peran Aktif:</span>
                <span class="role-badge">{{ auth()->user()->role ?? 'Peserta' }}</span>
            </div>
        </div>

        <div class="actions">
            <form action="{{ route('logout') }}" method="POST" style="width: 100%;">
                @csrf
                <button type="submit" class="btn btn-primary">
                    Keluar & Masuk Akun Administrator
                </button>
            </form>
            <a href="{{ url('/') }}" class="btn btn-secondary">
                Kembali ke Beranda Portal
            </a>
        </div>
        @else
        <div class="actions">
            <a href="{{ route('login') }}" class="btn btn-primary">
                Masuk ke Akun Anda
            </a>
            <a href="{{ url('/') }}" class="btn btn-secondary">
                Kembali ke Beranda Portal
            </a>
        </div>
        @endauth
    </div>
</body>
</html>

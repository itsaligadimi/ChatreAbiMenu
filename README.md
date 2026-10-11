# رستوران چتر آبی — منوی دیجیتال

نسخهٔ بازطراحی‌شدهٔ منوی دیجیتال رستوران چتر آبی: سایت استاتیک، سریع، و مناسب موبایل با جستجو و فیلتر دسته‌ها.

## ویژگی‌ها

- طراحی مدرن RTL با تایپوگرافی مناسب فارسی
- منوی کامل (۸۲ آیتم) با قیمت به تومان
- جستجو و فیلتر دسته (صبحانه، ایرانی، کباب، پیش‌غذا، نوشیدنی)
- دکمه تماس و واتساپ
- استقرار خودکار روی GitHub Pages

## توسعه محلی

```bash
cd /path/to/ChatreAbiMenu
python3 -m http.server 8080
```

سپس در مرورگر: `http://localhost:8080`

## GitHub Pages

1. پس از push به `main`، workflow محتوا را به شاخهٔ **`gh-pages`** منتشر می‌کند.
2. در مخزن GitHub به **Settings → Pages** بروید.
3. **Build and deployment → Source**: Deploy from a branch.
4. **Branch**: `gh-pages` / **`/ (root)`** → Save.
5. آدرس سایت: `https://itsaligadimi.github.io/ChatreAbiMenu/` (پس از چند دقیقه).

### دامنه سفارشی (chatreabi.ir)

برای اتصال دامنهٔ قبلی، در تنظیمات Pages دامنه را وارد کنید و در DNS رکورد `CNAME` را به `<username>.github.io` اشاره دهید.

## ساختار

- `index.html` — صفحه اصلی
- `css/styles.css` — استایل‌ها
- `js/menu-data.js` — داده منو
- `js/app.js` — رندر منو، فیلتر و جستجو
- `design-system/chatre-abi/` — سیستم طراحی (ui-ux-pro-max)

## به‌روزرسانی منو

دادهٔ منو از سایت قبلی استخراج شده است. برای به‌روزرسانی، `js/menu-data.js` را ویرایش کنید یا اسکریپت استخراج را دوباره اجرا کنید.

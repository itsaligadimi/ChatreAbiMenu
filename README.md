# رستوران چتر آبی — وب‌سایت

وب‌سایت استاتیک، واکنش‌گرا و فارسی (RTL) برای **رستوران چتر آبی** با صفحات اصلی، درباره ما، منوی کامل با قیمت به تومان، گالری، تماس و صفحات حقوقی.

## ساختار

| فایل | توضیح |
|------|--------|
| `index.html` | صفحه اصلی |
| `about.html` | درباره ما |
| `menu.html` | منوی رستوران |
| `gallery.html` | گالری تصاویر |
| `contact.html` | تماس |
| `privacy-policy.html` | حریم خصوصی |
| `disclaimer.html` | سلب مسئولیت |
| `terms.html` | قوانین استفاده |
| `style.css` | استایل مشترک |
| `script.js` | منوی داده + تعاملات |
| `images/` | لوگو، فونت و تصاویر محلی |

دادهٔ منو در انتهای `script.js` (ثابت `MENU_DATA`) بر اساس [chatreabi.ir](https://chatreabi.ir/) است.

## توسعه محلی

```bash
python3 -m http.server 8080
```

سپس: `http://localhost:8080`

## به‌روزرسانی صفحات HTML

قالب مشترک در `tools/build_pages.py` است:

```bash
python3 tools/build_pages.py
```

پس از تغییر `script-core.js`:

```bash
sed 's/window.MENU_DATA = /const MENU_DATA = /' js/menu-data.js > /tmp/menu-data-const.js
cat script-core.js /tmp/menu-data-const.js > script.js
```

(یا `js/menu-data.js` را مستقیماً ویرایش و دوباره به `script.js` الحاق کنید.)

## GitHub Pages

پس از push به `main`، workflow محتوا را به شاخه **`gh-pages`** منتشر می‌کند.

## نکات محتوا

- **تلفن‌های تأییدشده:** `041-33312437` و `041-33297177` (مطابق سایت قبلی)
- **آدرس و ساعات کار:** در `contact.html` و فوتر به‌صورت placeholder — پس از تأیید مدیریت تکمیل شود.
- اقلام بدون قیمت در منوی رسمی با برچسب «نیاز به بررسی» نمایش داده می‌شوند.

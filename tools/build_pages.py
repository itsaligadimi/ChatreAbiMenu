#!/usr/bin/env python3
"""Generate static HTML pages with shared header/footer."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://chatreabi.ir"

PAGES = {
    "index": {
        "title": "رستوران چتر آبی | منوی غذا و صبحانه",
        "desc": "رستوران چتر آبی — طعم اصیل غذاهای ایرانی، صبحانه‌های متنوع، کباب و پیش‌غذا. منو و قیمت‌ها به تومان.",
        "canonical": f"{SITE}/",
        "current": "index",
        "skip": "#featured",
    },
    "about": {
        "title": "درباره رستوران چتر آبی",
        "desc": "آشنایی با رستوران چتر آبی، منوی غذاهای ایرانی و صبحانه، و فضای پذیرایی.",
        "canonical": f"{SITE}/about.html",
        "current": "about",
        "skip": "#main",
    },
    "menu": {
        "title": "منوی رستوران چتر آبی | قیمت غذاها",
        "desc": "منوی کامل رستوران چتر آبی: صبحانه، غذای ایرانی، کباب، پیش‌غذا و نوشیدنی با قیمت به تومان.",
        "canonical": f"{SITE}/menu.html",
        "current": "menu",
        "skip": "#menu-sections",
    },
    "gallery": {
        "title": "گالری تصاویر رستوران چتر آبی",
        "desc": "تصاویر غذاها و فضای رستوران چتر آبی.",
        "canonical": f"{SITE}/gallery.html",
        "current": "gallery",
        "skip": "#gallery",
    },
    "contact": {
        "title": "تماس با رستوران چتر آبی",
        "desc": "شماره تماس و راه‌های ارتباط با رستوران چتر آبی.",
        "canonical": f"{SITE}/contact.html",
        "current": "contact",
        "skip": "#main",
    },
    "privacy-policy": {
        "title": "سیاست حفظ حریم خصوصی | چتر آبی",
        "desc": "سیاست حفظ حریم خصوصی وب‌سایت رستوران چتر آبی.",
        "canonical": f"{SITE}/privacy-policy.html",
        "current": "legal",
        "skip": "#main",
    },
    "disclaimer": {
        "title": "سلب مسئولیت | چتر آبی",
        "desc": "سلب مسئولیت اطلاعات منو و وب‌سایت رستوران چتر آبی.",
        "canonical": f"{SITE}/disclaimer.html",
        "current": "legal",
        "skip": "#main",
    },
    "terms": {
        "title": "قوانین و شرایط استفاده | چتر آبی",
        "desc": "قوانین و شرایط استفاده از وب‌سایت رستوران چتر آبی.",
        "canonical": f"{SITE}/terms.html",
        "current": "legal",
        "skip": "#main",
    },
}

NAV = [
    ("index.html", "صفحه اصلی", "index"),
    ("about.html", "درباره ما", "about"),
    ("menu.html", "منو", "menu"),
    ("gallery.html", "گالری تصاویر", "gallery"),
    ("contact.html", "تماس با ما", "contact"),
]

JSON_LD = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "رستوران چتر آبی",
  "url": "https://chatreabi.ir/",
  "telephone": "+98-41-33312437",
  "servesCuisine": "Persian",
  "menu": "https://chatreabi.ir/menu.html"
}
</script>"""


def head(meta: dict) -> str:
    return f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="{meta['desc']}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{meta['canonical']}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fa_IR" />
    <meta property="og:site_name" content="رستوران چتر آبی" />
    <meta property="og:title" content="{meta['title']}" />
    <meta property="og:description" content="{meta['desc']}" />
    <meta property="og:url" content="{meta['canonical']}" />
    <meta property="og:image" content="{SITE}/images/food/omelet-darbary.jpg" />
    <title>{meta['title']}</title>
    <link rel="icon" href="images/logo.png" type="image/png" />
    <link rel="stylesheet" href="style.css" />
    {JSON_LD if meta['current'] == 'index' else ''}
  </head>"""


def header(current: str, skip: str) -> str:
    nav_items = []
    for href, label, key in NAV:
        cur = ' aria-current="page"' if key == current else ""
        nav_items.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    nav_html = "\n            ".join(nav_items)
    return f"""  <body>
    <a class="skip-link" href="{skip}">رفتن به محتوای اصلی</a>
    <header class="site-header">
      <div class="container header-inner">
        <a class="logo-link" href="index.html">
          <img src="images/logo.png" width="120" height="46" alt="لوگوی رستوران چتر آبی" />
          <span class="logo-text">چتر آبی</span>
        </a>
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="باز و بسته کردن منو">
          <span></span><span></span><span></span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="منوی اصلی">
          <ul>
            {nav_html}
          </ul>
        </nav>
        <a class="btn btn-primary header-cta" href="menu.html">مشاهده منو</a>
      </div>
    </header>"""


def footer() -> str:
    return """    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="images/logo.png" width="140" height="53" alt="رستوران چتر آبی" loading="lazy" />
            <p>رستوران چتر آبی؛ منوی غذاهای ایرانی، صبحانه، کباب و نوشیدنی. کلیه قیمت‌های منو به تومان است.</p>
          </div>
          <div class="footer-col">
            <h3>دسترسی سریع</h3>
            <ul>
              <li><a href="index.html">صفحه اصلی</a></li>
              <li><a href="about.html">درباره ما</a></li>
              <li><a href="menu.html">منوی رستوران</a></li>
              <li><a href="gallery.html">گالری تصاویر</a></li>
              <li><a href="contact.html">تماس با ما</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>تماس</h3>
            <ul>
              <li><a href="tel:+984133312437" dir="ltr">۰۴۱ ۳۳۳۱ ۲۴۳۷</a></li>
              <li><a href="tel:+984133297177" dir="ltr">۰۴۱ ۳۳۲۹ ۷۱۷۷</a></li>
              <li><a href="https://wa.me/989122794809" rel="noopener noreferrer" target="_blank">واتساپ</a></li>
            </ul>
            <!-- PLACEHOLDER_ADDRESS: آدرس و ساعات کار پس از تأیید مدیریت درج شود -->
            <p class="placeholder-note" style="margin-top:0.75rem;font-size:0.8rem;">آدرس و ساعات کار: در حال تکمیل — لطفاً پیش از مراجعه تماس بگیرید.</p>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="year"></span> رستوران چتر آبی</span>
          <div class="footer-legal">
            <a href="privacy-policy.html">حریم خصوصی</a>
            <a href="disclaimer.html">سلب مسئولیت</a>
            <a href="terms.html">قوانین استفاده</a>
          </div>
        </div>
      </div>
    </footer>
    <script src="script.js" defer></script>
  </body>
</html>"""


def index_body() -> str:
    return """
    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-bg">
          <img src="images/food/omelet-darbary.jpg" alt="املت درباری — رستوران چتر آبی" width="1600" height="900" fetchpriority="high" />
          <div class="hero-overlay"></div>
        </div>
        <div class="container hero-content">
          <h1 id="hero-title">طعم اصیل غذاهای ایرانی در رستوران چتر آبی</h1>
          <p class="hero-lead">با مجموعه‌ای از غذاهای ایرانی، کباب‌های لذیذ و صبحانه‌های متنوع، لحظاتی خوشمزه و به‌یادماندنی را تجربه کنید.</p>
          <div class="hero-actions">
            <a class="btn btn-gold" href="menu.html">مشاهده منو</a>
            <a class="btn btn-secondary" href="contact.html">تماس با ما</a>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="intro-title">
        <div class="container split reveal">
          <div>
            <h2 id="intro-title">به چتر آبی خوش آمدید</h2>
            <p>رستوران چتر آبی منویی متنوع از <strong>صبحانه</strong>، <strong>غذای ایرانی</strong>، <strong>کباب</strong>، <strong>پیش‌غذا و دسر</strong> و <strong>نوشیدنی</strong> را در اختیار شما قرار می‌دهد. منوی دیجیتال ما بر پایهٔ اطلاعات رسمی رستوران به‌روز شده است؛ <strong>کلیه قیمت‌ها به تومان</strong> است.</p>
            <p style="color:var(--muted);font-size:0.92rem;">[متن تکمیلی درباره فضا و تاریخچه — پس از تأیید مدیریت رستوران درج شود.]</p>
            <a class="btn btn-primary" href="about.html" style="margin-top:1rem;">آشنایی با ما</a>
          </div>
          <div class="split-media">
            <img src="images/food/iranian-plate.jpg" alt="بشقاب صبحانه ایرانی در رستوران چتر آبی" width="800" height="600" loading="lazy" />
          </div>
        </div>
      </section>

      <section class="section section-alt" id="featured" aria-labelledby="cats-title">
        <div class="container">
          <div class="section-head reveal">
            <h2 id="cats-title">دسته‌های منو</h2>
            <p>از صبحانه گرفته تا شام؛ دستهٔ مورد نظر را انتخاب کنید.</p>
          </div>
          <div class="card-grid reveal">
            <article class="category-card">
              <a href="menu.html#cat-breakfast">
                <img src="assets/icons/breakfast.png" alt="صبحانه" width="400" height="300" loading="lazy" />
                <div class="category-card-body">
                  <h3>صبحانه</h3>
                  <p>املت، نیمرو و بشقاب‌های متنوع</p>
                </div>
              </a>
            </article>
            <article class="category-card">
              <a href="menu.html#cat-iranian">
                <img src="assets/icons/food.png" alt="غذای ایرانی" width="400" height="300" loading="lazy" />
                <div class="category-card-body">
                  <h3>غذای ایرانی</h3>
                  <p>برنج، خورشت و خوراک‌های سنتی</p>
                </div>
              </a>
            </article>
            <article class="category-card">
              <a href="menu.html#cat-kebab">
                <img src="images/food/baghali-mahiche.jpg" alt="کباب و چلو" width="400" height="300" loading="lazy" />
                <div class="category-card-body">
                  <h3>کباب‌ها</h3>
                  <p>جوجه، کوبیده، برگ و کباب تابه‌ای</p>
                </div>
              </a>
            </article>
            <article class="category-card">
              <a href="menu.html#cat-appetizer">
                <img src="assets/icons/dessert_2.png" alt="پیش‌غذا و دسر" width="400" height="300" loading="lazy" />
                <div class="category-card-body">
                  <h3>پیش‌غذا و دسر</h3>
                  <p>پیش‌غذا، سوپ، سالاد و مخلفات</p>
                </div>
              </a>
            </article>
            <article class="category-card">
              <a href="menu.html#cat-drinks">
                <img src="assets/icons/drink.png" alt="نوشیدنی" width="400" height="300" loading="lazy" />
                <div class="category-card-body">
                  <h3>نوشیدنی</h3>
                  <p>نوشابه، دوغ، چای و نوشیدنی‌های سرد</p>
                </div>
              </a>
            </article>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="dishes-title">
        <div class="container">
          <div class="section-head reveal">
            <h2 id="dishes-title">پیشنهاد از منو</h2>
            <p>برخی از محبوب‌ترین انتخاب‌ها با قیمت به‌روز از منوی رسمی.</p>
          </div>
          <div class="card-grid reveal">
            <article class="dish-card">
              <div class="dish-card-inner">
                <img src="images/food/omelet-darbary.jpg" alt="املت درباری" loading="lazy" />
                <div class="dish-card-body">
                  <span class="dish-tag">صبحانه</span>
                  <h3>املت درباری</h3>
                  <p class="dish-desc">تخم مرغ، گوجه، پنیر گودا، ژامبون، قارچ و دورچین</p>
                  <div class="dish-meta"><span class="dish-price">۴۲۰٬۰۰۰ <span class="unit">تومان</span></span></div>
                </div>
              </div>
            </article>
            <article class="dish-card">
              <div class="dish-card-inner">
                <img src="images/food/qisawa.jpg" alt="قیساوا" loading="lazy" />
                <div class="dish-card-body">
                  <span class="dish-tag">صبحانه</span>
                  <h3>قیساوا</h3>
                  <p class="dish-desc">تخم مرغ، خرما، دارچین و مغزهای خوراکی</p>
                  <div class="dish-meta"><span class="dish-price">۳۵۰٬۰۰۰ <span class="unit">تومان</span></span></div>
                </div>
              </div>
            </article>
            <article class="dish-card">
              <div class="dish-card-inner">
                <img src="images/food/baghali-mahiche.jpg" alt="باقالی پلو با ماهیچه" loading="lazy" />
                <div class="dish-card-body">
                  <span class="dish-tag">غذای ایرانی</span>
                  <h3>باقالی پلو با ماهیچه</h3>
                  <div class="dish-meta"><span class="dish-price">۱٬۸۵۰٬۰۰۰ <span class="unit">تومان</span></span></div>
                </div>
              </div>
            </article>
            <article class="dish-card">
              <div class="dish-card-inner">
                <img src="images/food/zereshk-polo.jpg" alt="زرشک پلو مخصوص" loading="lazy" />
                <div class="dish-card-body">
                  <span class="dish-tag">غذای ایرانی</span>
                  <h3>زرشک پلو مخصوص ران</h3>
                  <div class="dish-meta"><span class="dish-price">۶۹۰٬۰۰۰ <span class="unit">تومان</span></span></div>
                </div>
              </div>
            </article>
            <article class="dish-card">
              <div class="dish-card-inner">
                <img src="images/food/ghormeh.jpg" alt="چلو جوجه کباب" loading="lazy" />
                <div class="dish-card-body">
                  <span class="dish-tag">کباب</span>
                  <h3>چلو جوجه کباب مخصوص</h3>
                  <p class="dish-desc">۳۰۰ گرم</p>
                  <div class="dish-meta"><span class="dish-price">۹۰۰٬۰۰۰ <span class="unit">تومان</span></span></div>
                </div>
              </div>
            </article>
            <article class="dish-card">
              <div class="dish-card-inner">
                <img src="https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg" alt="کشک بادمجان" loading="lazy" />
                <div class="dish-card-body">
                  <span class="dish-tag">پیش‌غذا</span>
                  <h3>کشک بادمجان</h3>
                  <div class="dish-meta"><span class="dish-price">۴۰۰٬۰۰۰ <span class="unit">تومان</span></span></div>
                </div>
              </div>
            </article>
          </div>
          <p style="text-align:center;margin-top:2rem;"><a class="btn btn-primary" href="menu.html">مشاهده همه غذاها</a></p>
        </div>
      </section>

      <section class="section section-alt" aria-labelledby="why-title">
        <div class="container">
          <div class="section-head reveal">
            <h2 id="why-title">چرا منوی چتر آبی؟</h2>
          </div>
          <div class="features reveal">
            <div class="feature">
              <h3>تنوع غذاهای ایرانی</h3>
              <p>از خورشت و ته‌چین تا برنج و خوراک؛ انتخاب‌های متنوع برای وعدهٔ اصلی.</p>
            </div>
            <div class="feature">
              <h3>صبحانه‌های متنوع</h3>
              <p>املت، نیمرو، بشقاب ایرانی و خوراک‌های صبحانه در یک منو.</p>
            </div>
            <div class="feature">
              <h3>کباب و چلو</h3>
              <p>کباب‌های مخصوص و نیمه‌مخصوص با جزئیات وزن در منو.</p>
            </div>
            <div class="feature">
              <h3>نوشیدنی و پیش‌غذا</h3>
              <p>پیش‌غذا، سوپ، سالاد و نوشیدنی در کنار غذای اصلی.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container reveal">
          <div class="cta-band">
            <h2>برای یک تجربه خوشمزه آماده‌اید؟</h2>
            <p>منوی چتر آبی را ببینید و غذای موردعلاقه‌تان را انتخاب کنید.</p>
            <div class="hero-actions" style="justify-content:center;">
              <a class="btn btn-gold" href="menu.html">مشاهده منو</a>
              <a class="btn btn-secondary" href="contact.html">تماس با ما</a>
            </div>
          </div>
        </div>
      </section>
    </main>"""


def about_body() -> str:
    return """
    <main id="main">
      <div class="page-hero">
        <div class="container">
          <h1>درباره رستوران چتر آبی</h1>
          <p>معرفی کوتاه رستوران و تجربهٔ پذیرایی — بر پایهٔ منوی رسمی و اطلاعات تأییدشده.</p>
        </div>
      </div>
      <section class="section">
        <div class="container split reveal">
          <div class="split-media">
            <img src="images/food/zereshk-polo.jpg" alt="غذای ایرانی در رستوران چتر آبی" loading="lazy" />
          </div>
          <div>
            <h2>معرفی</h2>
            <p>رستوران <strong>چتر آبی</strong> با تمرکز بر غذاهای ایرانی، صبحانه و پذیرایی در منوی خود طیف گسترده‌ای از انتخاب‌ها را ارائه می‌دهد. نام «چتر آبی» هویت برند رستوران است و منوی دیجیتال ما برای دسترسی آسان‌تر به قیمت‌ها و اقلام طراحی شده است.</p>
            <p class="placeholder-note">[داستان تأسیس، مدیریت و جزئیات فضای داخلی — پس از تأیید صاحب رستوران تکمیل شود.]</p>
          </div>
        </div>
      </section>
      <section class="section section-alt">
        <div class="container reveal">
          <h2>منو و تنوع</h2>
          <p>منوی رستوران شامل دسته‌های <a href="menu.html#cat-breakfast">صبحانه</a>، <a href="menu.html#cat-iranian">غذای ایرانی</a>، <a href="menu.html#cat-kebab">کباب‌ها</a>، <a href="menu.html#cat-appetizer">پیش‌غذا و دسر</a> و <a href="menu.html#cat-drinks">نوشیدنی</a> است. قیمت‌ها مطابق منوی منتشرشده در وب‌سایت رسمی به تومان نمایش داده می‌شوند.</p>
          <h2 style="margin-top:2rem;">فلسفه پذیرایی</h2>
          <p>ما تلاش می‌کنیم انتخاب غذا برای میهمانان ساده و شفاف باشد: نام غذا، توضیحات درج‌شده در منو (در صورت وجود) و قیمت به تومان. برای سوال درباره مواد تشکیل‌دهنده یا آلرژی‌ها، لطفاً مستقیماً با رستوران تماس بگیرید.</p>
          <p style="margin-top:1.5rem;"><a class="btn btn-primary" href="menu.html">مشاهده منو</a></p>
        </div>
      </section>
    </main>"""


def menu_body() -> str:
    return """
    <main id="main">
      <div class="page-hero">
        <div class="container">
          <h1>منوی رستوران چتر آبی</h1>
          <p>ضمن خیر مقدم؛ <strong>کلیه قیمت‌ها به تومان</strong> است. موارد بدون قیمت در منوی رسمی نیاز به بررسی دارند.</p>
        </div>
      </div>
      <div class="menu-toolbar-wrap">
        <div class="container">
          <div class="menu-cats" role="toolbar" aria-label="دسته‌های منو">
            <button type="button" class="menu-cat-btn is-active" data-category="all" aria-pressed="true">همه</button>
            <button type="button" class="menu-cat-btn" data-category="breakfast" aria-pressed="false">صبحانه</button>
            <button type="button" class="menu-cat-btn" data-category="iranian" aria-pressed="false">غذای ایرانی</button>
            <button type="button" class="menu-cat-btn" data-category="kebab" aria-pressed="false">کباب‌ها</button>
            <button type="button" class="menu-cat-btn" data-category="appetizer" aria-pressed="false">پیش‌غذا و دسر</button>
            <button type="button" class="menu-cat-btn" data-category="drinks" aria-pressed="false">نوشیدنی</button>
          </div>
          <div class="menu-search-row">
            <label class="sr-only" for="menu-search">جستجو در منو</label>
            <input type="search" id="menu-search" placeholder="جستجو در منو..." autocomplete="off" />
          </div>
          <p class="menu-result-count" id="menu-count" aria-live="polite"></p>
        </div>
      </div>
      <div class="container menu-sections" id="menu-sections" aria-live="polite"></div>
      <p class="menu-empty container" id="menu-empty" hidden>موردی با این جستجو پیدا نشد.</p>
    </main>"""


def gallery_body() -> str:
    images = [
        ("images/food/omelet-darbary.jpg", "املت درباری — صبحانه"),
        ("images/food/qisawa.jpg", "قیساوا — صبحانه"),
        ("images/food/iranian-plate.jpg", "بشقاب ایرانی — صبحانه"),
        ("images/food/baghali-mahiche.jpg", "باقالی پلو با ماهیچه"),
        ("images/food/zereshk-polo.jpg", "زرشک پلو"),
        ("images/food/ghormeh.jpg", "خورشت قورمه سبزی"),
        ("https://chatreabi.ir/wp-content/uploads/2025/04/املت-ساده.jpg", "املت گوجه"),
        ("https://chatreabi.ir/wp-content/uploads/2025/04/نیمرو-ساده.jpg", "نیمرو ساده"),
        ("https://chatreabi.ir/wp-content/uploads/2025/05/1704372318506-e1746445004744.jpg", "ته چین با مرغ"),
        ("https://chatreabi.ir/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-23-at-10.39.00-AM-9-e1748089490728.jpeg", "کباب تابه‌ای"),
        ("https://chatreabi.ir/wp-content/uploads/2025/05/1704372318615.jpg", "دلمه برگ مو"),
        ("https://chatreabi.ir/wp-content/uploads/2025/05/IMG_20241118_154017_729.jpg", "خورشت قیمه"),
    ]
    items = []
    for src, alt in images:
        items.append(
            f'<button type="button" class="gallery-item" data-full="{src}"><img src="{src}" alt="{alt}" loading="lazy" decoding="async" /></button>'
        )
    grid = "\n          ".join(items)
    return f"""
    <main id="main">
      <div class="page-hero">
        <div class="container">
          <h1>گالری تصاویر</h1>
          <p>تصاویر غذا از منوی رسمی رستوران. برخی تصاویر نماینده هستند و ممکن است با سرو فعلی متفاوت باشند.</p>
        </div>
      </div>
      <section class="section" id="gallery">
        <div class="container gallery-grid reveal" aria-label="گالری تصاویر">
          {grid}
        </div>
      </section>
      <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="نمایش تصویر">
        <button type="button" class="lightbox-close" aria-label="بستن">×</button>
        <button type="button" class="lightbox-prev" aria-label="تصویر قبلی">‹</button>
        <button type="button" class="lightbox-next" aria-label="تصویر بعدی">›</button>
        <img src="" alt="" />
        <p class="lightbox-caption"></p>
      </div>
    </main>"""


def contact_body() -> str:
    return """
    <main id="main">
      <div class="page-hero">
        <div class="container">
          <h1>تماس با ما</h1>
          <p>برای رزرو، پرسش درباره منو یا سفارش، با شماره‌های زیر تماس بگیرید.</p>
        </div>
      </div>
      <section class="section">
        <div class="container contact-grid reveal">
          <div class="contact-card">
            <h2>رستوران چتر آبی</h2>
            <ul class="contact-list">
              <li><strong>تلفن:</strong> <a href="tel:+984133312437" dir="ltr">041-33312437</a></li>
              <li><strong>تلفن:</strong> <a href="tel:+984133297177" dir="ltr">041-33297177</a></li>
              <li><strong>واتساپ:</strong> <a href="https://wa.me/989122794809" rel="noopener noreferrer" target="_blank">ارسال پیام</a></li>
              <li><strong>وب‌سایت:</strong> <a href="https://chatreabi.ir/">chatreabi.ir</a></li>
            </ul>
            <a class="btn btn-primary" href="tel:+984133312437" style="margin-top:1rem;width:100%;">تماس تلفنی</a>
            <a class="btn btn-secondary" href="menu.html" style="margin-top:0.75rem;width:100%;">بازگشت به منو</a>
          </div>
          <div class="contact-card">
            <h2>آدرس و مسیریابی</h2>
            <!-- PLACEHOLDER_ADDRESS: آدرس تأییدشده از مدیریت رستوران -->
            <p>آدرس دقیق شعبه در وب‌سایت رسمی قبلی درج نشده است. لطفاً پیش از مراجعه با شماره‌های بالا تماس بگیرید یا آدرس را از رستوران دریافت کنید.</p>
            <p class="placeholder-note">برای درج آدرس و لینک مسیریابی: فایل <code>contact.html</code> را ویرایش کنید.</p>
            <h2 style="margin-top:1.5rem;">ساعات کار</h2>
            <p class="placeholder-note">ساعات کار — پس از تأیید مدیریت درج شود.</p>
          </div>
        </div>
      </section>
    </main>"""


def privacy_body() -> str:
    return """
    <main id="main" class="legal-content container">
      <h1>سیاست حفظ حریم خصوصی</h1>
      <p>این صفحه نحوهٔ استفاده از وب‌سایت رستوران چتر آبی را از دید حریم خصوصی توضیح می‌دهد.</p>
      <h2>اطلاعاتی که جمع‌آوری می‌شود</h2>
      <p>این وب‌سایت استاتیک است و فرم تماس یا ثبت‌نام ندارد. در حالت عادی، اطلاعات شخصی از طریق این صفحات جمع‌آوری نمی‌شود.</p>
      <p class="placeholder-note">[در صورت استفاده از سرویس تحلیل بازدید، کوکی یا ابزارهای شخص ثالث — جزئیات پس از تأیید میزبان وب درج شود.]</p>
      <h2>کوکی‌ها</h2>
      <p>تا زمانی که ابزار تحلیل یا کوکی اضافه نشده باشد، کوکی اختصاصی توسط این قالب تنظیم نمی‌شود.</p>
      <h2>لینک‌های خارجی</h2>
      <p>پیوندهایی مانند واتساپ یا وب‌سایت‌های دیگر خارج از کنترل رستوران هستند و سیاست حریم خصوصی آن‌ها جداگانه است.</p>
      <h2>امنیت</h2>
      <p>میزبان وب مسئول امنیت لایهٔ زیرساخت است. <!-- PLACEHOLDER_HOSTING --></p>
      <h2>حقوق کاربران</h2>
      <p>برای پرسش درباره داده‌های شخصی (در صورت وجود پردازش در آینده) با رستوران از طریق <a href="contact.html">صفحه تماس</a> ارتباط بگیرید.</p>
      <h2>به‌روزرسانی</h2>
      <p>این سیاست ممکن است به‌روز شود. نسخهٔ جاری روی همین صفحه منتشر می‌شود.</p>
    </main>"""


def disclaimer_body() -> str:
    return """
    <main id="main" class="legal-content container">
      <h1>سلب مسئولیت</h1>
      <p>اطلاعات این وب‌سایت جنبهٔ اطلاع‌رسانی دارد.</p>
      <ul>
        <li>قیمت‌ها و موجودی اقلام منو ممکن است بدون اطلاع قبلی تغییر کند؛ قیمت نهایی در رستوران معتبر است.</li>
        <li>تصاویر غذا ممکن است نماینده باشند و با سرو واقعی تفاوت جزئی داشته باشند.</li>
        <li>برای آلرژی‌ها و مواد تشکیل‌دهنده با کارکنان رستوران هماهنگ کنید.</li>
        <li>آدرس، ساعات کار و شماره تماس را پیش از مراجعه از <a href="contact.html">صفحه تماس</a> بررسی کنید.</li>
        <li>محتوای وب‌سایت‌های پیونددادهٔ خارجی تحت مسئولیت همان سایت‌هاست.</li>
      </ul>
    </main>"""


def terms_body() -> str:
    return """
    <main id="main" class="legal-content container">
      <h1>قوانین و شرایط استفاده</h1>
      <p>با استفاده از این وب‌سایت، شرایط زیر را می‌پذیرید. این متن نمونهٔ اطلاع‌رسانی است و مشاورهٔ حقوقی محسوب نمی‌شود.</p>
      <h2>پذیرش شرایط</h2>
      <p>دسترسی به محتوای سایت به منزلهٔ پذیرش این شرایط است.</p>
      <h2>استفادهٔ مجاز</h2>
      <p>از سایت تنها برای اطلاع از منو و تماس با رستوران استفاده کنید. هرگونه استفادهٔ مخرب یا غیرمجاز ممنوع است.</p>
      <h2>منو و قیمت</h2>
      <p>اطلاعات منو بر اساس منوی رسمی جمع‌آوری شده و ممکن است به‌روز نشده باشد.</p>
      <h2>مالکیت معنوی</h2>
      <p>نام، لوگو و محتوای برند متعلق به رستوران چتر آبی است. کپی‌برداری تجاری بدون اجازه مجاز نیست.</p>
      <h2>پیوندهای خارجی</h2>
      <p>مسئولیت محتوای سایت‌های third-party بر عهدهٔ همان سایت‌هاست.</p>
      <h2>دسترسی به سایت</h2>
      <p>ممکن است برای نگهداری موقتاً در دسترس نباشد.</p>
      <h2>تغییرات</h2>
      <p>شرایط و محتوا ممکن است تغییر کند.</p>
      <h2>تماس</h2>
      <p><a href="contact.html">صفحه تماس با ما</a></p>
    </main>"""


BODIES = {
    "index.html": index_body,
    "about.html": about_body,
    "menu.html": menu_body,
    "gallery.html": gallery_body,
    "contact.html": contact_body,
    "privacy-policy.html": privacy_body,
    "disclaimer.html": disclaimer_body,
    "terms.html": terms_body,
}


def main():
    for filename, body_fn in BODIES.items():
        key = filename.replace(".html", "")
        if key == "privacy-policy":
            meta_key = "privacy-policy"
        elif key == "terms":
            meta_key = "terms"
        else:
            meta_key = key if key in PAGES else key
        meta = PAGES[meta_key]
        html = (
            head(meta)
            + "\n"
            + header(meta["current"], meta["skip"])
            + "\n"
            + body_fn()
            + "\n"
            + footer()
        )
        (ROOT / filename).write_text(html, encoding="utf-8")
        print("wrote", filename)


if __name__ == "__main__":
    main()

# ישורון גליקמן — פלטפורמת קורסים דיגיטליים

מערכת מלאה למכירת קורסים מוקלטים, כולל LMS, סליקה, ואזור אישי.

---

## מבנה הפרויקט

```
glickman-courses/
├── app/
│   ├── page.tsx                     ← דף נחיתה (Landing Page)
│   ├── layout.tsx                   ← Root layout (RTL, fonts, SEO)
│   ├── globals.css
│   ├── login/page.tsx               ← כניסה
│   ├── register/page.tsx            ← הרשמה
│   ├── dashboard/page.tsx           ← הקורסים שלי
│   ├── courses/
│   │   ├── page.tsx                 ← רשימת קורסים
│   │   ├── [slug]/page.tsx          ← עמוד קורס + רכישה
│   │   └── watch/[slug]/page.tsx    ← נגן שיעורים (LMS)
│   ├── payment/
│   │   └── success/page.tsx         ← אחרי תשלום
│   ├── admin/page.tsx               ← לוח בקרה לניהול
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       ├── courses/
│       │   ├── route.ts             ← GET כל הקורסים
│       │   └── [slug]/route.ts      ← GET קורס + מודולים + עדויות
│       ├── orders/route.ts          ← POST יצירת הזמנה
│       ├── payment/
│       │   └── webhook/route.ts     ← Stripe / Tranzila / Grow webhook
│       ├── progress/route.ts        ← GET/POST מעקב צפייה
│       └── admin/
│           ├── courses/route.ts
│           └── lessons/route.ts
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── db.ts                        ← PostgreSQL pool
│   ├── auth.ts                      ← JWT + bcrypt
│   ├── payment.ts                   ← Stripe / Tranzila / Grow (מודולרי)
│   └── email.ts                     ← Nodemailer
├── database/
│   ├── schema.sql                   ← כל הטבלאות
│   └── seed.sql                     ← נתוני פתיחה
├── middleware.ts                    ← הגנת ניתובים
├── next.config.js
├── tailwind.config.js
└── .env.example
```

---

## התקנה והפעלה

### 1. דרישות מקדימות
- Node.js 18+
- PostgreSQL 14+

### 2. שכפול ותלויות
```bash
git clone <repo-url>
cd glickman-courses
npm install
```

### 3. הגדרת משתני סביבה
```bash
cp .env.example .env.local
# ערוך את .env.local עם הפרטים שלך
```

### 4. יצירת מסד הנתונים
```bash
# צור database:
createdb glickman_courses

# הרץ את הסכמה:
psql glickman_courses < database/schema.sql

# הרץ seed (קורסים ועדויות):
psql glickman_courses < database/seed.sql
```

### 5. הפעלה בסביבת פיתוח
```bash
npm run dev
# → http://localhost:3000
```

---

## מערכת הסליקה

ניתן להפעיל ספק אחד בלבד בכל פעם דרך משתני הסביבה:

| ספק | הפעלה |
|-----|-------|
| Stripe | `STRIPE_IS_ACTIVE=true` |
| Tranzila | `TRANZILA_IS_ACTIVE=true` |
| Grow | `GROW_IS_ACTIVE=true` |

### Stripe Webhook מקומי
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### רישום webhook ב-Stripe Dashboard:
- URL: `https://yourdomain.com/api/payment/webhook`
- אירועים: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`

---

## יצירת אדמין ראשון

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## פריסה ל-Vercel

```bash
npx vercel
# הגדר את כל משתני הסביבה ב-Vercel Dashboard
```

### Database ב-Production
מומלץ: **Neon** (PostgreSQL serverless, חינמי לתחילה)
```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/glickman_courses?sslmode=require
```

---

## תהליך הרכישה המלא

```
משתמש לוחץ "הצטרף עכשיו"
    ↓
POST /api/orders          ← יוצר הזמנה בסטטוס pending
    ↓
redirect → Stripe/Tranzila/Grow checkout
    ↓
לאחר תשלום: POST /api/payment/webhook
    ↓
order.status = 'paid'
enrollment נוצר
אימייל נשלח
    ↓
redirect → /payment/success
    ↓
/dashboard ← הקורס מופיע
```

---

## APIs

| Method | Path | תיאור | Auth |
|--------|------|-------|------|
| POST | /api/auth/register | הרשמה | — |
| POST | /api/auth/login | כניסה | — |
| POST | /api/auth/logout | יציאה | — |
| GET | /api/courses | כל הקורסים | — |
| GET | /api/courses/[slug] | קורס + מודולים | — |
| POST | /api/orders | יצירת הזמנה | Student |
| POST | /api/payment/webhook | אירועי תשלום | Provider HMAC |
| GET | /api/progress | התקדמות בקורס | Student |
| POST | /api/progress | עדכון התקדמות | Student |
| GET | /api/admin/courses | כל הקורסים | Admin |
| POST | /api/admin/courses | יצירת קורס | Admin |
| POST | /api/admin/lessons | יצירת שיעור | Admin |
| PUT | /api/admin/lessons | עדכון שיעור | Admin |

---

## Security

- סיסמאות: bcrypt (cost=12)
- JWT: HS256, תוקף 7 ימים, HttpOnly cookie
- Webhook: HMAC signature verification (Stripe)
- Middleware: הגנה על /dashboard, /admin
- HTTPS: נאכף ב-production
- SQL: Parameterized queries בלבד

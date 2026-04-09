# Official LOKUS Mail Setup

Add these variables to `.env.local` to enable official outgoing mail for:

- order confirmation emails
- internal order alerts
- contact form replies
- newsletter confirmation emails

Required variables:

```env
SMTP_HOST=smtp.your-mail-provider.com
SMTP_PORT=587
SMTP_USER=official-lokus-email@yourdomain.com
SMTP_PASS=your-mail-password-or-app-password
MAIL_FROM=LOKUS <official-lokus-email@yourdomain.com>
MAIL_TO_SUPPORT=support@lokus.store
```

Without these variables:

- checkout still works
- orders still save
- contact/newsletter APIs return a configuration error
- official email sending stays disabled

# Memorakrafts Website

Static corporate gifting website with an enquiry form. Enquiries are validated by a
Vercel serverless function (`api/submit.js`) and saved as rows in a Google Sheet
through a Google Apps Script web app (`Code.gs`).

## Folder structure

    memorakrafts-website/
    ├── api/submit.js      Vercel serverless function
    ├── assets/            logo and hamper images
    ├── index.html         page structure
    ├── style.css          styling
    ├── script.js          gallery, filters, lightbox, form
    ├── Code.gs            Google Apps Script (reference copy)
    ├── package.json
    ├── vercel.json
    ├── .env.example       placeholder only
    └── README.md

## 1. Google Sheet and Apps Script

1. Open your Google Sheet (account: Memorakrafts). Copy the ID from its URL, the part between `/d/` and `/edit`.
2. If the tab `Website Enquiries` already exists with old headers, rename it (for example `Old Enquiries`) so the new headers are created.
3. Open Extensions > Apps Script, delete the existing code, and paste the contents of `Code.gs`.
4. Replace `PASTE_YOUR_SPREADSHEET_ID_HERE` with your spreadsheet ID.
5. Click Save. Select `doGet` and click Run once to approve permissions.
6. Deploy > New deployment > Web app. Set Execute as: **Me**, Who has access: **Anyone**. Deploy and copy the URL ending in `/exec`.

## 2. Deploy on Vercel

1. Push this folder to a GitHub repository. The `api` folder must be at the top level.
2. In Vercel, click Add New > Project and import the repository.
3. Framework Preset: **Other**. Leave build and output settings empty.
4. Under Environment Variables, add `GOOGLE_APPS_SCRIPT_URL` with the `/exec` URL. Select Production.
5. Click Deploy.

## 3. Connect your domain

1. In the Vercel project, open Settings > Domains and add your domain and `www.` version.
2. At your domain registrar, add the DNS records Vercel shows. Usually:
   - A record: host `@`, value `76.76.21.21`
   - CNAME record: host `www`, value `cname.vercel-dns.com`
3. Wait until Vercel shows the domain as Valid. Keep your existing MX records if you use email on this domain.

## 4. Test

- Submit an enquiry on the live site. You should see "Thank you for submitting the form!"
- Check that a new row appears in the Website Enquiries sheet.
- Test an empty name and an invalid phone number. Both should show an error message.

## Changing the content

- Hamper names and images: edit the `hampers` list in `script.js`. Images go in `assets/` as `hamper-01.jpg` to `hamper-13.jpg`.
- Phone, WhatsApp and email: search for `918300102136` and `memoracrafts@gmail.com` in `index.html`.
- Analytics: if you use Google Tag Manager, add its snippet once in the `<head>` and once after the opening `<body>` tag.

## Security

Keep the Apps Script `/exec` URL out of GitHub and out of public chats. Anyone with
the URL can write rows to your sheet. If it is exposed, create a new deployment,
update `GOOGLE_APPS_SCRIPT_URL` in Vercel, and delete the old deployment.

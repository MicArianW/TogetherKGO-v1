# TogetherKGO v1.0 - With Community Board

## 🎉 What's New in Version 1.0

This version adds a **Community Board** feature that allows food bank staff to post updates that are approved by admins before going live.

### Key Features

✅ **Food Bank Submission Form** - Staff can submit updates easily
✅ **Admin Approval Workflow** - Via Decap CMS dashboard  
✅ **Automatic Publishing** - Approved posts go live automatically
✅ **Community Board Page** - Users see all approved updates
✅ **No Coding Required** - Everything managed through web interfaces

---

## 🏗️ How It Works

### The Complete Workflow

```
Food Bank Staff
   ↓ (Fills out form)
community-submit.html
   ↓ (Submits)
Netlify Forms
   ↓ (Captures submission)
Email Notification
   ↓
Admin Dashboard (/admin)
   ↓ (Reviews & approves)
Decap CMS
   ↓ (Creates JSON file)
Git Repository (data/posts/)
   ↓ (Triggers rebuild)
Netlify Auto-Deploy
   ↓ (Site updates)
Community Board (community.html)
   ↓
Users See Posts
```

### What Each Page Does

1. **home.html** - Landing page (unchanged)
2. **index.html** - Food resources map (unchanged)
3. **community-submit.html** - NEW - Food banks submit updates here
4. **community.html** - NEW - Public view of approved posts
5. **/admin** - NEW - Admin dashboard for approving posts

---

## 📁 File Structure

```
TogetherKGO-v2/
├── admin/
│   ├── index.html        ← Decap CMS dashboard
│   └── config.yml        ← Decap CMS configuration
│
├── assets/
│   ├── app.js           ← Main JavaScript
│   ├── styles.css       ← Styling
│   └── i18n.js          ← Language support
│
├── data/
│   ├── services.json    ← Food banks data
│   └── posts/           ← Community posts (created by Decap CMS)
│       └── [post files will be created here by admins]
│
├── functions/           ← Netlify serverless functions (optional)
│
├── home.html           ← Landing page
├── index.html          ← Food resources map
├── community.html      ← View community posts
├── community-submit.html ← Submit new posts
├── login.html          ← Login page
│
├── config.js           ← Google Maps API key
├── netlify.toml        ← Netlify configuration
│
└── DEPLOYMENT_GUIDE.md ← Full deployment instructions
```

---

## 🚀 Quick Start

### Option 1: Deploy to Netlify (Recommended)

**See DEPLOYMENT_GUIDE.md for complete step-by-step instructions**

Quick summary:
1. Push code to GitHub
2. Connect to Netlify
3. Enable Netlify Identity
4. Enable Git Gateway
5. Invite admin users
6. Done!

### Option 2: Local Testing

```bash
# Install Decap CMS proxy for local testing
npx decap-server

# In another terminal, serve the site
python -m http.server 8000

# Open http://localhost:8000
```

---

## 👥 User Roles

### Food Bank Staff
- Access: `community-submit.html`
- Can: Submit updates about their food bank
- Cannot: Approve posts or edit other food banks' posts

### Admin
- Access: `/admin` dashboard
- Can: Review, approve, reject, and publish posts
- Can: Edit any post before publishing

### Public Users
- Access: `community.html`
- Can: View all approved posts
- Can: Filter by food bank or post type

---

## 📝 Post Types

Posts can be categorized as:

1. **General Update** - Regular news and updates
2. **Special Event** - Upcoming events or programs
3. **Urgent Notice** - Time-sensitive information
4. **Food Available** - Same-day food availability announcements

---

## 🔒 Security Features

### Form Submissions
✅ Netlify spam protection
✅ Honeypot field to catch bots
✅ Form validation before submission
✅ Admin email notifications

### Admin Access
✅ Netlify Identity authentication
✅ Invite-only registration
✅ Password-protected dashboard
✅ Git-based version control

### Data Storage
✅ All posts stored in Git (full history)
✅ Every change is tracked and auditable
✅ Can revert changes if needed

---

## 💰 Costs

### Free Tier (Great for Starting)
- Netlify Hosting: **FREE**
- Netlify Forms: **100 submissions/month FREE**
- Netlify Identity: **1,000 users FREE**
- Decap CMS: **Completely FREE**
- GitHub: **FREE** for public repos

### Paid Options (If Needed)
- Extra form submissions: **$9 per 1,000**
- Netlify Pro (unlimited everything): **$19/month**

**Most small communities will stay within free tier!**

---

## 🎨 Customization

### Change Colors
Edit `assets/styles.css`:
```css
:root {
  --accent: #22c55e;  /* Change this for different theme */
}
```

### Add Food Banks
Edit `data/services.json` and `admin/config.yml`

### Modify Post Fields
Edit `admin/config.yml` to add/remove fields

---

## 📊 Example Use Cases

### Daily Food Availability
**Food Bank**: "Fresh produce available 2-4pm today!"
**Admin**: Approves within minutes
**Community**: Sees update, knows to visit today

### Event Announcements
**Food Bank**: "Holiday meal distribution Saturday 10am-2pm"
**Admin**: Approves and features
**Community**: Can plan ahead and register

### Urgent Closures
**Food Bank**: "Closed today due to emergency"
**Admin**: Fast-track approval
**Community**: Sees notice immediately, doesn't make unnecessary trip

---

## 🐛 Troubleshooting

### Posts Not Appearing
- Wait 30-60 seconds after publishing (Netlify rebuild time)
- Check that files are created in `data/posts/`
- Verify JavaScript console for errors

### Can't Access Admin
- Make sure Netlify Identity is enabled
- Check that you've been invited
- Clear browser cache

### Forms Not Working
- Verify `netlify.toml` is in root directory
- Check form has `data-netlify="true"` attribute
- Review Netlify Forms dashboard for submissions

---

## 📚 Documentation

- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **Netlify Docs** - https://docs.netlify.com
- **Decap CMS Docs** - https://decapcms.org/docs

---

## 🔄 Updating Content

### As a Food Bank
1. Go to community-submit.html
2. Fill out the form
3. Submit
4. Wait for admin approval
5. Post goes live when approved

### As an Admin
1. Go to your-site.netlify.app/admin
2. Log in
3. Click "Workflow" to see pending posts
4. Review submission
5. Click "Publish" to approve
6. Post goes live in ~30 seconds

---

## ✅ Pre-Launch Checklist

Before sharing with food banks:

- [ ] Deployed to Netlify successfully
- [ ] Netlify Identity enabled
- [ ] Git Gateway enabled
- [ ] Admin users invited and can log in
- [ ] Test submission works
- [ ] Test approval process works
- [ ] All 4 food banks in dropdown
- [ ] Community board displays posts correctly
- [ ] Email notifications configured
- [ ] Custom domain configured (if desired)

---

## 🎉 Ready to Launch!

Once deployed:
1. Share submission URL with food bank coordinators
2. Give them quick training (5 minutes)
3. Monitor submissions via Netlify dashboard
4. Approve posts via Decap CMS
5. Community benefits from real-time updates!

---

**Version**: 1.0
**Last Updated**: November 2025
**Built for**: Kingston-Galloway-Orton Park Community 🍎

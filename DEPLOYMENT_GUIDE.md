# 🚀 TogetherKGO - Netlify + Decap CMS Deployment Guide

## 📋 Complete Setup Instructions

Follow these steps to deploy your TogetherKGO app with the community board feature powered by Decap CMS and Netlify.

---

## Part 1: Prepare Your Repository

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `togetherkgo`
3. Make it **Public** (required for free Netlify)
4. Don't initialize with README (we have files already)
5. Click "Create repository"

### Step 2: Push Your Code to GitHub

Open Terminal/Command Prompt and run:

```bash
cd path/to/TogetherKGO-v2

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - TogetherKGO with Decap CMS"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/togetherkgo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy to Netlify

### Step 1: Sign Up for Netlify

1. Go to https://netlify.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Netlify to access your GitHub

### Step 2: Create New Site

1. Click "Add new site" → "Import an existing project"
2. Choose "GitHub"
3. Find and select your `togetherkgo` repository
4. Netlify will auto-detect settings from `netlify.toml`
5. Click "Deploy site"

⏱️ **Wait 1-2 minutes** for initial deployment

### Step 3: Configure Custom Domain (Optional)

1. Go to Site Settings → Domain management
2. Add your custom domain OR use Netlify's subdomain
3. Example: `togetherkgo.netlify.app`

---

## Part 3: Enable Netlify Identity (Authentication)

This is CRITICAL for the admin panel to work!

### Step 1: Enable Identity

1. In your Netlify site dashboard
2. Go to **Site Settings** → **Identity**
3. Click **"Enable Identity"**

### Step 2: Configure Registration

1. Under "Registration preferences"
2. Select **"Invite only"** (recommended)
3. This prevents random people from accessing your admin panel

### Step 3: Configure Git Gateway

1. Still in Identity settings
2. Scroll to **"Services"** section
3. Click **"Enable Git Gateway"**
4. This allows Decap CMS to save to your GitHub repo

### Step 4: Add Email Templates (Optional but Recommended)

1. Go to **Identity** → **Emails**
2. Customize invitation and confirmation emails
3. Or use default templates

---

## Part 4: Enable Netlify Forms

This captures food bank submissions!

### Step 1: Verify Forms Are Enabled

1. Go to **Site Settings** → **Forms**
2. Should show "Form detection" is enabled
3. Netlify will automatically detect the form in `community-submit.html`

### Step 2: Configure Form Notifications

1. Go to **Forms** in your site dashboard
2. Click on **"Notifications"**
3. Add email notification for new submissions:
   - Email: your-admin@email.com
   - Event: New form submission

---

## Part 5: Set Up Admin Access

### Step 1: Invite Admin Users

1. Go to **Identity** tab in Netlify
2. Click **"Invite users"**
3. Enter admin email addresses
4. They'll receive invitation emails

### Step 2: Admin Signs Up

When admin receives invitation email:
1. Click the link
2. Set password
3. Confirm account
4. You're now an admin!

### Step 3: Access Admin Panel

1. Go to `https://your-site.netlify.app/admin`
2. Log in with admin credentials
3. You should see the Decap CMS dashboard!

---

## Part 6: Test the Complete Workflow

### Test 1: Food Bank Submission

1. Go to `your-site.netlify.app/community-submit.html`
2. Fill out the form as a food bank would
3. Submit the form
4. Check: Did you receive email notification?
5. Go to Netlify dashboard → Forms
6. Verify submission appears there

### Test 2: Admin Approval

1. Go to `your-site.netlify.app/admin`
2. Log in as admin
3. You should see the Decap CMS dashboard
4. Go to "Workflow" tab
5. Create a new post OR review submissions
6. Click "Publish"
7. This creates a new file in `data/posts/`

### Test 3: Public View

1. Go to `your-site.netlify.app/community.html`
2. You should see the approved post
3. It may take 30-60 seconds for Netlify to rebuild

---

## Part 7: Connect Form Submissions to Decap CMS (Advanced)

By default, form submissions go to Netlify Forms dashboard. To have them appear in Decap CMS for approval, you need a serverless function:

### Create `functions/process-submission.js`

```javascript
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Create a draft post in Decap CMS format
    const postContent = `---
foodBankId: ${data.foodBank}
title: ${data.title}
message: ${data.message}
type: ${data.postType}
date: ${new Date().toISOString()}
contactInfo: ${data.publicContact || ''}
---`;

    // TODO: Create file in repo via GitHub API
    // This requires GitHub token and API calls
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission received' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process submission' })
    };
  }
};
```

**Note**: This is advanced and requires GitHub API setup. For simpler workflow, manually copy submissions from Netlify Forms to Decap CMS.

---

## 📊 Workflow Summary

### Food Bank Submits Update:
```
community-submit.html 
  → Netlify Form 
    → Email notification to admin
      → Admin checks Netlify Forms dashboard
```

### Admin Approves via Decap CMS:
```
Admin logs in at /admin
  → Creates new post in Decap CMS
    → Decap saves to data/posts/YYYY-MM-DD-title.md
      → Git commit created
        → Netlify auto-rebuilds site
          → Post appears on community.html
```

### Users View Posts:
```
community.html loads
  → JavaScript reads files from data/posts/
    → Displays approved posts
      → Updates every 5 minutes
```

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Starting)
- ✅ Netlify Hosting: FREE
- ✅ Netlify Forms: 100 submissions/month FREE
- ✅ Netlify Identity: 1,000 users FREE
- ✅ Decap CMS: Completely FREE
- ✅ GitHub: FREE for public repos

### If You Exceed Free Tier
- 📊 More than 100 form submissions/month: $9 per 1,000 submissions
- 👥 More than 1,000 users: Upgrade to Netlify Pro ($19/month)

**Recommendation**: Start with free tier, upgrade only if needed

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Site deploys successfully to Netlify
- [ ] Can access the site at Netlify URL
- [ ] Netlify Identity is enabled
- [ ] Git Gateway is enabled
- [ ] Admin can log in at /admin
- [ ] Decap CMS dashboard loads correctly
- [ ] Can submit form at /community-submit.html
- [ ] Form submissions appear in Netlify Forms
- [ ] Email notifications work
- [ ] Can create/publish posts in Decap CMS
- [ ] Posts appear on /community.html
- [ ] All 4 food banks appear in dropdowns

---

## 🔧 Troubleshooting

### Issue: Admin page shows error
**Solution**: 
- Make sure Netlify Identity is enabled
- Make sure Git Gateway is enabled
- Clear browser cache and try again

### Issue: Forms not working
**Solution**:
- Check netlify.toml includes form detection
- Verify form has `data-netlify="true"`
- Check Netlify Forms dashboard

### Issue: Posts not appearing
**Solution**:
- Wait 30-60 seconds after publishing
- Check that files are created in `data/posts/`
- Check browser console for JavaScript errors

### Issue: Can't log in to admin
**Solution**:
- Verify you've been invited via Netlify Identity
- Check email for invitation link
- Make sure you set a password

---

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Decap CMS Docs**: https://decapcms.org/docs
- **Netlify Community**: https://answers.netlify.com
- **GitHub Issues**: For code-specific problems

---

## 🎉 You're Done!

Once everything is set up:
1. Share the submission URL with food banks
2. Monitor submissions via Netlify dashboard
3. Approve posts via Decap CMS at /admin
4. Community sees updates in real-time!

**Your site is now live with full community board functionality! 🚀**

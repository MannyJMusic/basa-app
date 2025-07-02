# BASA Wiki Setup Guide

This directory contains the complete GitHub Wiki for the BASA project. Follow these instructions to set up the wiki on GitHub.

## 🚀 Setting Up the GitHub Wiki

### 1. Enable Wiki on GitHub

1. Go to your GitHub repository: `https://github.com/MannyJMusic/basa-app`
2. Click on the **Wiki** tab
3. Click **Create the first page** to enable the wiki

### 2. Clone the Wiki Repository

GitHub creates a separate repository for the wiki. Clone it:

```bash
# Clone the wiki repository
git clone https://github.com/MannyJMusic/basa-app.wiki.git

# Navigate to the wiki directory
cd basa-app.wiki
```

### 3. Copy Wiki Files

Copy all the `.md` files from this `wiki/` directory to the cloned wiki repository:

```bash
# Copy all wiki files
cp ../basa-app/wiki/*.md .

# Add all files to git
git add .

# Commit the changes
git commit -m "Add comprehensive BASA documentation wiki"

# Push to GitHub
git push origin main
```

### 4. Set Up the Home Page

The `Home.md` file will automatically become the wiki's home page. Make sure it's properly formatted and all links work.

## 📁 Wiki File Structure

```
basa-app.wiki/
├── Home.md                    # Main wiki home page
├── Getting-Started.md         # Development setup guide
├── Technology-Stack.md        # Technology overview
├── Developer-Tools.md         # Development utilities
├── Project-Overview.md        # High-level project overview
├── License-Information.md     # License details and usage
├── Contributing.md            # Contribution guidelines
├── Environment-Setup.md       # Environment configuration
├── Database-Setup.md          # Database configuration
├── Stripe-Integration.md      # Payment processing setup
├── Docker-Setup.md            # Containerization guide
├── Email-System.md            # Email functionality
├── Mailgun-Setup.md           # Email service setup
├── Email-Development.md       # Email template development
├── Design-System.md           # UI/UX guidelines
├── Design-Improvements.md     # Design enhancements
├── Sentry-Setup.md            # Error tracking setup
├── Debugging-Tools.md         # Debug utilities
├── Webhook-Testing.md         # Webhook testing guide
└── README.md                  # This setup guide
```

## 🔗 Wiki Navigation

The wiki uses GitHub's built-in navigation system. The sidebar will automatically show:

- **Home** - Main wiki entry point
- **Getting Started** - Quick setup guide
- **Technology Stack** - Technology overview
- **Developer Tools** - Development utilities
- **Project Overview** - High-level architecture
- **License Information** - Usage terms
- **Contributing** - How to contribute

## 📝 Adding New Pages

To add new wiki pages:

1. **Create the Markdown file** in this `wiki/` directory
2. **Follow the naming convention** - Use kebab-case (e.g., `new-page.md`)
3. **Add links** - Update the Home.md file to include links to new pages
4. **Copy to wiki repository** - Copy the new file to the GitHub wiki repository
5. **Commit and push** - Commit the changes to the wiki repository

## 🔄 Updating the Wiki

### Regular Updates

1. **Edit files** in this `wiki/` directory
2. **Test locally** - Ensure all links work and formatting is correct
3. **Copy to wiki** - Copy updated files to the GitHub wiki repository
4. **Commit changes** - Commit and push to GitHub

### Automated Updates (Optional)

You can set up a script to automatically sync changes:

```bash
#!/bin/bash
# sync-wiki.sh

# Copy wiki files to GitHub wiki repository
cp wiki/*.md ../basa-app.wiki/

# Navigate to wiki repository
cd ../basa-app.wiki

# Add and commit changes
git add .
git commit -m "Update wiki documentation"
git push origin main
```

## 🎨 Wiki Customization

### Sidebar Customization

Create a `_Sidebar.md` file in the wiki repository to customize the sidebar:

```markdown
# BASA Documentation

## Getting Started
- [Home](Home)
- [Getting Started](Getting-Started)
- [Project Overview](Project-Overview)

## Development
- [Technology Stack](Technology-Stack)
- [Developer Tools](Developer-Tools)
- [Environment Setup](Environment-Setup)

## Configuration
- [Database Setup](Database-Setup)
- [Stripe Integration](Stripe-Integration)
- [Docker Setup](Docker-Setup)

## Features
- [Email System](Email-System)
- [Design System](Design-System)
- [Debugging Tools](Debugging-Tools)

## Legal
- [License Information](License-Information)
- [Contributing](Contributing)
```

### Footer Customization

Create a `_Footer.md` file for consistent footer content:

```markdown
---
**Built with ❤️ for the Business Association of San Antonio**

[View Source Code](https://github.com/MannyJMusic/basa-app) | [Report Issues](https://github.com/MannyJMusic/basa-app/issues)
```

## 🔍 Wiki Features

### GitHub Wiki Benefits

- **Version Control** - Full Git history for all changes
- **Collaboration** - Multiple contributors can edit
- **Search** - Built-in search functionality
- **Markdown Support** - Rich formatting and syntax highlighting
- **Automatic Navigation** - Sidebar and breadcrumb navigation
- **Mobile Friendly** - Responsive design for all devices

### Best Practices

1. **Keep it Updated** - Regularly update documentation
2. **Use Clear Navigation** - Organize content logically
3. **Include Examples** - Provide code examples and screenshots
4. **Cross-Reference** - Link between related pages
5. **Test Links** - Ensure all internal and external links work

## 🚨 Troubleshooting

### Common Issues

**Wiki not showing up**
- Ensure the wiki is enabled in repository settings
- Check that the wiki repository exists

**Broken links**
- Verify all internal links use correct page names
- Test external links regularly

**Formatting issues**
- Check Markdown syntax
- Ensure proper spacing and indentation

**Images not displaying**
- Upload images to the wiki repository
- Use relative paths for internal images

## 📞 Support

For wiki-related issues:

1. **Check GitHub Documentation** - [GitHub Wiki Guide](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
2. **Review Wiki Settings** - Check repository wiki settings
3. **Contact the Team** - Reach out for technical support

---

**The BASA Wiki provides comprehensive documentation for developers, contributors, and users of the BASA platform.** 
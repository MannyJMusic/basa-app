## Transactional Email Templates

HTML email templates for Shopify and general purpose, built with [Maizzle](https://maizzle.com).

## Getting Started

1. Install dependencies

    ```sh
    # first, `cd` into the directory
    cd Transactional-Email-Templates

    # install dependencies via NPM
    npm install

    npm install -g @maizzle/cli
    ```

## Build commands

For local development, with live browser preview:

```sh
maizzle serve
```

Build Transactional emails:

```sh
maizzle build transactional
```

Build Shopify emails:

```sh
maizzle build shopify
```

## About Maizzle

Maizzle is an email framework that helps you quickly build emails with utility-first CSS and advanced, email-specific post-processing. It's powered by [Tailwind CSS](https://tailwindcss.com/) and an email-tailored, custom Node.js build system that enables various transformations necessary for HTML emails.

Maizzle documentation is available at https://maizzle.com

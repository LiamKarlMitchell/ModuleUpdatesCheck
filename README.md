# Description

A simple application to parse the Magento store page for details of the product, and if different to what is stored in the json file then send an email notification to note differences in the product details.

# Installation

npm install

# Configuration

Create a .env file containing the following

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=EmailUsername
SMTP_PASS=EmailPassword
MAIL_FROM="Mail From Name" <SenderEmail>
MAIL_TO=Where to send email
```

Add the URI key part from the Marketplace magento store for each product into the marketplace.magento.products.json like so.

```json
{
    "product-uri-here": {},
    .......
}
```

Example the Uri of the following link is "mageplaza-module-smtp".
https://marketplace.magento.com/mageplaza-module-smtp.html


# Run

```
node app
```
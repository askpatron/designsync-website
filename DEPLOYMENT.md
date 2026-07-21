# Design Sync marketing site — deployment

Target: **https://designs.trydesignsync.com**

This is a static HTML/CSS/JavaScript site. It has no build step. The selected
host is the existing VPS at `159.198.47.197`.

## Current blockers

- The Cloudflare `designs` DNS record has not been created.
- This Mac's SSH identity is rejected by `root@159.198.47.197`.
- The repository has no remote, so deployment currently uses `rsync`.

The authenticated review form in the Laravel app must be deployed before this
site, because the marketing CTA links to:

`https://app.trydesignsync.com/portal/testimonials`

## One-time server setup

First create a proxied Cloudflare DNS record:

- Type: `A`
- Name: `designs`
- IPv4 address: `159.198.47.197`
- Proxy status: Proxied

Then connect through the VPS console or an authorized SSH terminal:

```bash
mkdir -p /var/www/designs.trydesignsync.com
chown root:nginx /var/www/designs.trydesignsync.com
chmod 755 /var/www/designs.trydesignsync.com

openssl x509 -in /etc/ssl/trydesignsync-origin.pem -noout -subject -ext subjectAltName
```

Confirm that the certificate covers `*.trydesignsync.com` or
`designs.trydesignsync.com`. Do not continue with that certificate if it does
not.

Create `/etc/nginx/conf.d/designs.trydesignsync.com.conf`:

```nginx
server {
    listen 80;
    server_name designs.trydesignsync.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name designs.trydesignsync.com;

    root /var/www/designs.trydesignsync.com;
    index index.html;

    ssl_certificate /etc/ssl/trydesignsync-origin.pem;
    ssl_certificate_key /etc/ssl/trydesignsync-origin-key.pem;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(?:css|js|jpg|jpeg|png|gif|webp|svg|ico|mp4|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Validate and activate it:

```bash
nginx -t
systemctl reload nginx
```

## Deploy an update

Run from the local Mac after SSH access is restored:

```bash
cd "/Users/mac/Claude Code/designsync-website"

ssh root@159.198.47.197 \
  'mkdir -p /var/backups/designs.trydesignsync.com /var/www/designs.trydesignsync.com &&
   if [ -n "$(ls -A /var/www/designs.trydesignsync.com 2>/dev/null)" ]; then
     tar -C /var/www/designs.trydesignsync.com -czf \
       "/var/backups/designs.trydesignsync.com/site-$(date +%Y%m%d-%H%M%S).tar.gz" .
   fi'

rsync -az --delete \
  --exclude ".git/" \
  --exclude ".DS_Store" \
  --exclude "DEPLOYMENT.md" \
  --exclude "PROGRESS.md" \
  --exclude "docs/" \
  --exclude "*.docx" \
  --exclude "~$*" \
  ./ root@159.198.47.197:/var/www/designs.trydesignsync.com/

ssh root@159.198.47.197 \
  'chown -R root:nginx /var/www/designs.trydesignsync.com &&
   find /var/www/designs.trydesignsync.com -type d -exec chmod 755 {} \; &&
   find /var/www/designs.trydesignsync.com -type f -exec chmod 644 {} \; &&
   nginx -t &&
   systemctl reload nginx'
```

## Verify

```bash
curl -fsSI https://designs.trydesignsync.com/
curl -fsS https://designs.trydesignsync.com/ | grep -F "Leave a review"
curl -fsSI https://app.trydesignsync.com/portal/testimonials
```

The app URL should redirect signed-out visitors to login and return the review
form after a client signs in. Also verify the Tawk widget on the real domain.

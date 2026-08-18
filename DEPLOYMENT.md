# Design Sync marketing site — deployment

Target: **https://designs.trydesignsync.com**

Staging target: **https://designs-staging.trydesignsync.com**

This is a static HTML/CSS/JavaScript site. It has no build step. Production
and marketing staging both live on the DesignSync VPS at `104.207.75.124`.

Pushing `main` does **not** deploy this site. The GitHub workflow is
validation-only: it cannot SSH, cannot run `remote-deploy.sh`, and cannot
rebuild leftover Docker at `148.230.125.157`. That old host is not production
and is not public staging. The owner deploys from the native live server.

## Marketing staging

The staging website uses the repository's `staging` branch and is isolated at
`/var/www/designs-staging.trydesignsync.com`. It is protected by HTTP Basic
Auth and sends `X-Robots-Tag: noindex, nofollow, noarchive`. JavaScript rewrites
all portal links and API/chat traffic to `https://staging.trydesignsync.com`,
so staging reviews cannot create production purchases or support records.

Create a proxied Cloudflare DNS record:

- Type: `A`
- Name: `designs-staging`
- IPv4 address: `104.207.75.124`
- Proxy status: Proxied
- TTL: Auto

On the new VPS, create the checkout and publish directory:

```bash
sudo install -d -o serveradmin -g nginx -m 2750 /opt/designsync-website-staging
sudo install -d -o nginx -g nginx -m 0750 /var/www/designs-staging.trydesignsync.com
git clone --branch staging --single-branch \
  https://github.com/askpatron/designsync-website.git \
  /opt/designsync-website-staging
```

Create a separate Basic Auth password (do not commit or paste it into chat):

```bash
sudo dnf install -y httpd-tools
sudo htpasswd -c /etc/nginx/.designsync-marketing-staging designsync-test
sudo chown root:nginx /etc/nginx/.designsync-marketing-staging
sudo chmod 0640 /etc/nginx/.designsync-marketing-staging
```

The nginx vhost must use `server_name designs-staging.trydesignsync.com`, root
`/var/www/designs-staging.trydesignsync.com`, the existing wildcard Cloudflare
origin certificate, Basic Auth in `location /`, and these response headers:

```nginx
add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
```

Because the marketing staging site embeds the Laravel staging chat, the nginx
vhost for `staging.trydesignsync.com` must permit that one frame ancestor with
`Content-Security-Policy: frame-ancestors 'self' https://designs-staging.trydesignsync.com`
and must not send `X-Frame-Options: SAMEORIGIN` for the public `/chat` routes.

Deploy the current staging branch on the VPS:

```bash
cd /opt/designsync-website-staging
sudo git fetch origin staging
sudo git reset --hard origin/staging

test -f index.html || { echo "ABORT: checkout is empty"; exit 1; }

sudo rsync -a --delete \
  --exclude ".git/" \
  --exclude ".DS_Store" \
  --exclude "DEPLOYMENT.md" \
  /opt/designsync-website-staging/ \
  /var/www/designs-staging.trydesignsync.com/

sudo chown -R nginx:nginx /var/www/designs-staging.trydesignsync.com
sudo restorecon -R /var/www/designs-staging.trydesignsync.com
sudo nginx -t
sudo systemctl reload nginx
```

## Current blockers

- This Mac may not have passwordless root SSH to `104.207.75.124`; the owner deploys from an authorized VPS session.
- Production marketing deploys from the VPS git checkout (`/opt/designsync-website`), not from a Mac `rsync` to the old 1 GB box.

The authenticated review form in the Laravel app must be deployed before this
site, because the marketing CTA links to:

`https://app.trydesignsync.com/portal/testimonials`

## One-time server setup

First create a proxied Cloudflare DNS record:

- Type: `A`
- Name: `designs`
- IPv4 address: `104.207.75.124`
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

## Deploy an update (VPS only)

Source of truth: **https://github.com/askpatron/designsync-website** (public, so
the VPS clones it without a token). Agent pushes to `main`; owner deploys from
the VPS. No Mac `rsync` required.

This site shares the production VPS with `app.trydesignsync.com` (Laravel).
`houseofnkineya.ng` is not on this box. Every path below is scoped to
`/var/www/designs.trydesignsync.com`, so nothing here touches the Laravel app.

### One-time setup on the VPS

```bash
mkdir -p /opt /var/backups/designs.trydesignsync.com
rm -rf /opt/designsync-website
git clone https://github.com/askpatron/designsync-website.git /opt/designsync-website
```

### Every deploy (paste on the VPS as root)

The `index.html` check is not decoration. A failed clone once left
`/opt/designsync-website` empty, and `rsync --delete` faithfully copied that
emptiness over the live site. The guard makes that impossible.

```bash
cd /opt/designsync-website && git fetch origin && git reset --hard origin/main

test -f /opt/designsync-website/index.html || { echo "ABORT: checkout is empty, not syncing"; exit 1; }

tar -C /var/www/designs.trydesignsync.com -czf \
  "/var/backups/designs.trydesignsync.com/site-$(date +%Y%m%d-%H%M%S).tar.gz" . 2>/dev/null || true

rsync -a --delete \
  --exclude ".git/" \
  --exclude ".DS_Store" \
  --exclude "DEPLOYMENT.md" \
  --exclude "PROGRESS.md" \
  --exclude "docs/" \
  --exclude "*.docx" \
  --exclude "~$*" \
  /opt/designsync-website/ /var/www/designs.trydesignsync.com/

chown -R root:nginx /var/www/designs.trydesignsync.com
find /var/www/designs.trydesignsync.com -type d -exec chmod 755 {} \;
find /var/www/designs.trydesignsync.com -type f -exec chmod 644 {} \;
restorecon -R /var/www/designs.trydesignsync.com 2>/dev/null || true
nginx -t && systemctl reload nginx

# Confirm the mobile/cache-bust release is live:
grep -F 'v=20260728d' /var/www/designs.trydesignsync.com/index.html
grep -F 'width: 190%' /var/www/designs.trydesignsync.com/css/style.css
ls -la /var/www/designs.trydesignsync.com/css/style.css /var/www/designs.trydesignsync.com/js/main.js
```

Then hard-reload https://designs.trydesignsync.com on your phone (CSS URL should show `?v=20260728d`). If Cloudflare still serves the old CSS, purge `/css/*` and `/js/*`.

## Verify

```bash
curl -fsSI https://designs.trydesignsync.com/
curl -fsS https://designs.trydesignsync.com/ | grep -F "Leave a review"
curl -fsSI https://app.trydesignsync.com/portal/testimonials
```

The app URL should redirect signed-out visitors to login and return the review
form after a client signs in. Also verify the Tawk widget on the real domain.

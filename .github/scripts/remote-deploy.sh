#!/usr/bin/env bash
set -euo pipefail

# Disabled. This script rebuilt leftover Docker at /apps/designsync on
# 148.230.125.157. That host is not production and is not public staging.
# Marketing production: /var/www/designs.trydesignsync.com on 104.207.75.124
# Marketing staging: /var/www/designs-staging.trydesignsync.com on the same server.

cat >&2 <<'EOF'
Refused: remote-deploy.sh is disabled.

It targeted leftover Docker at 148.230.125.157, which is not production
and is not public staging.

Owner-run native marketing deploy is documented in DEPLOYMENT.md on
104.207.75.124. Do not rebuild the old shared Docker stack.
EOF

exit 1

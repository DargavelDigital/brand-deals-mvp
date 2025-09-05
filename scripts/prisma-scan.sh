#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; YEL='\033[0;33m'; GRN='\033[0;32m'; NC='\033[0m'
fail=0

have_rg() { command -v rg >/dev/null 2>&1; }
S=""; if have_rg; then S="rg -n --hidden --glob '!node_modules/**' --glob '!.next/**' --glob '!.git/**'"; else S="grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git"; fi

echo -e "${YEL}== Prisma Scan ==${NC}"

echo -e "\n${YEL}1) prisma/schema.prisma checks${NC}"
if ! grep -Eiq '^generator +client' prisma/schema.prisma; then
  echo -e "${RED}✗ No client generator block found in prisma/schema.prisma${NC}"; fail=1
fi
if ! grep -Eiq '^ *provider *= *"prisma-client-js"' prisma/schema.prisma; then
  echo -e "${RED}✗ generator.client.provider is not prisma-client-js${NC}"; fail=1
fi
if ! grep -Eiq '^ *engineType *= *"binary"' prisma/schema.prisma; then
  echo -e "${RED}✗ generator.client.engineType is not \"binary\"${NC}"; fail=1
fi
if ! grep -Eiq '^datasource +db' prisma/schema.prisma; then
  echo -e "${RED}✗ No datasource db block found${NC}"; fail=1
fi
if ! grep -Eiq '^ *provider *= *"postgresql"' prisma/schema.prisma; then
  echo -e "${RED}✗ datasource.db.provider is not \"postgresql\"${NC}"; fail=1
fi
if ! grep -Eiq '^ *url *= *env\("DATABASE_URL"\)' prisma/schema.prisma; then
  echo -e "${RED}✗ datasource.db.url does not use env(\"DATABASE_URL\")${NC}"; fail=1
fi

echo -e "\n${YEL}2) Edge/Data Proxy indicators in code${NC}"

# Any edge client import?
if $S "@prisma/client/edge" >/dev/null; then
  echo -e "${RED}✗ Found imports of @prisma/client/edge:${NC}"
  $S "@prisma/client/edge"; fail=1
else
  echo -e "${GRN}✓ No @prisma/client/edge imports${NC}"
fi

# Any accelerate usage?
if $S "withAccelerate\\(" >/dev/null; then
  echo -e "${RED}✗ Found withAccelerate(...) usage:${NC}"
  $S "withAccelerate\\("; fail=1
else
  echo -e "${GRN}✓ No withAccelerate usage${NC}"
fi

# Any runtime='edge' in files that also use Prisma?
edge_hits=$($S "export const runtime = 'edge'" || true)
if [[ -n "$edge_hits" ]]; then
  echo -e "${YEL}! runtime='edge' found (verify these files do NOT import Prisma):${NC}"
  echo "$edge_hits"
  # If any of those files also reference Prisma, mark as fail
  while IFS= read -r line; do
    file="${line%%:*}"
    if $S -N "PrismaClient|@prisma/client" "$file" >/dev/null 2>&1; then
      echo -e "${RED}✗ ${file} uses runtime='edge' AND references Prisma${NC}"
      fail=1
    fi
  done <<< "$edge_hits"
else
  echo -e "${GRN}✓ No runtime='edge' declarations${NC}"
fi

# Any prisma:// URLs hardcoded or passed?
if $S "prisma:\\/\\/" >/dev/null; then
  echo -e "${RED}✗ Found prisma:// URL references:${NC}"
  $S "prisma:\\/\\/"; fail=1
else
  echo -e "${GRN}✓ No prisma:// URL references${NC}"
fi

echo -e "\n${YEL}3) Multiple Prisma client instances${NC}"
# Any construction of PrismaClient outside central file?
central='src/lib/prisma.ts'
new_hits=$($S "new +PrismaClient\\(" || true)
if [[ -n "$new_hits" ]]; then
  echo -e "${YEL}! new PrismaClient() calls found:${NC}"
  echo "$new_hits"
  # Flag if not in the central file
  while IFS= read -r line; do
    file="${line%%:*}"
    if [[ "$file" != "$central" ]]; then
      echo -e "${RED}✗ new PrismaClient() outside $central -> ${file}${NC}"
      fail=1
    fi
  done <<< "$new_hits"
else
  echo -e "${GRN}✓ No rogue new PrismaClient() calls${NC}"
fi

# Any direct imports of @prisma/client in multiple wrappers?
if $S "from '@prisma/client'" | grep -v "$central" >/dev/null; then
  echo -e "${YEL}! Other files import @prisma/client directly (ensure they import from $central instead):${NC}"
  $S "from '@prisma/client'" | grep -v "$central" || true
  # Not auto-failing: sometimes types are imported. Flag as warning.
else
  echo -e "${GRN}✓ Only central prisma import found (or none)${NC}"
fi

echo -e "\n${YEL}4) Build-time env toggles that can force Data Proxy${NC}"
if $S "PRISMA_DATA_PROXY|PRISMA_ACCELERATE|PRISMA_GENERATE_DATAPROXY|PRISMA_CLIENT_ENGINE_TYPE" >/dev/null; then
  echo -e "${YEL}! Found potentially dangerous PRISMA_* toggles:${NC}"
  $S "PRISMA_DATA_PROXY|PRISMA_ACCELERATE|PRISMA_GENERATE_DATAPROXY|PRISMA_CLIENT_ENGINE_TYPE" || true
  echo -e "${YEL}  -> Ensure these are NOT set (or are explicitly false) during build & runtime${NC}"
else
  echo -e "${GRN}✓ No Data Proxy-related env toggles in repo${NC}"
fi

echo -e "\n${YEL}5) Netlify config quick scan (if present)${NC}"
if [[ -f "netlify.toml" ]]; then
  if grep -Eiq 'PRISMA_(DATA_PROXY|ACCELERATE|GENERATE_DATAPROXY|CLIENT_ENGINE_TYPE)' netlify.toml; then
    echo -e "${RED}✗ netlify.toml sets Data Proxy toggles; remove them${NC}"
    grep -niE 'PRISMA_(DATA_PROXY|ACCELERATE|GENERATE_DATAPROXY|CLIENT_ENGINE_TYPE)' netlify.toml || true
    fail=1
  else
    echo -e "${GRN}✓ netlify.toml has no Data Proxy toggles${NC}"
  fi
else
  echo -e "${GRN}✓ netlify.toml not present or not relevant${NC}"
fi

echo -e "\n${YEL}6) Verify central prisma file uses node runtime (APIs only)${NC}"
api_prisma_refs=$($S "@/lib/prisma" | grep -E "/app/api/.*/route\\.(ts|js)" || true)
if [[ -n "$api_prisma_refs" ]]; then
  echo -e "${YEL}! API routes that import the central prisma client:${NC}"
  echo "$api_prisma_refs"
  # Suggest ensuring node runtime
  echo -e "${YEL}  -> Ensure these files have: export const runtime = 'nodejs'${NC}"
fi

if [[ $fail -ne 0 ]]; then
  echo -e "\n${RED}❌ Prisma scan found blocking issues. Fix the red items above.${NC}"
  exit 1
fi

echo -e "\n${GRN}✅ Prisma scan passed. No blocking issues detected.${NC}"

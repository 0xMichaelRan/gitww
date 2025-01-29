echo -ne "\033]0;gitww-frontend\007"
cd /usr/local/hub/gitww/frontend-nextjs
pnpm install
npm run dev

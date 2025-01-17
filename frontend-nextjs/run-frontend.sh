echo -ne "\033]0;gitww-frontend\007"
cd ~/hub/gitww-monorepo/frontend-nextjs
cursor ..
open "http://localhost:3000/"
npm run dev

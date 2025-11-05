FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm i -g pnpm@9 && pnpm install --prod=false
COPY . .
RUN pnpm build
EXPOSE 4000
CMD ["pnpm","start"]

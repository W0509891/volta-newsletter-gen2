FROM node:20-alpine
LABEL authors="lemema"

WORKDIR /app
RUN apk add --no-cache git
RUN apk add --no-cache python3 py3-pip

COPY package.json package-lock.json ./
RUN npm i

COPY .next-prod/ ./.next-prod/
COPY next.config.* ./
COPY public/ ./public/
COPY templates ./templates/

run ls -al

RUN #npm i
run #npm run build

ENTRYPOINT ["npm" , "run", "start"]

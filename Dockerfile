FROM node:20-alpine
LABEL authors="lemema"

WORKDIR /app
RUN apk add --no-cache git

COPY . .

run ls -al

RUN npm i
run npm run build

ENTRYPOINT ["npm" , "run", "start"]

#CMD ["yarn", "run", "start-app"]

#EXPOSE 3000
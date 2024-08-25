FROM node:slim

WORKDIR /attendance_system

COPY . /attendance_system

RUN apt update

RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN npm install

CMD ["node", "index.js"]

EXPOSE 3000
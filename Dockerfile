# Development
FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

# Build production
FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

COPY --chown=node:node . .

RUN npm run build

USER node

# Production
FROM node:18-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
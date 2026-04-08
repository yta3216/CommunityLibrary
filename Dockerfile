FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./

ARG REACT_APP_API_BASE_URL=
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm run build

FROM node:22-alpine AS backend-build

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev

COPY backend/ ./

COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 4000

CMD ["node", "server.js"]
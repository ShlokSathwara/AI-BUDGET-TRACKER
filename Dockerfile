FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy server source
COPY server/ ./server/

EXPOSE 5000

CMD ["node", "server/index.js"]

FROM node:18

# Install ts-node and typescript globally
RUN npm install -g ts-node typescript

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install

# Build step (optional if running via ts-node)
RUN tsc

EXPOSE 4000

# Start app using ts-node
CMD ["ts-node", "dist/index.js"]

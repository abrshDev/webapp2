# Use a maintained prebuilt Node + Chromium image
FROM browserless/chrome:latest

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY . .

# Set Puppeteer executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]

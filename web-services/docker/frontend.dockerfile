FROM node:20

# Set the working directory
WORKDIR /app

# Copy the rest of the application
COPY apps/frontend/package.json ./
COPY apps/frontend/ ./

RUN npm install --verbose

EXPOSE 5173

CMD ["npm", "run", "dev"]
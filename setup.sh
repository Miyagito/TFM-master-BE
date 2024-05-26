#USERS CREDENTIALS

# ADMIN:
# admin name 
# password123

# REGULAR USER
# user name
# password123


# Set up the database
echo "Setting up the database..."
mysql -u root -p < setup.sql || { echo 'Database setup failed' ; exit 1; }

echo "Database setup completed successfully."

# Install npm dependencies
echo "Installing npm dependencies..."
npm install || { echo 'Failed to install npm dependencies'; exit 1; }

echo "Npm dependencies installed successfully."

# Start the project
echo "Starting the server..."
node server.js || { echo 'Failed to start the server'; exit 1; }

echo "Server started successfully."


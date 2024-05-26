#USERS CREDENTIALS

# ADMIN:
# admin name 
# password123

# REGULAR USER
# user name
# password123


# Set up the database
mysql -u root -p < setup.sql

# Install npm dependencies and start the project
cd /src
npm install
npm start


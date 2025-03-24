# Fiks Ferdig - Todo List Application

## Overview
"Fiks Ferdig" is a modern todo list application designed to help users manage their daily tasks efficiently. The application allows users to create, view, and manage their todo lists, ensuring that they can keep track of their responsibilities day by day. Only authenticated users can create and view their own todo lists.

## Features
- User registration and authentication
- Create, read, update, and delete todo items
- Daily todo lists that can be navigated through different days
- User-specific todo lists, ensuring privacy and security

## Project Structure
```
fiks-ferdig
├── src
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── authController.js
│   │   └── todoController.js
│   ├── middlewares
│   │   └── auth.js
│   ├── models
│   │   ├── Todo.js
│   │   └── User.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   └── todoRoutes.js
│   ├── utils
│   │   └── dateHelpers.js
│   └── views
│       ├── auth
│       │   ├── login.ejs
│       │   └── register.ejs
│       ├── partials
│       │   ├── footer.ejs
│       │   ├── header.ejs
│       │   └── navbar.ejs
│       ├── todos
│       │   ├── create.ejs
│       │   └── index.ejs
│       └── index.ejs
├── public
│   ├── css
│   │   └── style.css
│   └── js
│       └── main.js
├── app.js
├── package.json
├── .env
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fiks-ferdig.git
   ```
2. Navigate to the project directory:
   ```
   cd fiks-ferdig
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Set up your MongoDB database and update the `.env` file with your connection string.

## Usage
1. Start the application:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to access the application.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
# Student Management System - Frontend

React frontend for the Student Management System.

## Features

- Role-based authentication (Admin, Teacher, Student)
- Responsive design with TailwindCSS
- Dashboard with statistics
- Student, Teacher, and Class management
- Attendance tracking
- Grade management
- Reports and analytics

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root of the client directory:

```env
REACT_APP_API_URL= http://localhost:5000/api
```
REACT_APP_API_URL= 'https://ilm-possible-education.onrender.com/api'

### Running the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context for state management
├── pages/          # Page components
├── services/       # API service functions
├── App.js          # Main application component
└── index.js        # Entry point
```

## Technologies Used

- React 18
- React Router DOM
- Axios
- TailwindCSS
- Headless UI
- Hero Icons


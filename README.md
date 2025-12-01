# BookVerse

BookVerse is a web application for discovering and reviewing books. It features a user authentication system, book catalog with search and filtering, user reviews, and a favorites list.

## Features
- **Home Page**: Displays a random selection of books.
- **Search & Filter**: Search by title/author and filter by category (genre).
- **Book Details**: View synopsis, metadata, and submit reviews with star ratings.
- **User Accounts**: Register, login, and manage profile details (name, email, password).
- **Favorites**: Add books to a personal favorites list and manage them.
- **Reviews**: Write reviews for books and manage them from the profile page.

## Setup Instructions

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher (or MariaDB)
- Web server (Apache, Nginx, or PHP built-in server)

### Installation
1.  **Clone the repository** (or extract the project files).
2.  **Database Setup**:
    - Create a new MySQL database named `bookverse`.
    - Import the provided SQL file: `bookverse_export.sql`.
    - Configure the database connection in `api/db.php` if your credentials differ from the default (User: `root`, Password: ``).
3.  **Run the Application**:
    - Open a terminal in the project root directory.
    - Start the PHP built-in server:
      ```bash
      php -S localhost:8000 -t .
      ```
4.  **Access the App**:
    - Open your browser and navigate to `http://localhost:8000/public/index.html`.

## Technologies Used
- **Backend**: PHP (Vanilla)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: MySQL

## Assessment 3 Requirements Checklist
- [x] Home page with random products
- [x] Navigation menu with dropdowns
- [x] Category filtering
- [x] Detailed view page (metadata, reviews form)
- [x] User registration & sign-in
- [x] Product rating system
- [x] Search functionality
- [x] User favorites list (add/remove)
- [x] User account page (manage reviews, update details)

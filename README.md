
# Secure Information Sharing Portal

#### Description:
The Secure Information Sharing Portal is a web application designed to allow users to securely store and retrieve sensitive information using password-based encryption. The application leverages modern cryptographic techniques to ensure that data remains confidential and can only be accessed by users who possess the correct password. By employing end-to-end encryption, the portal enhances data security, ensuring that user information is safeguarded against unauthorized access.

### Project Overview
This project consists of a frontend developed using HTML, CSS, and JavaScript, and a backend implemented with the Flask web framework in Python. The application utilizes SQLite for data storage, providing a lightweight database solution for managing user credentials and encrypted information.

### Functionality
The portal allows users to perform the following functions:
1. **Save Information:** Users can enter data into the portal, which is then encrypted using the AES-GCM algorithm before being stored in the database. A password is required to encrypt the data, and the encryption key is derived using the PBKDF2 method, which enhances security.
2. **Retrieve Information:** Users can input their password to access previously stored information. The application retrieves the associated encrypted data from the database and decrypts it using the same password, ensuring that only the correct password can access the data.

### File Descriptions
- **app.py:** This is the main backend file that sets up the Flask application, handles user requests, and manages the database connection. It includes routes for saving and retrieving encrypted information. The database schema is defined here, with a table that stores password hashes, salts, initialization vectors (IVs), and ciphertexts.

- **index.html:** The main HTML file that serves as the user interface. It contains form elements for user input, such as password fields and text areas for entering sensitive information. The file also includes script tags for importing the necessary JavaScript functionality.

- **style.css:** This file contains the styling for the application, ensuring a clean and user-friendly interface. It uses CSS to improve the overall layout and appearance of the web application.

- **script.js:** This JavaScript file handles the frontend logic for interacting with the application. It manages user input, sends requests to the Flask backend for saving and retrieving information, and implements the encryption and decryption processes using the Web Crypto API.

### Design Choices
While developing this project, several design choices were made to enhance security and usability:
1. **Encryption Method:** AES-GCM was chosen for encryption due to its efficiency and security, providing both confidentiality and integrity for the data. This choice was based on current best practices in cryptography.
2. **Password Hashing:** PBKDF2 was used for deriving the encryption key from the user's password. This method adds an additional layer of security by making it more difficult for attackers to perform brute-force attacks on weak passwords.
3. **Database Management:** SQLite was selected for its simplicity and ease of use. It allows for efficient storage of user credentials and encrypted data without the overhead of managing a more complex database system.

In conclusion, the Secure Information Sharing Portal is a practical application of modern cryptographic techniques, providing users with a secure platform for storing and accessing sensitive information. By integrating encryption and a user-friendly interface, this project demonstrates the importance of security in today's digital landscape.

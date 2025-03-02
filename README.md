# Microservice MoodScape

Microservice MoodScape is a microservices-based application designed to analyze emotions using AI-powered emotion detection. The system includes various services such as authentication, user management, emotion analysis, and logging, orchestrated using Docker and Nginx.

## 🚀 Features
- **Microservices Architecture**: Decoupled services for authentication, emotion detection, user management, and logging.
- **AI-powered Emotion Detection**: Detect emotions using deep learning models.
- **Secure Authentication**: User authentication with JWT-based security.
- **Scalability**: Easily deployable and scalable using Docker and Nginx.
- **Logging & Monitoring**: Centralized logs for debugging and analysis.

## 📁 Project Structure
```
Microservice_MoodScape/
│── admin/                  # Admin service
│── auth/                   # Authentication service
│── emotion-detection/      # Emotion detection microservice
│── logs/                   # Logging service
│── nginx/                  # Nginx configuration
│── user/                   # User management service
│── .gitignore              # Git ignore file
│── docker-compose.yml      # Docker Compose configuration
│── LICENSE                 # License file
```

## 🛠️ Installation & Setup
### Prerequisites
Ensure you have the following installed:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps to Run the Project
1. **Clone the Repository**
   ```sh
   git clone https://github.com/Pallav46/MicroserviceMoodScape.git
   cd Microservice_MoodScape
   ```
2. **Start Services using Docker**
   ```sh
   docker-compose up --build
   ```
3. **Access the Application**
   - The services will be available at respective endpoints managed by Nginx.

## 🔧 Usage
- Authenticate users via the `auth` service.
- Analyze emotions using the `emotion-detection` service.
- Manage users via the `user` service.
- Admin functionality available via the `admin` service.

## 📜 License
This project is licensed under the [MIT License](LICENSE).

---

🔹 **Contributions & Feedback are Welcome!**


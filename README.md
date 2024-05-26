<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=azure,react,nodejs,js,terraform,vscode" />
  </a>
</p>

<h1 align="center">Identity System with Azure SQL and Azure Web Apps plus ChatGPT Dashboard</h1>

## Introduction

This project is about building a robust **Identity System** leveraging the power of **Azure SQL Database** and **Azure Web Apps**. Azure SQL, a part of Microsoft Azure's family, offers managed, secure, and intelligent database solutions, using the SQL Server database engine in the cloud. It's built on the familiar SQL Server engine, easing application migration and usage of familiar tools and resources.

**Azure App Service**, a Platform-as-a-Service (PaaS) in Microsoft Azure, facilitates the development, deployment, and scaling of web, mobile, and API applications. Specifically, **Azure Web Apps** focuses on hosting web applications and provides features like automatic scaling, load balancing, traffic management, and more. It supports various programming languages like .NET, Java, Node.js, Python, and PHP. 

In addition to Azure Web Apps, Azure App Service encompasses other offerings like **Azure Functions** for serverless computing, **Azure Logic Apps** for workflow automation, and **Azure API Management**.

## Project Build

### Frontend

- **React Web Application**: The frontend of our identity system is a user-friendly React web application. It includes:
  - **Sign Up and Sign In Features**: Allows users to register and log into the system, providing a seamless authentication experience.
  - **User Dashboard**: After logging in, users access a dashboard, where they can ask SQL related queries to OpenAI.

### Backend

- **API Endpoint**: The backend is structured as an API endpoint handling the Sign Up and Login processes. It involves:
  - **Integration with Azure SQL Database**: Our code interacts with Azure SQL Database to perform operations like inserting data and verifying user credentials.
  - **Relevant Queries**: The system uses SQL queries to manage user data efficiently.

### Deployment and Hosting

- **Docker Containers**: Both the frontend and backend components are containerized using Docker, ensuring consistency across different development and production environments.
- **Azure Container Registry**: The Docker images are pushed to Azure Container Registry, from where they are managed and deployed.
- **Deployment on Azure Web Apps**: The Docker images are then pulled and hosted on Azure Web Apps, providing a scalable and managed hosting environment.

## Features

- Managed cloud-based SQL database for secure and scalable data handling.
- User-friendly React-based frontend interface for registration and login.
- Secure backend API for handling authentication processes.
- Docker containerization for consistent deployment and scalability.
- Integration with Azure services for robust and reliable application performance.
- Chat GPT Interface that answers only SQL Related Questions

## Conclusion

This Identity System project demonstrates a seamless integration of modern web technologies with Azure's cloud services. It showcases how Azure SQL and Azure Web Apps can be utilized to build and deploy a secure and scalable user authentication system, complete with a front-end user interface and a back-end API service.
## Instructions
**Follow the Blog for Detailed Instructions**: For step-by-step guidance, visit [Custom Identity Database with Azure SQL and Web Apps](https://www.cloudblogger.eu/2023/12/11/custom-identity-database-with-azure-sql-and-web-apps/).

## Contribution

Contributions are welcome! If you have suggestions or improvements, feel free to fork the repository, make your changes, and submit a pull request.

## Instructions
**Follow the Blog for Detailed Instructions**: For step-by-step guidance, visit [Custom Identity Database with Azure SQL and Web Apps](https://www.cloudblogger.eu/2023/12/11/custom-identity-database-with-azure-sql-and-web-apps/).

## Contribute
We encourage contributions! If you have ideas on how to improve this application or want to report a bug, please feel free to open an issue or submit a pull request.

## Architecture

![SearchDesign](https://github.com/passadis/react-customidentitydb/assets/53148138/c313783b-9dfb-40b6-bd8b-f8fa8fcd7ff3)

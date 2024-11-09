# EMCommTest: Mars-Earth Communication Simulator

**EMCommTest** is a simulation project designed to mimic the communication delays and bandwidth limitations between Earth and Mars. This project leverages various Node.js technologies to simulate these conditions, providing a platform for testing and understanding the challenges of interplanetary communication.

### Overview
EMCommTest is primarily intended for developers and scientists working on or studying interplanetary communication systems. It simulates the latencies and bandwidth constraints one might encounter when sending data between Mars and Earth, which is vital for designing robust communication protocols and applications that could be used in future Mars missions.

### Technologies Used
- **Node.js**: For server-side logic and handling of HTTP requests.
- **Express.js**: A web application framework that simplifies the server creation process.
- **Custom Middleware**: 
  - **latency.mjs**: To introduce artificial delays in request responses.
  - **bandwidth.mjs**: To simulate limited bandwidth by throttling data transfer rates.
  - **cache.mjs**: A basic caching mechanism to simulate how data might be stored temporarily for quick access due to communication delays.

### Project Structure
EMCommTest/
├── src/ - Contains the source code of the project
│   ├── server/ - Server-side logic
│   │   ├── app.mjs - The main application file, initializes the server and applies middleware.
│   │   ├── router.mjs - Defines the API routes for handling different types of requests.
│   │   ├── latency.mjs - Middleware to simulate communication delay, customizable to different delay profiles.
│   │   ├── bandwidth.mjs - Middleware to throttle bandwidth, simulating the limited data transfer capabilities.
│   │   └── cache.mjs - Implements a simple in-memory cache to store frequently accessed data, reducing the need for repeated transmissions in a high-latency environment.
│   ├── client/ - Client-side code, if applicable, for frontend interactions.
│   │   └── index.html - Example HTML file for demonstrating client-server interaction.
│   └── config/ - Configuration files for setting up environment variables, simulation parameters, etc.
├── tests/ - Contains test scripts to validate the functionality of the simulation.
├── README.md - Project overview, setup instructions, and usage guide.
└── package.json - Node.js project manifest, includes scripts for running and testing the application.



### How to Use
1. **Clone the Repository**: Start by cloning the project to your local machine.
2. **Install Dependencies**: Run `npm install` to install all necessary dependencies listed in `package.json`.
3. **Configure the Environment**: Set up any environment variables needed for the simulation, such as latency and bandwidth parameters.
4. **Run the Server**: Use `npm start` to start the server, or `npm run dev` for development mode with hot-reloading.
5. **Test the Simulation**: Use the provided test scripts or write your own to simulate data transfer between Earth and Mars under various conditions.

### Contributions
Contributions to EMCommTest are welcome. Please fork the repository, make your changes, and submit a pull request. Ensure you follow the project's coding standards and add appropriate tests for new features or bug fixes.

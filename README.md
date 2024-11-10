# EMCommTest - Earth-Mars Communication Simulation

EMCommTest is an interactive web application designed to simulate and visualize the complexities of communication between Earth and Mars. This project incorporates elements of network simulation, AI interaction, and time synchronization to provide an educational tool for understanding interplanetary communication challenges.

## Features

- **Realistic Time Simulation**: Accounts for the difference between an Earth day and a Martian sol, simulating how timekeeping might work in a Martian colony.
- **Latency and Bandwidth Simulation**: Allows users to adjust communication parameters to understand their impact on interplanetary data transmission.
- **AI Query System**: Integrates with an AI to estimate transmission times based on user inputs like message content, destination, latency, and bandwidth.
- **Image Transfer**: Simulates the transfer of an image between planets, showcasing how data size affects transmission time.
- **Educational Explanation**: Provides context on time synchronization and how it's managed in the simulation.

## Getting Started

These instructions will help you set up a copy of the project on your local machine for development and testing.

### Prerequisites

- **Node.js** (v14 or above)
- **npm** (usually comes with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/EMCommTest.git
   cd EMCommTest
   ```

2. **Install npm packages:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**

   Create a `.env` file in the root of your project with the following content:

   ```env
   PORT=8000
   XAI_API_KEY=your_xai_api_key_here
   ```

   Replace `your_xai_api_key_here` with your actual API key for xAI or whichever AI service you're using.

### Running the Application

To start the server:

```bash
npm start
```

This will compile your frontend assets if necessary and start both the server and client in development mode.

Open your browser and navigate to [http://localhost:8000](http://localhost:8000) to use EMCommTest.

### Testing

Currently, there are no automated tests set up. However, manual testing can be performed by interacting with the interface and verifying that outputs match expectations.

## Project Structure

```
EMCommTest/
├── src/
│   ├── server/
│   │   ├── app.mjs          # Main server application logic
│   │   ├── router.mjs       # Route handlers
│   │   ├── latency.mjs      # Middleware for simulating network conditions
│   │   ├── bandwidth.mjs    # Middleware for simulating bandwidth constraints
│   │   └── models/
│   │       └── ai.mjs       # Functions to interact with the AI API
│   └── client/
│       ├── index.html       # Main HTML file
│       ├── main.js          # Client-side JavaScript
│       └── styles.css       # Styles for the application
├── .env                     # Environment variables (ignored by git)
├── package.json             # Metadata for the project, including scripts and dependencies
└── README.md                # Documentation for the project
```

## Built With

- **Express.js** - The web framework used for the server.
- **Socket.IO** - For real-time, bidirectional event-based communication.
- **Node.js** - JavaScript runtime built on Chrome's V8 JavaScript engine.
- **xAI API** - For AI-driven time estimation calculations (or your chosen AI service).

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

## License
idk, just do cool shit with it free of charge why we gotta complicate stuff bro?

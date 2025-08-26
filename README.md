# CodeRead - AI Code Explainer

An intelligent code analysis tool that uses Google's Gemini AI to explain code, identify issues, suggest improvements, and generate tests.

## Features

- **Code Analysis**: Get detailed explanations of how your code works
- **Issue Detection**: Identify potential problems and bugs in your code
- **Improvement Suggestions**: Receive recommendations to optimize your code
- **Test Generation**: Automatically generate unit tests for your functions
- **Multi-language Support**: Works with various programming languages
- **Image Analysis**: Upload screenshots of code for analysis
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated API key

### 2. Configure the Environment

1. Copy the example configuration file:
   ```bash
   cp config.example.js config.js
   ```

2. Open `config.js` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   const CONFIG = {
       GEMINI_API_KEY: "your_actual_api_key_here"
   };
   ```

### 3. Run the Application

Since this is a client-side application, you can either:

**Option 1: Open directly in browser**
- Simply open `index.html` in your web browser

**Option 2: Use a local server (recommended)**
- Using Python: `python -m http.server 8000`
- Using Node.js: `npx http-server`
- Using PHP: `php -S localhost:8000`
- Then visit `http://localhost:8000`

## Usage

1. **Paste Code**: Enter your code in the text area or upload an image
2. **Select Language**: Choose the programming language from the dropdown
3. **Choose Analysis Type**: Click on one of the action buttons:
   - **Analyze**: Get a comprehensive explanation of the code
   - **Convert**: Transform code between languages or formats
   - **Generate Tests**: Create unit tests for your code

## Security Notes

- **Never commit your `config.js` file** - it contains your sensitive API key
- The `config.js` file is already included in `.gitignore` to prevent accidental commits
- Keep your API key secure and don't share it publicly

## File Structure

```
CodeRead/
├── index.html          # Main application interface
├── scripts.js          # Application logic
├── styles.css          # Styling
├── config.js           # Configuration file with API key (not committed)
├── config.example.js   # Template for configuration setup
├── .gitignore          # Files to ignore in version control
└── README.md           # This file
```

## Troubleshooting

**API Key Error**: If you see "API Key not found", make sure:
1. You've created the `config.js` file
2. You've added your actual Gemini API key
3. The key is properly formatted in quotes

**CORS Issues**: If running locally, use a local server instead of opening the HTML file directly.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
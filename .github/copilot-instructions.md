# Copilot Instructions
## Code structure

`./index.html` is the main HTML file that includes:
  - base HTML structure
  - includes the JS files
  - includes the CSS file
  - doesn't include any JS or CSS code directly

`./js/*` is the JavaScript folder that contains:
  - `main.js`: the main JS file that includes the main page logic
  - other JS files that include other logic

`./css/*` is the CSS folder that contains:
  - `style.css`: the main CSS file that includes the main styles
  - `reset.css`: a reset CSS file that includes reset styles

### JS classes
The JS files are organized in a way that each file contains a class that is responsible for a specific part of the logic. They should:
  - define no CSS styles, only JS logic and HTML templates
  - the HTML template should be defined in a single function
  
const execSync = require('child_process').execSync;
const fs = require('fs');
const util = require('util');
const themes = require('./themes.js');

const writeFile = util.promisify(fs.writeFile);
const githubFolder = '.github/workflows';

const template = `
## Create yml files
name: {{themeName}} Theme Test

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Download Theme
        run: |
          curl -L -o theme.zip "{{themeUrl}}"
          unzip theme.zip
      - name: Test My Theme
        uses: StevenDufresne/wp-theme-validation-action-experiment@add/keyboard-test
        with:
          root-folder: {{themeName}}
          accessible-ready: false
      - uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: {{screenShotLocation}} 
  
`;


const runCommand = (command) => {
	execSync(command, { encoding: 'utf-8' });
};

const runUpdate = async () => {
	for (let i = 0; i < themes.length; i++) {
		const name = themes[i].name;
        const url = themes[i].url;
        const fileName = `${githubFolder}/${name}.yml`;

		const hydrateTemplate = template
			.replace(/{{themeName}}/gi, name)
            .replace(/{{themeUrl}}/gi, url)
            .replace(/{{screenShotLocation}}/gi, '${{ steps.test.outputs.screenshots }}');

        console.log('Creating an config file', fileName);
		writeFile(fileName, hydrateTemplate, 'utf8', () => {
            console.log(`Completed writing ${fileName}`);
        });
	}
};


runCommand(`rm -rf ${githubFolder}`);
runCommand(`mkdir ${githubFolder}`);
runUpdate();

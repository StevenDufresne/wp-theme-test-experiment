const execSync = require('child_process').execSync;
const fs = require('fs');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);
const githubFolder = '.github/workflows';

const runCommand = (command) => {
	const output = execSync(command, { encoding: 'utf-8' });
	console.log('Output was:\n', output);
};

runCommand(`rm -rf ${githubFolder}`);
runCommand(`mkdir ${githubFolder}`);

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
          curl -o theme.zip "{{themeUrl}}"
          unzip theme.zip
      - name: Test My Theme
        uses: StevenDufresne/wp-theme-validation-action-experiment@add/keyboard-test
        with:
          root-folder: {{themeName}}
          accessible-ready: false
`;

const testThemes = [
	{
		name: 'colibri-wp',
		url: 'https://downloads.wordpress.org/theme/colibri-wp.1.0.80.zip',
    },
    {
		name: 'twentyfifteen',
		url: 'https://downloads.wordpress.org/theme/twentyfifteen.2.7.zip',
	},
];

const runUpdate = async () => {
	for (let i = 0; i < testThemes.length; i++) {
		const name = testThemes[i].name;
		const url = testThemes[i].url;

		const hydrateTemplate = template
			.replace(/{{themeName}}/gi, name)
			.replace(/{{themeUrl}}/gi, url);

		await writeFile(`${githubFolder}/${name}.yml`, hydrateTemplate, 'utf8', () => {
			console.log('done');
		});
	}
};

runUpdate();

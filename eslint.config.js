import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import globals from 'globals';

export default [
  ...bpmnIoPlugin.configs.recommended,
  {
    ignores: [ 'dist/**' ]
  },
  {
    files: [ 'spec/**/*.js' ],
    languageOptions: {
      globals: globals.jasmine
    }
  }
];

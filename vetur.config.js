// vetur.config.js
/** @type {import('vls').VeturConfig} */
module.exports = {
  // **optional** default: `{}`
  // override vscode settings part
  // Notice: It only affects the settings used by Vetur.
  settings: {
    'vetur.experimental.templateInterpolationService': true,
    'vetur.useWorkspaceDependencies': true,
  },

  // **optional** default: `[{ root: './' }]`
  // support monorepos

  // **optional** default: `[]`
  // Register globally Vue component glob.
  // If you set it, you can get completion by that components.
  // It is relative to root property.
  // Notice: It won't actually do it. You need to use `require.context` or `Vue.component`
  globalComponents: ['./src/client/components/**/*.vue'],
  // **optional** default: `'package.json'`
  // Where is `package.json` in the project?
  // We use it to determine the version of vue.
  // It is relative to root property.
  package: './package.json',
  // **required**
  // Where is your project?
  // It is relative to `vetur.config.js`.
  root: '.',
  // **optional** default: `'./.vscode/vetur/snippets'`
  // Where is vetur custom snippets folders?
  snippetFolder: './.vscode/vetur/snippets',
  // **optional**
  // Where is TypeScript config file in the project?
  // It is relative to root property.
  tsconfig: './tsconfig.json',
}

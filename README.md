# d2l-one

This is a monorepo for d2l development. It contains three packages:

- d2l-api: A Node.js GraphQL API server that fetches data from the Google Docs

- d2l-expo: A React Native and React Native Web mobile/webapp for users to book their rescues

- d2l-website: Static files for the website as https://d2l.sg/

It also contains a deployment script, to deploy all three packages to the production AWS server.

## Development

### Initial setup

- Install node v16 (I like to use nvm)

- Install yarn

  ```
  nvm use
  # Install yarn
  npm install -g yarn
  ```

- For front-end development, install expo

  ```
  npm install -g expo
  ```

### Install npm packages

Run `yarn install` multiple times:

- Once inside the repo's root folder
- Once inside `packages/d2l-api`
- Once inside `packages/d2l-expo`

### Running

You will need two terminals open

- In `packages/d2l-api` run `yarn watch` (this will auto-restart the API server when you make changes)

- In `packages/d2l-expo` run `yarn web`

### Coding

I recommend using VSCode because we have already configured some things in the `.vscode` folder. (Format code with prettier, auto-organise imports.)

Open the repo root folder (`code .`), not the individual subfolders, to benefit from the shared configuration. You can do all the coding in one window.

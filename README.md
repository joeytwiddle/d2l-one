# d2l-one

This is a monorepo for d2l development. It contains three packages:

- d2l-api: A Node.js GraphQL API server that fetches data from the Google Docs

- d2l-expo: A React Native and React Native Web mobile/webapp for users to book their rescues

- d2l-website: Static files for the website at https://d2l.sg/

It also contains a deployment script, to deploy all three packages to the production AWS server.

## Development

### Initial setup

- Install node v16 (I like to use nvm)

  ```
  nvm use
  ```

- Install yarn

  ```
  npm install -g yarn
  ```

- For front-end development, install expo

  ```
  npm install -g expo
  ```

### Install npm packages

This should also install for the sub-projects.

```
yarn install
```

### Running

You will need two terminals open

- In `packages/d2l-api` run `yarn watch` (this will auto-restart the API server when you make changes).

- In `packages/d2l-expo` run `yarn web` for quick web development.

  Or run `yarn start` for web and mobile development. (Then hit `w` for web development, or scan the QR code for mobile development.)

  I recommended testing both web and mobile while you are developing (e.g. alternate when testing), to catch issues with any of the platforms as early as possible. At the very least, test all platforms before pushing new changes.

Note that `yarn watch` and `yarn start` will run `graphql-codegen` using our `codegen.yml`. This will:

- Read `schema.gql`
- Generate `/packages/d2l-api/src/graphql-types.d.ts` (types for the back-end)
- Generate `/packages/d2l-expo/graphql.tsx` (types and functions which make apollo-client calls to our API)
- The `postcodegen` script will also show a diff of what has changed in `graphql.tsx`, which may help you to notice issues

### Coding

I recommend using VSCode because we have already configured some things in the `.vscode` folder. (Format code with prettier, auto-organise imports.)

Open the repo root folder (`code .`) not the individual subfolders, to benefit from the shared configuration. You can do all the coding in one window.

### Authentication with Google Sheets

You should be able to get the file `packages/d2l-api/service-account-credentials.json` from another developer, so you won't need these instructions.

But anyway, this notes how the credentials were created:

1. You will need to be logged in to Google Cloud Console as`d2l.sg.dev@gmail.com`.

2. Visit the [Google API Credentials screen](https://console.cloud.google.com/apis/credentials?project=d2l-one-334008) and create a new service account.

3. Open up the service account, open the Keys tab, and create a new key.

4. Download the private key file in JSON format.

5. Save the file at `packages/d2l-api/service-account-credentials-development.json`

We also need to provide access to the relevant spreadsheet(s):

1. Note the email address of the service account. For example `main-737@d2l-one-334008.iam.gserviceaccount.com`.

   You can get this from Google Cloud Console, or look inside the service-account-credentials file.

2. Go to the spreadsheet, and hit Share

3. Add the service account's email address with the role "Editor"

## Deployment

To deploy all the latest code, run:

```bash
./build-and-deploy.sh
```

If you have only changed the website or the API server, then you can deploy everything except the web app:

```bash
./deploy-to-production.sh
```

### Secret files

These files are not stored in the repo, but you may need them to run the service in production. I am noting them here, so you won't miss any of them.

If you need some of these files, contact one of the existing admins.

- `~/.ssh/d2l_sg_dev_aws.pem` - Access key for AWS server

- `/deployment.cfg` - Some environment variables for the `deploy-to-production.sh` script

- `/packages/d2l-api/service-account-credentials.json` - General OAuth account for the app

- `d2l.sg.secrets.txt` - Contains account details for the Google account, domain registrar account, CloudFlare account, etc.

  The Google account `d2l.sg.dev@gmail.com` is used for:

  - GMail, for general admin tasks

  - The Google Sheet we use is hosted on that Google Drive

  - The Google API for our app (which can theoretically access any Google Drive, if the target account authorizes us)

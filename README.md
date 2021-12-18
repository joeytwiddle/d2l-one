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

- In `packages/d2l-api` run `yarn watch` (this will auto-restart the API server when you make changes).

- In `packages/d2l-expo` run `yarn web` for quick web development.

  Or run `yarn start` for web and mobile development. (Then hit `w` for web development, and scan the QR code for mobile development.)

### Coding

I recommend using VSCode because we have already configured some things in the `.vscode` folder. (Format code with prettier, auto-organise imports.)

Open the repo root folder (`code .`), not the individual subfolders, to benefit from the shared configuration. You can do all the coding in one window.

### Authentication with Google Sheets

You may be able to get these files from an existing developer, but if not, here are instructions to recreate them.

To create `packages/d2l-api/google-api-credentials.json`:

1. You will need to be logged in to Google Cloud Console as`d2l.sg.dev@gmail.com`.

2. Visit the [OAuth conent screen](https://console.cloud.google.com/apis/credentials/consent?project=d2l-one-334008) settings and register yourself as a Test User (if you are not listed there already).

3. Visit the [Credentials](https://console.cloud.google.com/apis/credentials?project=d2l-one-334008) page and Create a new credential

   Type: "OAuth Client ID"

   Application type: This should be type "Desktop" (even though were are developing an API server)

4. Download the JSON, and save it to the aforementioned filename.

To create `packages/d2l-api/google-api-token.json`:

1. Delete the existing token file

2. Run the d2l-api server (you need terminal access, so don't run it as a daemon through init)

3. On the console, you will be prompted to open a URL

4. Follow the instructions on the URL, then copy the code it gives you, and paste it to the d2l-api process

Note: After a couple of weeks, my token was revoked. I think Google did that auomatically because our app is still in testing phase. (Source: 3. [here](https://stackoverflow.com/a/67456685)) You may be able to verify this by looking at the [activity page](https://console.cloud.google.com/home/activity) to see if Google automatically deleted the keys.

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

- `/packages/d2l-api/google-api-credentials.json` - General OAuth account for the app

- `/packages/d2l-api/google-api-token.json` - Token offering access to a specific Google Drive

- `d2l.sg.secrets.txt` - Contains account details for the Google account, domain registrar account, CloudFlare account, etc.

  The Google account `d2l.sg.dev@gmail.com` is used for:

  - GMail, for general admin tasks

  - The Google Sheet we use is hosted on that Google Drive

  - The Google API for our app (which can theoretically access any Google Drive, if the target account authorizes us)

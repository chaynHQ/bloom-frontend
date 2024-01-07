# Cypress

Currently, integration tests are set up to be run locally with Chrome. When cypress runs in github actions in the CI flow, it runs against staging backend.

## Setup

- First create a local `cypress.env.json` file (this file is in .gitignore and will be ignore by git). Example variables are in `cypress.env.example.json`. You can ask the team for the environment variables to run Cypress tests and paste them into the file.
- These variables require users to exist in your database that have certain permissions. Firstly you need to create a super admin user in your database.
- Create a public user through the UI.
- In the database in `bloom-backend` you will need to set "isSuperAdmin" column to true for the user you created. See [BLOOM_USERS.md](/BLOOM_USERS.md) for steps on how to set up different users.
- There are 2 ways of data seeding with users. 1 is via a script in the bloom-scripts repo. Or 2 creating users through the UI (recommended).

  ### Creating users with the UI (Recommended)

  - ensure your `bloom-backend` is running.
  - create a public user through the UI by navigating to the '/' home page and following instructions to create a user.
  - To create partner admin users, log in as the super admin you created. Go to /admin/dashboard and create 1 bumble user and 1 badoo user. Make sure the emails are aliases of your own email. For example, if my email was 'test@chayn.co', I need to make accounts with emails `test+bumblepartneradmin@chayn.co`, `test+badoopartneradmin@chayn.co`. You will need to reset the password through the UI for both of these as firebase provides a random password for you.

  ### Creating users with a script

  - You will need to pull the [bloom-scripts repo](https://github.com/chaynHQ/bloom-scripts). This repo contains scripts for data seeding public and partner admin users. Note that you can also perform
  - You will need the `bloom-backend/cypress-setup.ts` in the the bloom scripts repo.
  - There are a few environment variables that you will need to get.

    - URL - this is the url of your bloom-backend service so will likely be `http://localhost:35001/api`
    - TOKEN - this needs to be a token with super admin authentication. The way you get this token is to log in as the super admin user in the UI. Go to the Network tab in the developer tools (this is for chrome users). Look for authenticated requests to the backend. A good one to use is the user/me endpoint. In the network tab it usually comes up as `me`. Click on the request and look at the request headers. In particular, look for the authorisation header. This should look like `bearer 123dsdfljkdbfksndfg;ksndg`. Copy everything that is after the `bearer ` into your .env TOKEN variable.
    - BUMBLE_PARTNER_ID - you should be able to get this ID from your database in the `partner` table
    - BADOO_PARTNER_ID - you should be able to get this ID from your database in the `partner` table
    - CYPRESS_TEMPLATE_EMAIL - this needs to be your email because you will need to reset passwords in the UI. To be able to reset passwords, you need the reset email to go into your inbox. The script will generate alias email addresses for all the Cypress template users. For example - my email is `test@chayn.co`. The accounts that will be created will be under `test+publicuser@chayn.co`, `test+bumblepartneradmin@chayn.co`, `test+badoopartneradmin@chayn.co`.
    - CYPRESS_TEMPLATE_PASSWORD - this will be the password for all test accounts created.
    - run the script with `npm run setup-cypress`.

### Adding data to the env

- You will have created all the accounts needed to run cypress tests.
- You will need to reset the passwords for both partner admin accounts. Navigate to `localhost:3000/auth/login` in the frontend UI. Click on the password reset button and reset both passwords by following the instructions.
- You now will need to populate the cypress.env.json with the information below

```
  "bumble_partner_admin_email": "",
  "bumble_partner_admin_password": "",
  "badoo_partner_admin_email": "",
  "badoo_partner_admin_password": "",
  "super_admin_email": "",
  "super_admin_password": "",
  "public_email": "",
  "public_password": "",
```

- The environment is now ready to run the tests.

**Running the tests locally**

To run the tests, follow the instructions below:

1. Ensure both local bloom backend and local bloom front-end are up and running
2. Ensure the local database contains users with emails matching those in the `cypress.env.json` file
3. Ensure Chrome is available on your local machine
4. Run the command `yarn cypress` on your terminal
5. Cypress will now open a new screen displaying the available test (this may take upto a minute the first the command runs)
6. Click on the test you'd like to run. This will open another Chrome window and the chosen test will now run.

The above option will run the tests against a visible browser. To run a head-less version of the tests (i.e. no visible browser), use the command `yarn cypress:headless`. The headless cypress runs will be faster as the browser elements are not visible.

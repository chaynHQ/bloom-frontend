# Cypress

Currently, integration tests are set up to be run locally with Chrome. When cypress runs in github actions in the CI flow, it runs against staging backend.

**Setup**

- First create a local `cypress.env.json` file (this file is in .gitignore and will be ignore by git). Example variables are in `cypress.env.example.json`. You can ask the team for the environment variables to run Cypress tests and paste them into the file.
- These variables require users to exist in your database that have certain permissions. Firstly you need to create a super admin user in your database.
  - Create a public user through the UI
  - In the database in `bloom-backend` you will need to set "isSuperAdmin" column to true for the user you created.
  - Add the super admin email and password combination to `super_admin_user` and `super_admin_password` in the `cypress.env.json`
- Log in as a super admin and create partner admins by going `/admin/dashboard`. It is advised you use your own personal email for this and modify it by adding `+bumblepartneradmin` to the end. For example `myname+bumblepartneradmin@gmail.com` and `myname+badoopartneradmin@gmail.com`. This is because you will need to reset the password so you can add the password to the env. Note that you need to create 1 bumble and 1 badoo partner admin and update the variables listed below. You will need to reset the passwords for both accounts through the UI to get the passwords.

```
  "bumble_partner_admin_email": "",
  "bumble_partner_admin_password": "",
  "badoo_partner_admin_email": "",
  "badoo_partner_admin_password": "",
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

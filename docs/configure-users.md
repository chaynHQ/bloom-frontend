# Local Bloom User Set-Up Guide

Creating local Bloom users is required for testing full functionality of Bloom and running local Cypress tests. Here are the types of Bloom users:

- Public User (default)
- Super Admin (public user with enhanced permissions)
- Partner Admin (partner user with enhanced permissions)
- Partner User (public user created through one of our partner programs)

### Prerequisites

- Backend is running, and database populated with test data.
- Frontend is runnning.
- You have manual access to your database, either through the postgres command line or database manager, like [PGAdmin](https://www.pgadmin.org/).

## Create Public User:

Run the app locally, from the home "/" page, navigate to "Getting Started with Bloom" to sign up as a new user.

You can verify this user was created in the database by running a query such as:

```
SELECT * from public."user" users where users."email" = '[insert email]'
```

## Create Super Admin:

- Create a public user account (or use one you already have).
- Go into the database and grant super admin permissions. You do this by changing the isSuperAdmin column to `true` on that user. You can do this with a query statement such as

```
UPDATE public."user" users SET "isSuperAdmin" = true WHERE users."email"='[insert email here]'
```

## Create Partner Admin:

**Prerequisites**

- Existing super admin user account.

**Steps**

- Log into bloom with the super admin account
- Navigate to /admin/dashboard
- Create partner users using the form:
  - **Important:** Make sure the emails are aliases of your own email. You need access to this email to create partner admin passwords. For example, if my email was 'test@chayn.co', I need to make accounts with emails `test+bumblepartneradmin@chayn.co`, `test+badoopartneradmin@chayn.co`. You will need to reset the password through the UI as Firebase provides a random password for you.
- Set password:
  - Reset the passwords for both partner admin accounts. Navigate to `localhost:3000/auth/login` in the frontend UI. Click on the password reset button and reset both passwords by following the email instructions.

## Create Partner User:

**Method 1. Use a partner admin**

- Go to Navigate to `/partner-admin/create-access-code`
- Create an access code - you need to select the level of access. For example, select therapy if you want the user who receives this code to have access to therapy
- Save this access code to use later.
- Create a new account e.g. test+2@chayn.co.
- In the top right corner you should see a profile icon. Click on it and you should see the option to “apply a code”.
- Proceed to apply to code to your account.
- If you have therapy access on that code, you should be able to see “Therapy” option in the nav bar

**Method 2: Manual entry into the database**

- Create a generic public user by going to the homepage and creating an account. You can re-use an existing public user if you have one already.
- Get the userId of the user by going into the database.

```bash
SELECT * from public."user" users where users."email" = '[insert email]'
```

- Get the partnerId of a partner by going into the database. A partner that should be in your database, if it was restored from the db dump, is ‘Bumble’

```bash
SELECT * from public."partner" partners where partners."name" = '[insert name - case sensitive]'
```

- Insert a partner access code for the selected user.

```bash
INSERT INTO public."partner_access"
("userId", "partnerAdminId", "partnerId", "featureLiveChat", "featureTherapy", "therapySessionsRemaining", "therapySessionsRedeemed", "active", "accessCode")
VALUES ('[insert user id]', null, '[insert partner id]', true, true, 6, 0, true, '[any six char code e.g. ABC123]')
```

- Log in as that user and see if “Therapy” is available in the nav bar.

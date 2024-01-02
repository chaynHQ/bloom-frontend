# Guide to setting up bloom users

## Setting up a public user

- Go to the home page of bloom and sign up with the general user sign up flow

## How to set up a super admin

**Assumptions for this to work:**

- You have imported the DB dump above into your database and you have a partner entry in your partner table in your database
- You have manual access to your database through the command line or through PG Admin

**Steps**

- Create an account that you have access to (or use one you already have)
- Go into the database and make that user a super admin. You do this by changing the isSuperAdmin column to `true` on that user. You can do this with a statement such as

```
UPDATE public."user" users SET "isSuperAdmin" = true WHERE users."email"='[insert email here]'
```

## How to set up a partner admin

**Assumptions for this to work:**

- you have access to a super admin user account

**Steps**

- Log into bloom with the super admin account
- Go to /admin/dashboard
- You should see a form where you can create a partner admin. You can create a partner admin account by typing a new email and selecting a partner in the drop down . Note that you can use the same email as before but just type in (+1) on the end. For example my email is test[@chayn.co](mailto:ellie@chayn.co), so I will make a new account with the same email and call it test[+1@chayn.co](mailto:ellie+1@chayn.co).
- Once you have created the new partner admin, sign in as that partner admin. You will need to reset the password so you will need access to the email account. Note that if you used test+1@chayn.co, it will send the email to test@chayn.co.

## How to set up a partner user

**Assumptions for this to work:**

- For method 1: you have manual access to the database
- For method 2: you have access to a partner admin user account

**Method 1: Manual entry into the database (recommended)**

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

**Method 2. Use a partner admin**

- Create a partner admin (see How to create a partner admin below)
- Go to /partner-admin/create-access-code
- Create an access code - you need to select the level of access. For example, select therapy if you want the user who receives this code to have access to therapy
- Save this access code to use later.
- Create a new account e.g. test+2@chayn.co.
- In the top right corner you should see a profile icon. Click on it and you should see the option to “apply a code”.
- Proceed to apply to code to your account.
- If you have therapy access on that code, you should be able to see “Therapy” option in the nav bar

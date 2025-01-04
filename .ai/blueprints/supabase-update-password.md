To update a user's password in Supabase, you can follow these methods based on whether the user is logged in or needs to reset their password via email.

## Updating Password for Logged-In Users

If the user is currently logged in, you can directly update their password using the `updateUser` method. Here's how to do it:

```javascript
const { data, error } = await supabase.auth.updateUser({
  password: new_password
});
```

### Steps:
1. Ensure the user is authenticated.
2. Call the `updateUser` method with the new password as shown above.
3. Handle the response to check if the update was successful.

## Resetting Password via Email

If the user needs to reset their password, you can send a password reset email and handle the password update after they click the link in their email. Here’s how to do that:

### Step 1: Send Password Reset Email

```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://example.com/update-password',
});
```

### Step 2: Update Password After Redirect

Once the user clicks the reset link and is redirected back to your application, you can prompt them to enter a new password:

```javascript
useEffect(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      const newPassword = prompt("What would you like your new password to be?");
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });

      if (data) alert("Password updated successfully!");
      if (error) alert("There was an error updating your password.");
    }
  });
}, []);
```

### Summary of Methods
- **For logged-in users**: Use `updateUser()` directly with the new password.
- **For password resets**: Use `resetPasswordForEmail()` to send a reset link, then handle the update after redirection.

These methods ensure that users can securely manage their passwords within your application using Supabase's authentication features [1][2].

Citations:
[1] https://supabase.com/docs/guides/auth/passwords
[2] https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
[3] https://community.flutterflow.io/discussions/post/solved-supabase---verify-and-update-current-password-QuXCuvFHSDnmU6S
[4] https://github.com/orgs/supabase/discussions/21232
[5] https://stackoverflow.com/questions/71561522/how-to-update-the-password-of-a-supabase-user-on-a-nextjs-project
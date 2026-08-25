export default function SignInFailurePage() {
  return (
    <main>
      <h1>Sign-in unavailable</h1>
      <p>Email OTP sign-in could not be completed. Try again without changing your saved work.</p>
      <a href="/auth/login">Try email OTP again</a>
    </main>
  );
}

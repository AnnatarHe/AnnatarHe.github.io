---
layout: post
title: Improving State Management with Xstate Refactoring Authorization Flows
tags: fe xstate
---

Hi folks,

I haven’t written any tech articles for a long time, but this time, I think I have a valuable design that should be shared.

Recently, I refactored the authorization page of [ClippingKK](https://clippingkk.annatarhe.com/auth/auth-v4). It has become more elegant and maintainable.

Let's show how to design a small but complex state handling system.

TL;DR:

[https://stately.ai/registry/editor/5a0bce07-7238-4761-8553-d6be523d9ef1?machineId=7bdb6037-ff88-4b06-9bdb-c1cbd090e897](https://stately.ai/registry/editor/5a0bce07-7238-4761-8553-d6be523d9ef1?machineId=7bdb6037-ff88-4b06-9bdb-c1cbd090e897)

<iframe src="https://stately.ai/registry/editor/5a0bce07-7238-4761-8553-d6be523d9ef1?machineId=7bdb6037-ff88-4b06-9bdb-c1cbd090e897" width="100%" height="515px">
</iframe>

Let's break it down step by step:

## Third-Party Authentication

Let's start with the simple part, third-party auth flow:

### Sign in with Apple

There is a button. If the user clicks it, the SDK will pop up a modal asking the user to log into Apple services and grant permission. On the frontend side, we can do nothing during this process; we will receive an event once the user grants permission, and we trigger an Xstate event immediately.

In the next phase, we call an API to verify the token from the previous step. If it succeeds, the backend will send back a JWT token, indicating a valid user. Login succeeds.

If not, the promise will be rejected, reverting to the previous state, waiting for user interaction.

### GitHub

This is similar to Apple but a bit simpler. We just wait for the click, redirect to the GitHub page, and ask for user information from GitHub. Once granted, GitHub will redirect to the owner's pre-defined URL, and we will get the token and process it the same way as Apple – call the API for the JWT token.

### Metamask

This one is a bit more complex because the Metamask auth flow has three steps:

1. Checking wallet existence
2. Connecting wallet (ask for permission)
3. Asking for user signature

All three steps are included in the state `metaMaskLogging`. The invoked function will perform the three steps above.

Why merge three steps into one action? I think it's simpler than splitting them into three steps. If any sub-step fails, the user cannot sign data and cannot proceed with the login flow.

If the user successfully signs the data, we follow the same steps as with GitHub and Apple – ask for a new JWT token and dispatch the `onAuthSuccess` event.

## Normal Flow

From here, the situation becomes much more complex.

An authorization flow typically includes a normal login flow with email and password. Sometimes, users forget their passwords, and the reset password flow is really annoying. So, we need to provide a way for users to log in with a one-time password.

To prevent password cracking, we need [Turnstile](https://developers.cloudflare.com/turnstile/). Yes, it also has some states we need to handle.

What if the first one-time password email fails or gets lost somehow? Unfortunately, we have to handle this, so more states are coming.

In the top area, the pretty big picture shows the whole flow of normal auth flow:

Users can easily switch between password mode and one-time passcode mode. The resend email time is available regardless of the current mode.

At the same time, Turnstile is checking whether the user is a robot or a real human. If it succeeds, the current state changes to verified.

If the user fills in the password or one-time passcode and the Turnstile code is ready, the user is eligible to continue to the next phase. We trigger an event to change the current state to `manualLoggingIn`, and it will call the pre-defined API. If it succeeds, a JWT token is obtained. As before, dispatch and success event!

## Conclusion

After this refactoring, Xstate shows its power. It can split a complex question into several maintainable diagrams and split states into individual steps.

Xstate itself might be complex enough, but I would say it’s worth it. It can solve really complex state conflicts in an easy way.

[https://github.com/clippingkk/web/blob/master/src/app/auth/auth-v4/auth.state.ts](https://github.com/clippingkk/web/blob/master/src/app/auth/auth-v4/auth.state.ts)

## Suggestions for Xstate

Through my refactoring experience, I think there is no good enough way to work with react-hook-form and react-query or Apollo very well. Maybe it can improve later.

Of course, Xstate is just too hard to learn for beginners. We need more articles to show how powerful Xstate is!
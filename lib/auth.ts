import type { FirebaseError } from 'firebase/app';
import {
  MultiFactorError,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneInfoOptions,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  applyActionCode,
  confirmPasswordReset,
  multiFactor,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as FirebaseError | MultiFactorError };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function getAuthToken() {
  try {
    const token = await auth.currentUser?.getIdToken(true);
    return { token, error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function sendAuthPasswordResetEmail(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function confirmAuthPasswordReset(codeParam: string, password: string) {
  try {
    await confirmPasswordReset(auth, codeParam, password);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function sendVerificationEmail(user: User) {
  try {
    // Triggers sending an email to the user with a link to verify their email
    // The link will direct to our /action-handler page where we call confirmEmailVerified
    await sendEmailVerification(user);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function confirmEmailVerified(codeParam: string) {
  try {
    // Confirms the user has verified their email using a link with a valid oobCode
    await applyActionCode(auth, codeParam);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as FirebaseError };
  }
}

// Triggers sending the user an SMS for 2FA/MFA for login process
export async function triggerVerifyMFA(resolver: MultiFactorResolver) {
  try {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    const phoneInfoOptions = {
      multiFactorHint: resolver.hints[0],
      session: resolver.session,
    };
    const phoneAuthProvider = new PhoneAuthProvider(auth);

    // Send SMS verification code
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      recaptchaVerifier,
    );
    return { verificationId, error: null };
  } catch (error) {
    return { verificationId: null, error: error as FirebaseError };
  }
}

// Triggers sending the user an SMS for 2FA/MFA for enrollment process
export async function triggerInitialMFA(phoneNumber: string) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    const phoneAuthProvider = new PhoneAuthProvider(auth);

    const session = await multiFactor(user).getSession();
    console.log('session exists', !!session);

    const phoneInfoOptions = {
      phoneNumber,
      session,
    } as PhoneInfoOptions;

    // Send SMS verification code
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      recaptchaVerifier,
    );
    return { verificationId, error: null };
  } catch (error) {
    return { verificationId: null, error: error as FirebaseError };
  }
}

// Validates 2FA/MFA code received by SMS
export async function verifyMFA(
  verificationId: string,
  verificationCode: string,
  resolver?: MultiFactorResolver,
) {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

    if (resolver) {
      // This is for verification during login
      await resolver.resolveSignIn(multiFactorAssertion);
    } else {
      // This is for initial enrollment
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      await multiFactor(user).enroll(multiFactorAssertion, 'Phone Number');
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as FirebaseError };
  }
}

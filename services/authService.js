import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Conditionally import Google Sign-In only if native modules are available
let GoogleSignin = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.log('Google Sign-In not available in this environment (Expo Go)');
}

class AuthService {
  constructor() {
    // Configure Google Sign-In only if available (not in Expo Go)
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: '683993869050-bhp109ibd5t2j45ll4l826r67hsm3cih.apps.googleusercontent.com',
        });
      } catch (error) {
        console.log('Failed to configure Google Sign-In:', error);
      }
    }
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return {
        success: true,
        user: userCredential.user,
        message: 'Account created successfully! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    // Check if Google Sign-In is available (not in Expo Go)
    if (!GoogleSignin) {
      return {
        success: false,
        error: 'Google Sign-In is not available in Expo Go. Please build the app to use this feature.'
      };
    }

    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get user info from Google
      const response = await GoogleSignin.signIn();

      console.log('Google Sign-In response:', JSON.stringify(response, null, 2));

      // Handle different response structures based on library version
      // v16.x uses response.data.idToken, older versions use response.idToken
      let idToken = null;

      if (response.data && response.data.idToken) {
        // v16.x structure
        idToken = response.data.idToken;
      } else if (response.idToken) {
        // Older version structure
        idToken = response.idToken;
      } else if (response.user && response.user.idToken) {
        // Alternative structure
        idToken = response.user.idToken;
      }

      if (!idToken) {
        console.error('No idToken found in Google Sign-In response:', response);
        return {
          success: false,
          error: 'Failed to get authentication token from Google. Please check your Google Cloud Console configuration.'
        };
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign in with the credential on Firebase
      const userCredential = await signInWithCredential(auth, googleCredential);

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle specific Google Sign-In errors
      if (error.code === 'SIGN_IN_CANCELLED' || error.code === '12501') {
        return {
          success: false,
          error: 'Sign in cancelled'
        };
      } else if (error.code === 'IN_PROGRESS') {
        return {
          success: false,
          error: 'Sign in already in progress'
        };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return {
          success: false,
          error: 'Google Play Services not available'
        };
      } else if (error.code === 'DEVELOPER_ERROR' || error.code === '10') {
        return {
          success: false,
          error: 'Configuration error. Please verify SHA-1 fingerprint is added to Firebase and Google Cloud Console.'
        };
      }

      return {
        success: false,
        error: `Failed to sign in with Google: ${error.message || 'Please try again.'}`
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Also sign out from Google if user signed in with Google and GoogleSignin is available
      if (GoogleSignin) {
        try {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
          }
        } catch (error) {
          console.log('Google Sign-In not available during sign out');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Send email verification
  async sendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      if (user.emailVerified) {
        return {
          success: false,
          error: 'Email is already verified'
        };
      }

      await sendEmailVerification(user);
      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Send verification email error:', error);
      return {
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      };
    }
  }

  // Check if email is verified
  async checkEmailVerified() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return false;
      }

      // Reload user to get fresh data from Firebase
      await user.reload();
      return user.emailVerified;
    } catch (error) {
      console.error('Check email verified error:', error);
      return false;
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Update display name
  async updateDisplayName(displayName) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      await updateProfile(user, { displayName });
      return {
        success: true,
        message: 'Display name updated successfully'
      };
    } catch (error) {
      console.error('Update display name error:', error);
      return {
        success: false,
        error: 'Failed to update display name'
      };
    }
  }

  // Change password (requires current password for security)
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      // Check if user signed in with Google (no password to change)
      const isGoogleUser = user.providerData.some(
        provider => provider.providerId === 'google.com'
      );

      if (isGoogleUser) {
        return {
          success: false,
          error: 'Cannot change password for Google Sign-In accounts'
        };
      }

      // Re-authenticate user with current password for security
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);

      if (error.code === 'auth/wrong-password') {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Delete user account
  async deleteAccount(password) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      // Check if user signed in with Google
      const isGoogleUser = user.providerData.some(
        provider => provider.providerId === 'google.com'
      );

      // Re-authenticate before deleting (security requirement)
      if (!isGoogleUser && password) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Delete user account
      await deleteUser(user);

      // Sign out from Google if applicable
      if (isGoogleUser && GoogleSignin) {
        try {
          await GoogleSignin.signOut();
        } catch (error) {
          console.log('Google Sign-In not available during account deletion');
        }
      }

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Delete account error:', error);

      if (error.code === 'auth/wrong-password') {
        return {
          success: false,
          error: 'Password is incorrect'
        };
      }

      if (error.code === 'auth/requires-recent-login') {
        return {
          success: false,
          error: 'Please sign out and sign in again before deleting your account'
        };
      }

      return {
        success: false,
        error: 'Failed to delete account. Please try again.'
      };
    }
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'An error occurred. Please try again';
    }
  }
}

export default new AuthService();

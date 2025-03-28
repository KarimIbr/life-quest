import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let userCredential;
    try {
      // Create the user account
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        // Initialize user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          displayName: email.split('@')[0], // Default display name
          level: 1,
          experience: 0,
          hp: 100,
          energy: 100,
          stats: {
            physical: 10,
            mental: 10,
            social: 10,
            creativity: 10,
            knowledge: 10,
            spiritual: 10
          },
          createdAt: new Date()
        });

        navigate('/');
      } catch (profileError: any) {
        // If profile creation fails, delete the auth account to maintain consistency
        await user.delete();
        throw new Error('Failed to create user profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error - Please check your internet connection');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message || 'Failed to create account');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-primary">
            LifeQuest
          </h1>
          <h2 className="mt-6 text-center text-xl text-gray-300">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1 block w-full"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1 block w-full"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex justify-center"
          >
            Create account
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp; 
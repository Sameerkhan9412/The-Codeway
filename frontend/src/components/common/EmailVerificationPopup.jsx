import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { requestEmailVerificationOTP } from '../../utils/apis/userApi';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const EmailVerificationPopup = ({ user }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const popupShown = sessionStorage.getItem('emailVerificationPopupShown');
    if (!popupShown) {
      setIsVisible(true);
      sessionStorage.setItem('emailVerificationPopupShown', 'true');
    }
  }, []);

  const handleSendVerificationEmail = async () => {
    try {
      await requestEmailVerificationOTP(user.emailId);
      toast.success('Verification email sent. Please check your inbox.');
      setIsVisible(false);
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 transform bg-slate-800 border border-orange-500/50 text-white p-4 rounded-lg shadow-2xl flex items-center space-x-6 z-50">
      <div className="flex-grow">
        <p className="font-bold text-orange-400">Verify Your Email</p>
        <p className="text-sm text-gray-300">Please verify your email to unlock all features and secure your account.</p>
      </div>
      <Button onClick={handleSendVerificationEmail} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
        Verify Now
      </Button>
      <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
        <X size={20} />
      </button>
    </div>
  );
};

export default EmailVerificationPopup;

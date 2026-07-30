import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';

export const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['8', '4', '9', '2', '0', '1']);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success('OTP code verified. Reset your security password.');
      navigate('/reset-password');
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-8 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold">Verification PIN</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Please input the 6-digit pin dispatched to your email address.
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value;
                  setOtp(newOtp);
                }}
                className="w-11 h-12 text-center font-bold text-lg bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full py-2.5 font-semibold">
            Verify PIN & Continue
          </Button>
        </form>
      </Card>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopWaveBackground } from "@/components/backgrounds/TopWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { z } from "zod";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password data
    const validation = passwordSchema.safeParse(passwordData);
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    setIsChangingPassword(false);

    if (error) {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password updated!",
      description: "Your password has been changed successfully.",
    });

    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeletingAccount(true);

    try {
      // Delete user's brand kits first
      const { error: deleteKitsError } = await supabase
        .from("brand_kits")
        .delete()
        .eq("user_id", user.id);

      if (deleteKitsError) throw deleteKitsError;

      // Sign out and redirect
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all data have been removed.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <TopWaveBackground>
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/studio">
              <Button variant="outline" size="sm" rounded="pill">
                ← Back to studio
              </Button>
            </Link>
            <Button variant="outline" size="sm" rounded="pill" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl">Account settings</h1>
            <p className="text-ink/70">Manage your profile and account preferences</p>
          </div>

          {/* Account Information */}
          <BrandCard className="space-y-4">
            <h2 className="text-xl">Account information</h2>
            
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input
                type="email"
                value={user.email || ""}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-ink/60">Your email address cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label>Member since</Label>
              <Input
                type="text"
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                className="opacity-60"
              />
            </div>
          </BrandCard>

          {/* Change Password */}
          <BrandCard className="space-y-4">
            <h2 className="text-xl">Change password</h2>
            <p className="text-sm text-ink/70">
              Enter a new password to update your account security
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" rounded="pill" disabled={isChangingPassword}>
                {isChangingPassword ? "Updating password..." : "Update password"}
              </Button>
            </form>
          </BrandCard>

          {/* Danger Zone */}
          <BrandCard className="space-y-4 border-destructive/50">
            <h2 className="text-xl text-destructive">Danger zone</h2>
            <p className="text-sm text-ink/70">
              Once you delete your account, there is no going back. All your saved brand kits will be permanently removed.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                rounded="pill"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                Delete account
              </Button>
            ) : (
              <div className="space-y-4 p-4 border border-destructive/50 rounded-lg">
                <p className="text-sm font-medium">
                  Are you absolutely sure? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    rounded="pill"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    rounded="pill"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
                  </Button>
                </div>
              </div>
            )}
          </BrandCard>
        </div>
      </div>
    </TopWaveBackground>
  );
};

export default Profile;

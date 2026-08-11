import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useClerk } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTier } from "@/lib/subscription";

type UserRole = "job_seeker" | "employer" | "admin";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  about: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  loading: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  userRole: null,
  loading: true,
  subscriptionTier: "free",
  subscriptionEnd: null,
  subscriptionLoading: false,
  refreshSubscription: async () => {},
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const metadataRole = (authUser: User): UserRole => {
  const role = authUser.user_metadata?.role;
  return role === "employer" || role === "admin" ? role : "job_seeker";
};

const fallbackProfile = (authUser: User): Profile => ({
  id: authUser.id,
  user_id: authUser.id,
  full_name:
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split("@")[0] ||
    "M-Ploy User",
  avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
  bio: null,
  about: null,
  phone: null,
  address: null,
  role: metadataRole(authUser),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const clerk = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const fetchProfile = async (authUser: User) => {
    setProfileLoading(true);
    try {
      const fallback = fallbackProfile(authUser);
      setProfile(fallback);
      setUserRole(metadataRole(authUser));

      const profileRequest = supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      const roleRequest = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .maybeSingle();

      const [{ data, error }, { data: roleData }] = await Promise.all([profileRequest, roleRequest]);

      if (data) {
        setProfile(data as Profile);
      } else {
        setProfile(fallback);
        if (!error) {
          supabase
            .from("profiles")
            .upsert(
              { user_id: authUser.id, full_name: fallback.full_name, avatar_url: fallback.avatar_url },
              { onConflict: "user_id" }
            )
            .then(() => undefined);
        }
      }

      setUserRole((roleData?.role as UserRole) || fallback.role);
    } catch (err) {
      console.error("Failed to load profile:", err);
      const fallback = fallbackProfile(authUser);
      setProfile(fallback);
      setUserRole(fallback.role);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user);
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    if (!session) return;
    // Admins always hold unrestricted premium access — never downgrade them.
    if (userRole === "admin") {
      setSubscriptionTier("premium");
      return;
    }
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-check-subscription");
      if (error) throw error;
      if (data) {
        const tier = (data.tier || "free") as SubscriptionTier;
        setSubscriptionTier(data.subscribed ? tier : "free");
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch (err) {
      console.error("Failed to check subscription:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session, userRole]);

  // Admins always have unrestricted (premium) access
  useEffect(() => {
    if (userRole === "admin") {
      setSubscriptionTier("premium");
    }
  }, [userRole]);


  useEffect(() => {
    let initialSessionSeen = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!initialSessionSeen) setLoading(false);
    }, 3500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION") initialSessionSeen = true;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user), 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setSubscriptionTier("free");
          setSubscriptionEnd(null);
        }
        setLoading(false);
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  // Check subscription on login and periodically
  useEffect(() => {
    if (session) {
      refreshSubscription();
      const interval = setInterval(refreshSubscription, 60000);
      return () => clearInterval(interval);
    }
  }, [session, refreshSubscription]);

  const signOut = async () => {
    await clerk.signOut().catch(() => undefined);
    await supabase.auth.signOut();
    setProfile(null);
    setUserRole(null);
    setSubscriptionTier("free");
    setSubscriptionEnd(null);
  };


  return (
    <AuthContext.Provider value={{
      user, session, profile, userRole, loading,
      subscriptionTier, subscriptionEnd, subscriptionLoading,
      refreshSubscription, refreshProfile, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTier, getTierFromProductId } from "@/lib/subscription";

type UserRole = "job_seeker" | "employer";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data as Profile);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    if (roleData) setUserRole(roleData.role as UserRole);
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    if (!session) return;
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      if (data) {
        const tier = getTierFromProductId(data.product_id || null);
        setSubscriptionTier(data.subscribed ? tier : "free");
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch (err) {
      console.error("Failed to check subscription:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setSubscriptionTier("free");
          setSubscriptionEnd(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

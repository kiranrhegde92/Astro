import { useMemo } from 'react';
import { normalizeUserProfile } from '../utils/normalizeUserProfile';
import { useManagedProfilesStore } from '../store/managedProfilesStore';
import { useUserStore } from '../store/userStore';
import type { ManagedProfile } from '../types/appData';
import type { UserProfile } from '../types/user';
import { hasPremiumEntitlement } from '../utils/subscription';

export type ActiveUserProfile = UserProfile & {
  isManagedProfile: boolean;
  managedProfileId?: string;
  accountUser: UserProfile;
};

export function getActiveUserProfile(
  accountUser: UserProfile | null,
  managedProfiles: ManagedProfile[],
  activeProfileId: string | null,
): ActiveUserProfile | null {
  if (!accountUser) return null;
  if (!hasPremiumEntitlement(accountUser.subscription)) {
    return {
      ...accountUser,
      isManagedProfile: false,
      accountUser,
    };
  }

  const managedProfile = activeProfileId
    ? managedProfiles.find((profile) => profile.id === activeProfileId)
    : null;

  if (!managedProfile) {
    return {
      ...accountUser,
      isManagedProfile: false,
      accountUser,
    };
  }

  const activeUser = normalizeUserProfile({
    ...accountUser,
    id: managedProfile.id,
    name: managedProfile.name,
    birthDetails: managedProfile.birthDetails,
    activeSystems: managedProfile.activeSystems,
    western: managedProfile.profile.western,
    vedic: managedProfile.profile.vedic,
    chinese: managedProfile.profile.chinese,
    kp: managedProfile.profile.kp,
    subscription: accountUser.subscription,
    createdAt: new Date(managedProfile.createdAt),
    onboardingComplete: true,
  });

  return {
    ...activeUser,
    isManagedProfile: true,
    managedProfileId: managedProfile.id,
    accountUser,
  };
}

export function useActiveProfile(): ActiveUserProfile | null {
  const user = useUserStore((state) => state.user);
  const managedProfiles = useManagedProfilesStore((state) => state.managedProfiles);
  const activeProfileId = useManagedProfilesStore((state) => state.activeProfileId);

  return useMemo(
    () => getActiveUserProfile(user, managedProfiles, activeProfileId),
    [activeProfileId, managedProfiles, user],
  );
}

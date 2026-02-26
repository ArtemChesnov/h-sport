"use client";

import { AuthRequiredDialog } from "@/shared/components/common";
import { useAuthCheck, useUpdateUserProfileMutation, useUserProfileQuery } from "@/shared/hooks";
import React from "react";
import { AccountPageSkeleton } from "./_components/account-page-skeleton";
import { AddressForm } from "./_components/address-form";
import { PersonalInfoForm } from "./_components/personal-info-form";
import { profileToAddressForm, profileToPersonalForm } from "./lib/profile-form-utils";

export default function AccountPageClient() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();
  const { data: profile, isLoading } = useUserProfileQuery({
    enabled: isAuthenticated,
  });
  const updateMutation = useUpdateUserProfileMutation();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setAuthDialogOpen(true);
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSavePersonal = React.useCallback(
    async (data: {
      name: string | null;
      secondName: string | null;
      phone: string | null;
      email: string;
      birthDate: string | null;
    }) => {
      await updateMutation.mutateAsync(data);
    },
    [updateMutation],
  );

  const handleSaveAddress = React.useCallback(
    async (data: { address: { country: string; city: string; street: string } }) => {
      await updateMutation.mutateAsync(data);
    },
    [updateMutation],
  );

  if (isAuthLoading || isLoading) {
    return <AccountPageSkeleton />;
  }

  if (!isAuthenticated) {
    return <AccountPageSkeleton />;
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <PersonalInfoForm
        initialData={profileToPersonalForm(profile)}
        onSave={handleSavePersonal}
        onReset={() => profileToPersonalForm(profile)}
      />
      <AddressForm
        initialData={profileToAddressForm(profile)}
        onSave={handleSaveAddress}
        onReset={() => profileToAddressForm(profile)}
      />

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title="Войдите в аккаунт"
        description="Чтобы просматривать личный кабинет, необходимо войти в аккаунт или зарегистрироваться."
      />
    </>
  );
}

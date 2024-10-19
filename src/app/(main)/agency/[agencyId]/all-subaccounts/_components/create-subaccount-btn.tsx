"use client";
import SubAccountDetails from "@/components/forms/subaccount-details";
import CustomModal from "@/components/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  Subscription,
  User,
} from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { AgencyWithSub, AuthUserDetail } from "@/lib/types";
import { redirect, useRouter } from "next/navigation";
import {
  getAgencyWithSub,
  getAuthUserDetails,
} from "../../../../../../lib/queries";

type Props = {
  user: AuthUserDetail;
  id?: string;
  className?: string | "";
  agency: AgencyWithSub;
};

const CreateSubaccountButton = ({ className, id, user, agency }: Props) => {
  if (!user) return;

  const { setOpen } = useModal();
  const router = useRouter();

  const agencyDetails = user.Agency;

  if (!agencyDetails) return;
  
  if (
    (!agency?.Subscription?.priceId &&
      user.Agency &&
      user.Agency?.SubAccount.length < 3) ||
    !!agency?.Subscription?.priceId
  ) {
    return (
      <Button
        className={twMerge("w-full flex gap-4", className)}
        onClick={() => {
          setOpen(
            <CustomModal
              title="Create a Subaccount"
              subheading="You can switch between"
            >
              <SubAccountDetails
                agencyDetails={agencyDetails}
                userId={user.id}
                userName={user.name}
              />
            </CustomModal>
          );
        }}
      >
        <PlusCircleIcon size={15} />
        Create Sub Account
      </Button>
    );
  }
  return (
    <Button
      className={twMerge("w-full flex gap-4 text-center", className)}
      onClick={() =>
        router.push(`http://localhost:3000/agency/${user.agencyId}/billing`)
      }
    >
      Get unlimited sub account
    </Button>
  );
};

export default CreateSubaccountButton;

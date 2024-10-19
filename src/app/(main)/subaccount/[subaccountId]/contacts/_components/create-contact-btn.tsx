"use client";
import CustomModal from "@/components/custom-modal";
import ContactForm from "@/components/forms/contact-user-form";
import PaymentForm from "@/components/forms/payment-form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import React from "react";

type Props = {
  subaccountId: string;
  name?: string;
};

const CraeteContactButton = ({ subaccountId, name }: Props) => {
  const { setOpen } = useModal();
  const handleCreateContact = async () => {
    setOpen(
      <CustomModal title="Create a Contact" subheading="">
        <ContactForm subaccountId={subaccountId} />
      </CustomModal>
    );
  };
  return <Button onClick={handleCreateContact}>Create Contact</Button>;
};

export default CraeteContactButton;

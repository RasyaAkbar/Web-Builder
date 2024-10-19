import React from "react";
import { off } from "process";
import { getAgencyWithSub, getAuthUserDetails } from "@/lib/queries";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};
const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user || !user.agencyId) return null;
  if (!user.Agency) return;
  const agency = await getAgencyWithSub(user.agencyId)


  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id);

  if (!details) return;

  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  let sideBarLogo = user.Agency.agencyLogo || "./assets/plura-logo.svg";

  if (!isWhiteLabeledAgency) {
    if (type == "subaccount") {
      sideBarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sidebarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || []; // if subaccount, match the subaccount id, agency is general so just straightforward
  const subaccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  ); // filter subaccounts that have permission access
  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
        agency={agency}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
        agency={agency}
      />
    </>
  );
};

export default Sidebar;

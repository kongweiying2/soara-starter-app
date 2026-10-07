import { hasEnvVars } from "@/lib/utils";
import { ConfigurationError } from "@/components/configuration-error";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {hasEnvVars ? <UpdatePasswordForm /> : <ConfigurationError title="Password update unavailable" description="Authentication is not connected, so this action is currently unavailable." />}
      </div>
    </div>
  );
}

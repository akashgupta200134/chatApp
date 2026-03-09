import { Suspense } from "react";
import VerifyOtp from "../components/verifyotp";
import Loading from "../components/loading";

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtp />
    </Suspense>
  );
}

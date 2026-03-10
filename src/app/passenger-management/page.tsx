import PassengerManagement from "@/components/PassengerManagement";
import { Suspense } from "react";

export default function PassengerManagementPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-text-tertiary">ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໂດຍສານ...</div>}>
            <PassengerManagement />
        </Suspense>
    );
}

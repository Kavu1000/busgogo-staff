import PassengerManagement from "@/components/PassengerManagement";
import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";

export default function PassengerManagementPage() {
    return (
        <MainLayout>
            <Suspense fallback={<div className="p-8 text-center text-text-tertiary">ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໂດຍສານ...</div>}>
                <PassengerManagement />
            </Suspense>
        </MainLayout>
    );
}

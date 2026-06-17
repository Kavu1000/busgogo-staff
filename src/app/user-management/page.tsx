import UserManagement from "@/components/UserManagement";
import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";

export default function UserManagementPage() {
    return (
        <MainLayout>
            <Suspense fallback={<div className="p-8 text-center text-text-tertiary font-bold animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໃຊ້...</div>}>
                <UserManagement />
            </Suspense>
        </MainLayout>
    );
}

'use client';

import { Suspense } from 'react';
import PassengerManagementClient from './PassengerManagementClient';
import MainLayout from './MainLayout';
import { Users } from 'lucide-react';

// Loading fallback for the suspense boundary
function PassengerLoading() {
    return (
        <MainLayout>
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-blue-400 animate-pulse" />
                    <h3 className="mt-4 text-lg font-medium text-text-primary">ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໂດຍສານ...</h3>
                </div>
            </div>
        </MainLayout>
    );
}

export default function PassengerManagement() {
    return (
        <Suspense fallback={<PassengerLoading />}>
            <PassengerManagementClient />
        </Suspense>
    );
}

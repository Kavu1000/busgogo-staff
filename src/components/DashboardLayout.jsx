
import MainLayout from './MainLayout';

const DashboardLayout = ({ children, title }) => {
    return (
        <MainLayout>
            {/* If the old layout displayed the title, we can optionally display it here, 
                but our new pages handle their own headers. 
                For compatibility, we just render children. 
                If you want to show the title, uncomment the line below:
                {title && <h1 className="text-2xl font-bold text-text-primary mb-6">{title}</h1>}
            */}
            {children}
        </MainLayout>
    );
};

export default DashboardLayout;

import { Header } from "@/components/header";

// The dashboard shows per-user, URL-filtered live data (useSearchParams), so it
// renders on demand rather than being statically prerendered at build time.
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <main className="px-3 lg:px-14">
        {children}
      </main>
    </>
  );
};

export default DashboardLayout;
